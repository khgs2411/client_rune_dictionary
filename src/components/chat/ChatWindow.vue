<template>
	<div
		class="game-window"
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
		
		<!-- Bottom-right resize handle -->
		<div class="resize-handle bottom-right" @mousedown.prevent="startResizing('bottom-right')"></div>
		
		<!-- Top-right resize handle -->
		<div class="resize-handle top-right" @mousedown.prevent="startResizing('top-right')"></div>
	</div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";
import Button from "primevue/button";

const props = defineProps<{
	storageKey: string;
	initialPosition?: { x: number; y: number };
	initialSize?: { width: number; height: number };
	minWidth?: number;
	minHeight?: number;
	containerRef?: HTMLElement | null;
}>();

defineEmits<{
	(e: "logout"): void;
}>();

const windowRef = ref<HTMLElement | null>(null);
const position = useLocalStorage(`${props.storageKey}-position`, props.initialPosition ?? { x: 20, y: 20 });
const size = useLocalStorage(`${props.storageKey}-size`, props.initialSize ?? { width: 600, height: 500 });
const containerBounds = ref<DOMRect | null>(null);

const isDragging = ref(false);
const isResizing = ref(false);
const resizeHandle = ref<'bottom-right' | 'top-right' | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

// Update container bounds when containerRef changes
watch(() => props.containerRef, updateContainerBounds, { immediate: true });

function updateContainerBounds() {
	if (props.containerRef) {
		containerBounds.value = props.containerRef.getBoundingClientRect();
	} else {
		containerBounds.value = null;
	}
}

// Ensure window is within container bounds
function ensureWithinBounds() {
	if (!windowRef.value) return;
	
	const windowRect = windowRef.value.getBoundingClientRect();
	
	if (containerBounds.value) {
		// If we have a container, constrain within its bounds
		const container = containerBounds.value;
		
		// Calculate max positions
		const maxX = container.left + container.width - windowRect.width;
		const maxY = container.top + container.height - windowRect.height;
		
		// Ensure window is within container bounds
		position.value = {
			x: Math.max(container.left, Math.min(maxX, position.value.x)),
			y: Math.max(container.top, Math.min(maxY, position.value.y)),
		};
	} else {
		// If no container, constrain within viewport
		const maxX = window.innerWidth - windowRect.width;
		const maxY = window.innerHeight - windowRect.height;
		
		position.value = {
			x: Math.max(0, Math.min(maxX, position.value.x)),
			y: Math.max(0, Math.min(maxY, position.value.y)),
		};
	}
}

// Dragging functionality
function startDragging(e: MouseEvent) {
	isDragging.value = true;
	dragOffset.value = {
		x: e.clientX - position.value.x,
		y: e.clientY - position.value.y,
	};
	
	// Update container bounds before starting drag
	updateContainerBounds();
	
	document.addEventListener("mousemove", onDrag);
	document.addEventListener("mouseup", stopDragging);
}

function onDrag(e: MouseEvent) {
	if (!isDragging.value) return;
	
	// Calculate new position
	const newX = e.clientX - dragOffset.value.x;
	const newY = e.clientY - dragOffset.value.y;
	
	if (containerBounds.value) {
		// If we have a container, constrain within its bounds
		const container = containerBounds.value;
		const windowRect = windowRef.value?.getBoundingClientRect();
		
		if (windowRect) {
			// Calculate max positions
			const maxX = container.left + container.width - windowRect.width;
			const maxY = container.top + container.height - windowRect.height;
			
			// Constrain position within container
			position.value = {
				x: Math.max(container.left, Math.min(maxX, newX)),
				y: Math.max(container.top, Math.min(maxY, newY)),
			};
		}
	} else {
		// If no container, constrain within viewport
		position.value = {
			x: Math.max(0, Math.min(window.innerWidth - size.value.width, newX)),
			y: Math.max(0, Math.min(window.innerHeight - size.value.height, newY)),
		};
	}
}

function stopDragging() {
	isDragging.value = false;
	document.removeEventListener("mousemove", onDrag);
	document.removeEventListener("mouseup", stopDragging);
}

// Resizing functionality
function startResizing(handle: 'bottom-right' | 'top-right') {
	isResizing.value = true;
	resizeHandle.value = handle;
	
	// Update container bounds before starting resize
	updateContainerBounds();
	
	document.addEventListener("mousemove", onResize);
	document.addEventListener("mouseup", stopResizing);
}

function onResize(e: MouseEvent) {
	if (!isResizing.value || !windowRef.value) return;
	const rect = windowRef.value.getBoundingClientRect();
	
	// Default values
	let newWidth = size.value.width;
	let newHeight = size.value.height;
	let newX = position.value.x;
	let newY = position.value.y;
	
	if (resizeHandle.value === 'bottom-right') {
		// Bottom-right resize: change width and height
		newWidth = Math.max(props.minWidth ?? 300, e.clientX - rect.left);
		newHeight = Math.max(props.minHeight ?? 200, e.clientY - rect.top);
	} else if (resizeHandle.value === 'top-right') {
		// Top-right resize: change width and y-position
		newWidth = Math.max(props.minWidth ?? 300, e.clientX - rect.left);
		
		// Calculate new height based on the difference in mouse Y position
		const heightDiff = rect.top - e.clientY;
		newHeight = Math.max(props.minHeight ?? 200, rect.height + heightDiff);
		
		// Only update Y position if the new height is valid
		if (newHeight > (props.minHeight ?? 200)) {
			newY = e.clientY;
		}
	}
	
	// If we have a container, constrain resize within its bounds
	if (containerBounds.value) {
		const container = containerBounds.value;
		
		// Ensure the window doesn't resize beyond container bounds
		if (resizeHandle.value === 'bottom-right') {
			newWidth = Math.min(newWidth, container.left + container.width - rect.left);
			newHeight = Math.min(newHeight, container.top + container.height - rect.top);
		} else if (resizeHandle.value === 'top-right') {
			newWidth = Math.min(newWidth, container.left + container.width - rect.left);
			
			// For top-right, ensure we don't resize beyond the top of the container
			const maxHeight = rect.bottom - container.top;
			if (newHeight > maxHeight) {
				newHeight = maxHeight;
				newY = container.top;
			}
			
			// Ensure Y position is not above container top
			newY = Math.max(newY, container.top);
		}
	}
	
	// Update size
	size.value = {
		width: newWidth,
		height: newHeight,
	};
	
	// Update position for top-right resize
	if (resizeHandle.value === 'top-right') {
		position.value = {
			x: newX,
			y: newY,
		};
	}
	
	// After resizing, ensure the window is still within bounds
	ensureWithinBounds();
}

function stopResizing() {
	isResizing.value = false;
	resizeHandle.value = null;
	document.removeEventListener("mousemove", onResize);
	document.removeEventListener("mouseup", stopResizing);
}

// Handle window resize to ensure window stays within bounds
function handleWindowResize() {
	updateContainerBounds();
	ensureWithinBounds();
}

onMounted(() => {
	// Initial check to ensure window is within bounds
	ensureWithinBounds();
	
	// Add window resize listener
	window.addEventListener('resize', handleWindowResize);
});

// Cleanup
onUnmounted(() => {
	document.removeEventListener("mousemove", onDrag);
	document.removeEventListener("mouseup", stopDragging);
	document.removeEventListener("mousemove", onResize);
	document.removeEventListener("mouseup", stopResizing);
	window.removeEventListener('resize', handleWindowResize);
});
</script>

<style scoped>
.game-window {
	font-family: "Arial", sans-serif;
	min-width: v-bind("`${props.minWidth ?? 300}px`");
	min-height: v-bind("`${props.minHeight ?? 200}px`");
	z-index: 1000;
	display: flex;
	flex-direction: column;
	background: rgba(0, 0, 0, 0.8);
	border: 1px solid #444;
	border-radius: 6px;
}

.window-header {
	cursor: move;
	user-select: none;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.8);
	border-bottom: 1px solid #444;
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
}

.window-title {
	color: #fff;
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
	cursor: se-resize;
}

.resize-handle.bottom-right {
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
	border-bottom-right-radius: 4px;
}

.resize-handle.top-right {
	right: 0;
	top: 0;
	background: linear-gradient(45deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
	border-top-right-radius: 4px;
	cursor: ne-resize;
}

.window-controls {
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.logout-button {
	color: #ccc;
	transition: color 0.2s;
}

.logout-button:hover {
	color: #fff;
}
</style>
