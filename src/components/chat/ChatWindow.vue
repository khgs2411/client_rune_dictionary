<template>
	<div
		class="chat-window"
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
				<Button class="p-button-rounded p-button-text p-button-sm logout-button" icon="pi pi-sign-out" @click.stop="$emit('logout')" title="Logout" />
			</div>
		</div>

		<div class="window-content">
			<slot></slot>
		</div>
		
		<!-- Resize handles -->
		<div 
			v-for="handle in ['bottom-right', 'top-right']" 
			:key="handle"
			:class="['resize-handle', handle]" 
			@mousedown.prevent="startResizing(handle as ResizeHandle)" 
		></div>
	</div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import Button from "primevue/button";

type ResizeHandle = 'bottom-right' | 'top-right';
type Position = { x: number; y: number };
type Size = { width: number; height: number };

const props = defineProps<{
	storageKey: string;
	initialPosition?: Position;
	initialSize?: Size;
	minWidth?: number;
	minHeight?: number;
	containerRef?: HTMLElement | null;
}>();

defineEmits<{
	(e: "logout"): void;
}>();

// Refs
const windowRef = ref<HTMLElement | null>(null);
const position = useLocalStorage<Position>(`${props.storageKey}-position`, props.initialPosition ?? { x: 20, y: 20 });
const size = useLocalStorage<Size>(`${props.storageKey}-size`, props.initialSize ?? { width: 600, height: 500 });
const containerBounds = ref<DOMRect | null>(null);

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
		width: window.innerWidth,
		height: window.innerHeight
	};
	
	// Calculate max positions
	const maxX = bounds.left + bounds.width - windowRect.width;
	const maxY = bounds.top + bounds.height - windowRect.height;
	
	// Ensure window is within bounds
	position.value = {
		x: Math.max(bounds.left, Math.min(maxX, position.value.x)),
		y: Math.max(bounds.top, Math.min(maxY, position.value.y))
	};
}

// Mobile detection
const isMobile = computed(() => window.innerWidth <= 1024);

// Computed values for mobile positioning
//TODO: REMOVE ALL STYLING AND KEEP CACHE FUNCTIONALITY
const containerBottom = computed(() => {
	if (!containerBounds.value) return 0;
	// Account for iOS safe area insets
	const safeAreaBottom = typeof window !== 'undefined' ? 
		parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0') : 0;
	return window.innerHeight - containerBounds.value.bottom - safeAreaBottom;
});

// Dragging functionality
function startDragging(e: MouseEvent) {
	if (isMobile.value) return;
	
	isDragging.value = true;
	dragOffset.value = {
		x: e.clientX - position.value.x,
		y: e.clientY - position.value.y
	};
	
	updateContainerBounds();
	addEventListeners('drag');
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
			y: Math.max(bounds.top, Math.min(maxY, newY))
		};
	} else {
		// Constrain within viewport
		position.value = {
			x: Math.max(0, Math.min(window.innerWidth - size.value.width, newX)),
			y: Math.max(0, Math.min(window.innerHeight - size.value.height, newY))
		};
	}
}

function stopDragging() {
	isDragging.value = false;
	removeEventListeners('drag');
}

// Resizing functionality
function startResizing(handle: ResizeHandle) {
	if (isMobile.value) return;
	
	isResizing.value = true;
	resizeHandle.value = handle;
	
	updateContainerBounds();
	addEventListeners('resize');
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
	if (resizeHandle.value === 'bottom-right') {
		newWidth = Math.max(minWidth(), e.clientX - rect.left);
		newHeight = Math.max(minHeight(), e.clientY - rect.top);
	} else if (resizeHandle.value === 'top-right') {
		newWidth = Math.max(minWidth(), e.clientX - rect.left);
		
		const heightDiff = rect.top - e.clientY;
		newHeight = Math.max(minHeight(), rect.height + heightDiff);
		
		if (newHeight > minHeight()) {
			newY = e.clientY;
		}
	}
	
	// Apply container constraints if available
	if (bounds) {
		if (resizeHandle.value === 'bottom-right') {
			newWidth = Math.min(newWidth, bounds.left + bounds.width - rect.left);
			newHeight = Math.min(newHeight, bounds.top + bounds.height - rect.top);
		} else if (resizeHandle.value === 'top-right') {
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
	if (resizeHandle.value === 'top-right') {
		position.value = { ...position.value, y: newY };
	}
	
	ensureWithinBounds();
}

function stopResizing() {
	isResizing.value = false;
	resizeHandle.value = null;
	removeEventListeners('resize');
}

// Event listener management
function addEventListeners(type: 'drag' | 'resize') {
	if (type === 'drag') {
		document.addEventListener("mousemove", onDrag);
		document.addEventListener("mouseup", stopDragging);
	} else {
		document.addEventListener("mousemove", onResize);
		document.addEventListener("mouseup", stopResizing);
	}
}

function removeEventListeners(type: 'drag' | 'resize') {
	if (type === 'drag') {
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
	ensureWithinBounds();
	window.addEventListener('resize', handleWindowResize);
	
	// Update position for mobile on mount
	if (isMobile.value && containerBounds.value) {
		position.value = {
			x: containerBounds.value.left,
			y: containerBounds.value.bottom - size.value.height
		};
	}
});

// Update position when container bounds change
watch(containerBounds, (newBounds) => {
	if (isMobile.value && newBounds) {
		position.value = {
			x: newBounds.left,
			y: newBounds.bottom - size.value.height
		};
	}
}, { deep: true });

onUnmounted(() => {
	removeEventListeners('drag');
	removeEventListeners('resize');
	window.removeEventListener('resize', handleWindowResize);
});
</script>

<style scoped>
.chat-window {
	font-family: "Arial", sans-serif;
	min-width: v-bind("`${minWidth()}px`");
	min-height: v-bind("`${minHeight()}px`");
	z-index: 1000;
	display: flex;
	flex-direction: column;
	background: rgba(0, 0, 0, 0.8);
	border: 1px solid var(--p-gray-500);
	border-radius: 6px;
}

/* Mobile styles */
@media (max-width: 1024px) {
	.chat-window {
		position: fixed !important;
		left: 0 !important;
		bottom: 0 !important;
		top: auto !important;
		width: 100% !important;
		height: 50% !important;
		min-width: 100% !important;
		border-radius: 6px 6px 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		max-height: calc(100vh - 100px);
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: none;
	}
	
	.window-content {
		overflow-y: auto !important;
		-webkit-overflow-scrolling: touch;
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	.resize-handle {
		display: none !important;
	}
	
	.window-header {
		cursor: default;
		position: sticky;
		top: 0;
		z-index: 10;
	}
}

.window-header {
	cursor: move;
	user-select: none;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.8);
	border-bottom: 1px solid var(--p-gray-500);
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
	background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
	border-bottom-right-radius: 4px;
}

.resize-handle.top-right {
	right: 0;
	top: 0;
	cursor: ne-resize;
	background: linear-gradient(45deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
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
