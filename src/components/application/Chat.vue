<template>
	<ChatWindow :container-ref="containerRef" storageKey="chat" :minWidth="300" :minHeight="200" :initialSize="{ width: 600, height: 500 }" @logout="handleLogout">
		<template #title
			>Connected as: <span class="client-name">{{ client ? `(${client.name})` : "" }}</span></template
		>
		<template #controls>
			<div class="status-indicator" :class="status"></div>
		</template>

		<div class="chat-content">
			<div ref="messagesContainer" class="messages">
				<ChatMessage @whisper="handleWhisper" @match="handleMatch" v-for="(message, index) in messages" :key="index" :message="message" />
			</div>

			<div class="input-area">
				<div class="input-wrapper">
					<InputGroup>
						<InputGroupAddon v-if="whisperMode">
							<div class="flex align-items-center gap-2 whisper-indicator">
								<i class="pi pi-user"></i>
								<span>Whisper: {{ targetEntity?.name }}</span>
							</div>
						</InputGroupAddon>
						<InputText v-model="inputMessage as string" @keyup.enter="() => sendMessage()" :class="{ 'whisper-indicator': whisperMode }" placeholder="Enter message..." :disabled="status !== 'OPEN'" />
					</InputGroup>
					<Button @click="() => sendMessage()" :disabled="status !== 'OPEN' || !inputMessage.trim()"> Send </Button>
				</div>
			</div>
		</div>
	</ChatWindow>
</template>

<script setup lang="ts">
import { useWebSocket } from "@vueuse/core";
import { Button, InputGroup, InputGroupAddon, InputText } from "primevue";
import { E_WebsocketMessageType, WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { computed, nextTick, onMounted, onUnmounted, Ref, ref, watch } from "vue";
import API from "../../api/app.api";
import useMatch from "../../common/composables/useMatch";
import useMessenger from "../../common/composables/useMessenger";
import useUtils from "../../common/composables/useUtils";
import useWebSocketInterface, { WEBSOCKET_URL } from "../../common/composables/useWebsocketInterface";
import ChatMessage from "../chat/ChatMessage.vue";
import ChatWindow from "../chat/ChatWindow.vue";

const props = defineProps<{
	client: WebsocketEntityData;
	containerRef?: HTMLElement | null;
}>();
const emit = defineEmits<{
	(e: "logout"): void;
}>();

const api = new API();
const utils = useUtils();
const messages = ref<WebsocketStructuredMessage[]>([]);
const inputMessage: Ref<string> = ref(<string>"");
const messagesContainer = ref<HTMLElement | null>(null);
const wsOptions = useWebSocketInterface(ref(props.client), messages);
const { status, send, close } = useWebSocket<WebsocketStructuredMessage>(WEBSOCKET_URL, wsOptions);
const messenger = useMessenger(send);
const mode: Ref<"broadcast" | "whisper"> = ref("broadcast");
const targetEntity = ref<WebsocketEntityData | null>(null);

const whisperMode = computed(() => mode.value === "whisper");


function sendMessage(msg?: string) {
	messenger.sendMessage(props.client, msg || inputMessage.value, { type: whisperMode.value ? E_WebsocketMessageType.WHISPER : E_WebsocketMessageType.BROADCAST, target: targetEntity.value });
	inputMessage.value = "";
	mode.value = "broadcast";
	setTargetEntity(null);
}

function handleLogout() {
	close();
	emit("logout");
	utils.lib.Log("User logged out:", props.client);
}

function scrollToBottom() {
	if (messagesContainer.value) {
		messagesContainer.value.scrollTo({
			top: messagesContainer.value.scrollHeight,
			behavior: "smooth",
		});
	}
}

function handleWhisper(entity: WebsocketEntityData) {
	utils.lib.Log("Whispering to:", entity);
	mode.value = "whisper";
	setTargetEntity(entity);
}

function setTargetEntity(entity: WebsocketEntityData | null) {
	targetEntity.value = entity;
}

function handleMatch(entity: WebsocketEntityData) {
	utils.lib.Log("Matching with:", entity);
	const match$ = useMatch();
	match$.challenge(props.client, entity);
}

async function ping() {
	await api
		.ping()
		.then(() => {
			sendMessage("Hello, world!");
		})
		.catch((error) => {
			utils.toast.error("Error pinging API: " + error);
		});
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

onUnmounted(() => close());
</script>

<style scoped>
.chat-content {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.client-name {
	color: var(--p-primary-color);
}

.messages {
	flex: 1;
	overflow-y: auto;
	padding: 0.5rem;
	margin-bottom: 0.5rem;
	color: var(--p-text-color);
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
	background-color: var(--p-green-500);
	box-shadow: 0 0 4px var(--p-green-500);
}

.status-indicator.CONNECTING {
	background-color: var(--p-yellow-500);
	box-shadow: 0 0 4px var(--p-yellow-500);
}

.status-indicator.CLOSED {
	background-color: var(--p-red-500);
	box-shadow: 0 0 4px var(--p-red-500);
}

.whisper-indicator {
	color: var(--p-purple-500);
}

.input-area {
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.6);
	border-top: 1px solid var(--p-gray-500);
}

.input-wrapper {
	display: flex;
	gap: 0.5rem;
}

.input-wrapper :deep(input) {
	flex: 1;
	background: rgba(0, 0, 0, 0.6);
	border: 1px solid var(--p-gray-500);
	color: var(--p-text-color);
	padding: 0.4rem 0.8rem;
	border-radius: 4px;
	font-size: 0.9rem;
}

.input-wrapper :deep(input:focus) {
	outline: none;
	border-color: var(--p-gray-500);
}

.input-wrapper :deep(input::placeholder) {
	color: var(--p-gray-500);
}

.input-wrapper :deep(button) {
	background: rgba(60, 60, 60, 0.9);
	border: 1px solid var(--p-gray-500);
	color: var(--p-text-color);
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
	color: var(--p-gray-500);
	cursor: not-allowed;
}
</style>
