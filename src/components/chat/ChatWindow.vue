<template>
	<div class="chat-container" :class="{ collapsed: isCollapsed }">
		<!-- Toggle Button -->
		<Button
			v-if="collapsible && isCollapsed"
			class="chat-toggle-btn"
			:icon="isCollapsed ? 'pi pi-comments' : 'pi pi-times'"
			severity="secondary"
			rounded
			@click="toggleCollapse"
			v-tooltip.left="isCollapsed ? 'Open Chat' : 'Close Chat'"
			:badge="isCollapsed && unreadCount > 0 ? String(unreadCount) : undefined"
			badgeSeverity="danger" />
		
		<!-- Chat Window -->
		<div
			v-show="!isCollapsed"
			class="chat-window"
			:class="{ collapsible: collapsible }"
			:style="{
				position: 'fixed',
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: `${size.width}px`,
				height: `${size.height}px`,
			}"
			ref="windowRef">
			<div class="window-header" @mousedown="startDragging">
				<div class="window-title">
					<slot name="title">Window</slot>
				</div>
				<div class="window-controls">
					<slot name="controls"></slot>
					<Button v-if="collapsible" class="p-button-rounded p-button-text p-button-sm" icon="pi pi-minus" @click.stop="toggleCollapse" title="Minimize" />
					<Button class="p-button-rounded p-button-text p-button-sm logout-button" icon="pi pi-sign-out" @click.stop="$emit('logout')" title="Logout" />
				</div>
			</div>

			<div class="window-content">
				<slot></slot>
			</div>

			<!-- Resize handles -->
			<div v-for="handle in ['bottom-right', 'top-right']" :key="handle" :class="['resize-handle', handle]" @mousedown.prevent="startResizing(handle as ResizeHandle)"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import Button from "primevue/button";
import useDevice from "../../common/composables/useDevice";

type ResizeHandle = "bottom-right" | "top-right";
type Position = { x: number; y: number };
type Size = { width: number; height: number };

const props = defineProps<{
	storageKey: string;
	initialPosition?: Position;
	initialSize?: Size;
	minWidth?: number;
	minHeight?: number;
	containerRef?: HTMLElement | null;
	collapsible?: boolean;
}>();

defineEmits<{
	(e: "logout"): void;
}>();

// Refs
const windowRef = ref<HTMLElement | null>(null);
const position = useLocalStorage<Position>(`${props.storageKey}-position`, props.initialPosition ?? { x: 20, y: 20 });
const size = useLocalStorage<Size>(`${props.storageKey}-size`, props.initialSize ?? { width: 600, height: 500 });
const containerBounds = ref<DOMRect | null>(null);
const isCollapsed = ref(props.collapsible ? true : false);
const unreadCount = ref(0);

// State
const isDragging = ref(false);
const isResizing = ref(false);
const resizeHandle = ref<ResizeHandle | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

// Minimum dimensions
const minWidth = () => props.minWidth ?? 300;
const minHeight = () => props.minHeight ?? 200;

// Container bounds management
watch(() => props.containerRef, updateContainerBounds, { immediate: true });

function updateContainerBounds() {
	containerBounds.value = props.containerRef?.getBoundingClientRect() ?? null;
}

// Boundary enforcement
function ensureWithinBounds() {
	if (!windowRef.value) return;

	const windowRect = windowRef.value.getBoundingClientRect();
	const bounds = containerBounds.value ?? {
		left: 0,
		top: 0,
		width: device.screenWidth.value,
		height: device.screenHeight.value,
	};

	// Calculate max positions
	const maxX = bounds.left + bounds.width - windowRect.width;
	const maxY = bounds.top + bounds.height - windowRect.height;

	// Ensure window is within bounds
	position.value = {
		x: Math.max(bounds.left, Math.min(maxX, position.value.x)),
		y: Math.max(bounds.top, Math.min(maxY, position.value.y)),
	};
}

// Device detection using the new composable with custom 1024px mobile threshold for chat window
const device = useDevice(1024); // ChatWindow considers up to 1024px as mobile for better UX
const { isMobile, isTablet } = device;

// Computed values for mobile positioning
const containerBottom = computed(() => {
	if (!containerBounds.value) return 0;
	return device.screenHeight.value - containerBounds.value.bottom;
});

// Toggle collapse
function toggleCollapse() {
	isCollapsed.value = !isCollapsed.value;
}

// Dragging functionality
function startDragging(e: MouseEvent) {
	if (isMobile.value) return;

	isDragging.value = true;
	dragOffset.value = {
		x: e.clientX - position.value.x,
		y: e.clientY - position.value.y,
	};

	updateContainerBounds();
	addEventListeners("drag");
}

function onDrag(e: MouseEvent) {
	if (!isDragging.value) return;

	const newX = e.clientX - dragOffset.value.x;
	const newY = e.clientY - dragOffset.value.y;

	const bounds = containerBounds.value;
	const windowRect = windowRef.value?.getBoundingClientRect();

	if (bounds && windowRect) {
		// Constrain within container bounds
		const maxX = bounds.left + bounds.width - windowRect.width;
		const maxY = bounds.top + bounds.height - windowRect.height;

		position.value = {
			x: Math.max(bounds.left, Math.min(maxX, newX)),
			y: Math.max(bounds.top, Math.min(maxY, newY)),
		};
	} else {
		// Constrain within viewport using device screen dimensions
		position.value = {
			x: Math.max(0, Math.min(device.screenWidth.value - size.value.width, newX)),
			y: Math.max(0, Math.min(device.screenHeight.value - size.value.height, newY)),
		};
	}
}

function stopDragging() {
	isDragging.value = false;
	removeEventListeners("drag");
}

// Resizing functionality
function startResizing(handle: ResizeHandle) {
	if (isMobile.value) return;

	isResizing.value = true;
	resizeHandle.value = handle;

	updateContainerBounds();
	addEventListeners("resize");
}

function onResize(e: MouseEvent) {
	if (!isResizing.value || !windowRef.value) return;

	const rect = windowRef.value.getBoundingClientRect();
	const bounds = containerBounds.value;

	// Default values
	let newWidth = size.value.width;
	let newHeight = size.value.height;
	let newY = position.value.y;

	// Handle-specific resize logic
	if (resizeHandle.value === "bottom-right") {
		newWidth = Math.max(minWidth(), e.clientX - rect.left);
		newHeight = Math.max(minHeight(), e.clientY - rect.top);
	} else if (resizeHandle.value === "top-right") {
		newWidth = Math.max(minWidth(), e.clientX - rect.left);

		const heightDiff = rect.top - e.clientY;
		newHeight = Math.max(minHeight(), rect.height + heightDiff);

		if (newHeight > minHeight()) {
			newY = e.clientY;
		}
	}

	// Apply container constraints if available
	if (bounds) {
		if (resizeHandle.value === "bottom-right") {
			newWidth = Math.min(newWidth, bounds.left + bounds.width - rect.left);
			newHeight = Math.min(newHeight, bounds.top + bounds.height - rect.top);
		} else if (resizeHandle.value === "top-right") {
			newWidth = Math.min(newWidth, bounds.left + bounds.width - rect.left);

			const maxHeight = rect.bottom - bounds.top;
			if (newHeight > maxHeight) {
				newHeight = maxHeight;
				newY = bounds.top;
			}

			newY = Math.max(newY, bounds.top);
		}
	}

	// Update size
	size.value = { width: newWidth, height: newHeight };

	// Update position for top-right resize
	if (resizeHandle.value === "top-right") {
		position.value = { ...position.value, y: newY };
	}

	ensureWithinBounds();
}

function stopResizing() {
	isResizing.value = false;
	resizeHandle.value = null;
	removeEventListeners("resize");
}

// Event listener management
function addEventListeners(type: "drag" | "resize") {
	if (type === "drag") {
		document.addEventListener("mousemove", onDrag);
		document.addEventListener("mouseup", stopDragging);
	} else {
		document.addEventListener("mousemove", onResize);
		document.addEventListener("mouseup", stopResizing);
	}
}

function removeEventListeners(type: "drag" | "resize") {
	if (type === "drag") {
		document.removeEventListener("mousemove", onDrag);
		document.removeEventListener("mouseup", stopDragging);
	} else {
		document.removeEventListener("mousemove", onResize);
		document.removeEventListener("mouseup", stopResizing);
	}
}

// Window resize handling
function handleWindowResize() {
	updateContainerBounds();
	ensureWithinBounds();
}

// Lifecycle hooks
onMounted(() => {
	window.addEventListener("resize", handleWindowResize);
	setTimeout(() => {
		ensureWithinBounds();

		// Update position for mobile on mount
		if (isMobile.value && containerBounds.value) {
			position.value = {
				x: containerBounds.value.left,
				y: containerBounds.value.bottom - size.value.height,
			};
		}
	});
});

// Update position when container bounds change
watch(
	containerBounds,
	(newBounds) => {
		if (isMobile.value && newBounds) {
			position.value = {
				x: newBounds.left,
				y: newBounds.bottom - size.value.height,
			};
		}
	},
	{ deep: true },
);

onUnmounted(() => {
	removeEventListeners("drag");
	removeEventListeners("resize");
	window.removeEventListener("resize", handleWindowResize);
});
</script>

<style scoped>
.chat-container {
	position: fixed;
	right: 0;
	top: 0;
	bottom: 0;
	pointer-events: none;
	z-index: 1000;
}

.chat-container > * {
	pointer-events: auto;
}

.chat-container.collapsed .chat-window {
	display: none;
}

.chat-toggle-btn {
	position: fixed !important;
	right: 20px;
	bottom: 80px;
	z-index: 1002;
	background: var(--p-content-background) !important;
	border: 1px solid var(--p-surface-border) !important;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
	opacity: 1 !important;
	visibility: visible !important;
	color: var(--p-primary-color) !important;
	transition: all 0.2s ease !important;
	
	&:hover {
		background: var(--p-primary-color) !important;
		color: var(--p-content-background) !important;
		border-color: var(--p-primary-color) !important;
	}
	
	::v-deep(.p-button-icon) {
		color: inherit !important;
	}
}

.chat-window {
	font-family: "Arial", sans-serif;
	min-width: v-bind("`${minWidth()}px`");
	min-height: v-bind("`${minHeight()}px`");
	z-index: 1000;
	display: flex;
	flex-direction: column;
	background: var(--p-content-background);
	outline: 1px solid var(--p-primary-color);
	border-radius: 6px;
}


/* Mobile styles */
@media (max-width: 1024px) {
	.chat-toggle-btn {
		bottom: 20px;
		right: 20px;
	}
	
	.chat-window {
		display: none;
		position: fixed !important;
		left: v-bind("containerBounds ? `${containerBounds.left}px` : '0'") !important;
		bottom: v-bind("containerBounds ? `${containerBottom}px` : '0'") !important;
		top: auto !important;
		width: v-bind("containerBounds ? `${containerBounds.width}px` : '100%'") !important;
		height: 25% !important;
		min-width: v-bind("containerBounds ? `${containerBounds.width}px` : '100%'") !important;
		border-radius: 6px 6px 0 0;
		max-height: calc(100vh - 150px);
	}

	.resize-handle {
		display: none !important;
	}

	.window-header {
		cursor: default;
	}
}

.window-header {
	cursor: move;
	user-select: none;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	background: var(--p-content-background);
	border-bottom: 1px solid var(--p-primary-color);
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
}

.window-title {
	color: var(--p-text-color);
	font-size: 0.9rem;
	font-weight: 500;
	letter-spacing: 0.5px;
}

.window-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.resize-handle {
	position: absolute;
	width: 15px;
	height: 15px;
}

.resize-handle.bottom-right {
	right: 0;
	bottom: 0;
	cursor: se-resize;
	background: linear-gradient(135deg, transparent 50%, var(--p-gray-500) 50%);
	border-bottom-right-radius: 4px;
}

.resize-handle.top-right {
	right: 0;
	top: 0;
	cursor: ne-resize;
	background: linear-gradient(45deg, transparent 50%, var(--p-gray-500) 50%);
	border-top-right-radius: 4px;
}

.window-controls {
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.logout-button {
	color: var(--p-text-color);
	transition: color 0.2s;
}

.logout-button:hover {
	color: var(--p-text-color);
}
</style>
