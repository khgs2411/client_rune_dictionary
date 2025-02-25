<template>
	<div class="chat">
		<div class="status" :class="status">
			{{ status }}
		</div>

		<div ref="messagesContainer" class="messages">
			<div v-for="(message, index) in messages" :key="index" class="message">
				{{ message }}
			</div>
		</div>

		<div class="input-area">
			{{ status !== "OPEN" }}
			<InputText v-model="inputMessage" @keyup.enter="sendMessage" placeholder="Type a message..." :disabled="status !== 'OPEN'" />
			<Button @click="sendMessage" :disabled="status !== 'OPEN'"> Send </Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useWebSocket } from "@vueuse/core";
import { InputText, Button } from "primevue";

const messages = ref<string[]>([]);
const inputMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

// Function to scroll to bottom
const scrollToBottom = () => {
	if (messagesContainer.value) {
		messagesContainer.value.scrollTo({
			top: messagesContainer.value.scrollHeight,
			behavior: 'smooth'
		});
	}
};

// Watch messages array for changes and scroll to bottom
watch(messages, () => {
	// Use nextTick to ensure DOM is updated
	nextTick(() => {
		scrollToBottom();
	});
}, { deep: true });

const { status, data, send } = useWebSocket(`ws://${import.meta.env.VITE_WS_HOST}:3000`, {
	autoReconnect: {
		retries: 3,
		delay: 1000,
		onFailed() {
			console.error("Failed to connect WebSocket after 3 retries");
		},
	},
	heartbeat: {
		message: "ping",
		interval: 1000,
		pongTimeout: 1000,
	},
	onConnected: () => {
		console.log("Connected!");
	},
	onDisconnected: () => {
		console.log("Disconnected!");
	},
	onMessage: () => {
		// When we receive a message, add it to our messages array
		console.log(data.value);
		if (data.value) {
			messages.value.push(data.value);
		}
	},
});

const sendMessage = () => {
	console.log(inputMessage.value)
	if (inputMessage.value.trim()) {
		send(inputMessage.value);
		inputMessage.value = "";
	}
};
</script>

<style scoped>
.chat {
	max-width: 600px;
	margin: 0 auto;
	padding: 1rem;
}

.status {
	padding: 0.5rem;
	text-align: center;
	color: white;
	margin-bottom: 1rem;
}

.status.OPEN {
	background-color: #00c851;
}
.status.CONNECTING {
	background-color: #ffbb33;
}
.status.CLOSED {
	background-color: #ff4444;
}

.messages {
	height: 400px;
	overflow-y: auto;
	border: 1px solid #ccc;
	padding: 1rem;
	margin-bottom: 1rem;
	scroll-behavior: smooth;
}

.message {
	margin-bottom: 0.5rem;
	padding: 0.5rem;
	border-radius: 4px;
}

.input-area {
	display: flex;
	gap: 0.5rem;
}

input {
	flex: 1;
	padding: 0.5rem;
}

button {
	padding: 0.5rem 1rem;
}
</style>
