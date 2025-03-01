<template>
	<div class="message">
		<span class="timestamp">[{{ formattedTime }}]</span>
		<span class="sender" :class="{ 'system-indicator': isSystemMessage }">{{ sender }}:</span>
		<span class="message-content">{{ props.message.content.message }}</span>
	</div>
</template>

<script setup lang="ts">
import { WebsocketStructuredMessage } from "topsyde-utils";
import { computed } from "vue";

const props = defineProps<{
	message: WebsocketStructuredMessage;
}>();

const isSystemMessage = computed(() => {
	return props.message.type !== "message";
});

const sender = computed(() => {
	if (props.message.type === "message") {
		return props.message.content.client?.name || props.message.content.client?.id || "System";
	}
	return "System";
});

// Format the timestamp
const formattedTime = computed(() => {
	if (props.message.timestamp) {
		return new Date(props.message.timestamp).toLocaleTimeString();
	}
	return new Date().toLocaleTimeString();
});
</script>

<style scoped>
.message {
	margin-bottom: 0.25rem;
	line-height: 1.2;
}

.timestamp {
	color: var(--p-text-color);
	font-size: 0.8rem;
	margin-right: 0.5rem;
}

.sender {
	color: var(--p-primary-color);
	font-weight: 500;
	margin-right: 0.5rem;
}

.system-indicator {
	color: var(--p-blue-500);
	font-weight: 500;
	margin-right: 0.5rem;
}

.error-indicator {
	color: var(--p-error-color);
	font-weight: 500;
	margin-right: 0.5rem;
}

.message-content {
	color: var(--p-text-color);
}

.message.system .message-content {
	color: var(--p-blue-500);
	font-style: italic;
}

.message.error .message-content {
	color: var(--p-error-color);
}

.message.client\.connected .message-content,
.message.client\.join\.channel .message-content {
	color: var(--p-success-color);
	font-style: italic;
}
</style>
