<template>
	<ChatWindow storageKey="chat" :minWidth="300" :minHeight="200" :initialSize="{ width: 600, height: 500 }">
		<template #title>Chat {{ client ? `(${client.name})` : '' }}</template>
		<template #controls>
			<div class="status-indicator" :class="status"></div>
		</template>

		<div class="chat-content">
			<div ref="messagesContainer" class="messages">
				<ChatMessage v-for="(message, index) in messages" :key="index" :message="message" />
			</div>

			<div class="input-area">
				<div class="input-wrapper">
					<InputText v-model="inputMessage" @keyup.enter="sendMessage" placeholder="Enter message..." :disabled="status !== 'OPEN'" />
					<Button @click="sendMessage" :disabled="status !== 'OPEN' || !inputMessage.trim()"> Send </Button>
				</div>
			</div>
		</div>
	</ChatWindow>
</template>

<script setup lang="ts">
import { useWebSocket } from "@vueuse/core";
import { Button, InputText } from "primevue";
import { WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { nextTick, onMounted, onUnmounted, Ref, ref, toRefs, watch } from "vue";
import API from "../../api/app.api";
import useUtils from "../../common/composables/useUtils";
import useWebSocketInterface, { WEBSOCKET_URL } from "../../common/composables/useWebsocketInterface";
import ChatMessage from "../chat/ChatMessage.vue";
import ChatWindow from "../chat/ChatWindow.vue";

const props = defineProps<{
	client: WebsocketEntityData;
}>();

const api = new API();
const utils = useUtils();
const messages = ref<WebsocketStructuredMessage[]>([]);
const inputMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const wsOptions = useWebSocketInterface(ref(props.client), messages);
const ws = useWebSocket<WebsocketStructuredMessage>(WEBSOCKET_URL, wsOptions);
const { status } = toRefs(ws);

function sendMessage() {
	if (!inputMessage.value.trim()) return;

	// Format message according to WebsocketStructuredMessage interface
	const message: WebsocketStructuredMessage = {
		type: "message",
		content: inputMessage.value,
		channel: "global",
		timestamp: new Date().toISOString(),
		client: props.client
	};

	// Send message to server
	ws.send(JSON.stringify(message));
	inputMessage.value = "";
}

function scrollToBottom() {
	if (messagesContainer.value) {
		messagesContainer.value.scrollTo({
			top: messagesContainer.value.scrollHeight,
			behavior: "smooth",
		});
	}
}

async function ping() {
	try {
		await api.ping();
	} catch (error) {
		utils.lib.Warn("Error pinging API", error);
	}
}

watch(
	messages,
	() =>
		nextTick(() => {
			scrollToBottom();
		}),
	{ deep: true },
);

onMounted(() => {
	ping();
	utils.lib.Log("Chat mounted with client:", props.client);
});

onUnmounted(() => ws.close());
</script>

<style scoped>
.chat-content {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.messages {
	flex: 1;
	overflow-y: auto;
	padding: 0.5rem;
	margin-bottom: 0.5rem;
	color: #fff;
	font-size: 0.9rem;
	scroll-behavior: smooth;
}

.messages::-webkit-scrollbar {
	width: 8px;
}

.messages::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.3);
}

.messages::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 4px;
}

.status-indicator {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	margin-right: 4px;
}

.status-indicator.OPEN {
	background-color: #4caf50;
	box-shadow: 0 0 4px #4caf50;
}

.status-indicator.CONNECTING {
	background-color: #ffc107;
	box-shadow: 0 0 4px #ffc107;
}

.status-indicator.CLOSED {
	background-color: #f44336;
	box-shadow: 0 0 4px #f44336;
}

.input-area {
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.6);
	border-top: 1px solid #444;
}

.input-wrapper {
	display: flex;
	gap: 0.5rem;
}

.input-wrapper :deep(input) {
	flex: 1;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid #555;
	color: #fff;
	padding: 0.4rem 0.8rem;
	border-radius: 4px;
	font-size: 0.9rem;
}

.input-wrapper :deep(input:focus) {
	outline: none;
	border-color: #666;
}

.input-wrapper :deep(input::placeholder) {
	color: #666;
}

.input-wrapper :deep(button) {
	background: rgba(60, 60, 60, 0.9);
	border: 1px solid #555;
	color: #fff;
	padding: 0.4rem 1rem;
	cursor: pointer;
	border-radius: 4px;
	font-size: 0.9rem;
	transition: background 0.2s;
}

.input-wrapper :deep(button:hover) {
	background: rgba(80, 80, 80, 0.9);
}

.input-wrapper :deep(button:disabled) {
	background: rgba(40, 40, 40, 0.9);
	color: #666;
	cursor: not-allowed;
}
</style>
