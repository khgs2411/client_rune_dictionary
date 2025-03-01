<template>
	<div class="message">
		<span class="timestamp">[{{ formattedTime }}]</span>
		<span class="sender">{{ props.message.content.client?.name || props.message.content.client?.id || "System" }}:</span>
		<span class="message-content">{{ props.message.content.message }}</span>
	</div>
</template>

<script setup lang="ts">
import { WebsocketStructuredMessage } from "topsyde-utils";
import { computed } from "vue";

const props = defineProps<{
	message: WebsocketStructuredMessage;
}>();

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
	color: #888;
	font-size: 0.8rem;
	margin-right: 0.5rem;
}

.sender {
	color: #4caf50;
	font-weight: 500;
	margin-right: 0.5rem;
}

.system-indicator {
	color: #2196f3;
	font-weight: 500;
	margin-right: 0.5rem;
}

.error-indicator {
	color: #f44336;
	font-weight: 500;
	margin-right: 0.5rem;
}

.message-content {
	color: #fff;
}

.message.system .message-content {
	color: #90caf9;
	font-style: italic;
}

.message.error .message-content {
	color: #ef9a9a;
}

.message.client\.connected .message-content,
.message.client\.join\.channel .message-content {
	color: #81c784;
	font-style: italic;
}
</style>
