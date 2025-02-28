<template>
	<div class="chat">
		<div class="status" :class="status">
			{{ status }}
		</div>
		API Response: {{ responseFromApi }}
		<div ref="messagesContainer" class="messages">
			<div v-for="(message, index) in messages" :key="index" class="message">
				{{ message }}
			</div>
		</div>

		<div class="input-area">
			<InputText v-model="inputMessage" @keyup.enter="sendMessage" placeholder="Type a message..." :disabled="status !== 'OPEN'" />
			<Button @click="sendMessage" :disabled="status !== 'OPEN'"> Send </Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWebSocket } from "@vueuse/core";
import { Button, InputText } from "primevue";
import { WebsocketStructuredMessage } from "topsyde-utils";
import { nextTick, onMounted, onUnmounted, ref, toRefs, watch } from "vue";
import AppAPI from "../../api/app.api";
import useWebSocketInterface, { WEBSOCKET_URL } from "../../common/composables/useWebsocketInterface";
const messages = ref<string[]>([]);
const inputMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const responseFromApi = ref<string>("");

// Use the WebSocket interface composable
const wsOptions = useWebSocketInterface(messages);
const ws = useWebSocket<WebsocketStructuredMessage>(WEBSOCKET_URL, wsOptions);
const { status } = toRefs(ws);

function sendMessage() {
	if (!inputMessage.value.trim()) return;
	const message: WebsocketStructuredMessage = {
		type: "message",
		content: inputMessage.value,
	};
	ws.send(JSON.stringify(message));
	inputMessage.value = "";
}

// Function to scroll to bottom
function scrollToBottom() {
	if (messagesContainer.value) {
		messagesContainer.value.scrollTo({
			top: messagesContainer.value.scrollHeight,
			behavior: "smooth",
		});
	}
}

watch(
	messages,
	() => {
		// Use nextTick to ensure DOM is updated
		nextTick(() => {
			scrollToBottom();
		});
	},
	{ deep: true },
);

onMounted(() => {
	const api = new AppAPI();
	api.ping()
		.then((res) => {
			responseFromApi.value = (res as any).data;
		})
		.catch((err) => {
			console.error(err);
		});
});

onUnmounted(() => {
	ws.close();
});
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
