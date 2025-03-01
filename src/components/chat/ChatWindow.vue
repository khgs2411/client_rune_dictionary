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
		ref="windowRef"
	>
		<div class="window-header" @mousedown="startDragging">
			<div class="window-title">
				<slot name="title">Window</slot>
			</div>
			<div class="window-controls">
				<slot name="controls"></slot>
			</div>
		</div>

		<div class="window-content">
			<slot></slot>
		</div>
		<div class="resize-handle" @mousedown.prevent="startResizing"></div>
	</div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { onUnmounted, ref } from "vue";

const props = defineProps<{
	storageKey: string;
	initialPosition?: { x: number; y: number };
	initialSize?: { width: number; height: number };
	minWidth?: number;
	minHeight?: number;
}>();

const windowRef = ref<HTMLElement | null>(null);
const position = useLocalStorage(`${props.storageKey}-position`, props.initialPosition ?? { x: 20, y: 20 });
const size = useLocalStorage(`${props.storageKey}-size`, props.initialSize ?? { width: 600, height: 500 });

const isDragging = ref(false);
const isResizing = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

// Dragging functionality
function startDragging(e: MouseEvent) {
	isDragging.value = true;
	dragOffset.value = {
		x: e.clientX - position.value.x,
		y: e.clientY - position.value.y
	};
	document.addEventListener('mousemove', onDrag);
	document.addEventListener('mouseup', stopDragging);
}

function onDrag(e: MouseEvent) {
	if (!isDragging.value) return;
	position.value = {
		x: Math.max(0, Math.min(window.innerWidth - size.value.width, e.clientX - dragOffset.value.x)),
		y: Math.max(0, Math.min(window.innerHeight - size.value.height, e.clientY - dragOffset.value.y))
	};
}

function stopDragging() {
	isDragging.value = false;
	document.removeEventListener('mousemove', onDrag);
	document.removeEventListener('mouseup', stopDragging);
}

// Resizing functionality
function startResizing(e: MouseEvent) {
	isResizing.value = true;
	document.addEventListener('mousemove', onResize);
	document.addEventListener('mouseup', stopResizing);
}

function onResize(e: MouseEvent) {
	if (!isResizing.value || !windowRef.value) return;
	const rect = windowRef.value.getBoundingClientRect();
	const newWidth = Math.max(props.minWidth ?? 300, e.clientX - rect.left);
	const newHeight = Math.max(props.minHeight ?? 200, e.clientY - rect.top);
	
	size.value = {
		width: newWidth,
		height: newHeight
	};
}

function stopResizing() {
	isResizing.value = false;
	document.removeEventListener('mousemove', onResize);
	document.removeEventListener('mouseup', stopResizing);
}

// Cleanup
onUnmounted(() => {
	document.removeEventListener('mousemove', onDrag);
	document.removeEventListener('mouseup', stopDragging);
	document.removeEventListener('mousemove', onResize);
	document.removeEventListener('mouseup', stopResizing);
});
</script>

<style scoped>
.game-window {
	font-family: "Arial", sans-serif;
	min-width: v-bind('`${props.minWidth ?? 300}px`');
	min-height: v-bind('`${props.minHeight ?? 200}px`');
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
	text-transform: uppercase;
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
	right: 0;
	bottom: 0;
	width: 15px;
	height: 15px;
	cursor: se-resize;
	background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
	border-bottom-right-radius: 4px;
}
</style> 