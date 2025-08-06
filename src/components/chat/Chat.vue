<template>
	<ChatWindow :container-ref="containerRef" storageKey="chat" :minWidth="300" :minHeight="200" :initialSize="{ width: 600, height: 500 }" :collapsible="true" @logout="handleLogout">
		<template #title
			>Connected as: <span class="client-name">{{ client ? `(${client.name})` : "" }}</span></template
		>
		<template #controls>
			<div class="status-indicator" :class="status"></div>
		</template>

		<div class="chat-content">
			<div ref="messagesContainer" class="messages">
				<ChatMessage @action="handleAction" v-for="(message, index) in messages" :key="index" :message="message" />
			</div>

			<div class="input-area">
				<div class="input-wrapper">
					<InputGroup>
						<InputGroupAddon v-if="whisperMode" class="chat-element" @click="resetChatState" v-tooltip="'Click to clear whisper'">
							<div class="flex align-items-center gap-2 whisper-indicator pointer">
								<i :class="'pi pi-user'"></i>
								<span>Whisper: {{ targetEntity?.name }}</span>
							</div>
						</InputGroupAddon>
						<InputText
							v-model="inputMessage"
							@update:model-value="handleMacros"
							@keyup.enter="() => sendMessage()"
							class="chat-element"
							:class="{ 'whisper-indicator': whisperMode }"
							placeholder="Enter message..."
							ref="inputRef"
							:disabled="status !== 'OPEN'" />
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
import { computed, nextTick, onMounted, onUnmounted, Ref, ref, useTemplateRef, watch } from "vue";
import API from "../../api/app.api";
import useMessenger from "../../common/composables/useMessenger";
import useUtils from "../../common/composables/useUtils";
import ChatMessage from "../chat/ChatMessage.vue";
import ChatWindow from "../chat/ChatWindow.vue";
import useMatch from "../match/useMatch";

const props = defineProps<{
	client: WebsocketEntityData;
	containerRef?: HTMLElement | null;
	ws: ReturnType<typeof useWebSocket<WebsocketStructuredMessage>>;
	messages: WebsocketStructuredMessage[];
}>();
const emit = defineEmits<{
	(e: "logout"): void;
}>();

const api = new API();
const utils = useUtils();

const inputMessage: Ref<string> = ref(<string>"");
const messagesContainer = ref<HTMLElement | null>(null);
const mode: Ref<"broadcast" | "whisper"> = ref("broadcast");
const targetEntity = ref<WebsocketEntityData | null>(null);
const inputRef = useTemplateRef("inputRef");

const { status, send, close } = props.ws;
const messenger = useMessenger(send);

const whisperMode = computed(() => mode.value === "whisper");

function sendMessage(msg?: string) {
	messenger.sendMessage(props.client, msg || inputMessage.value, { type: whisperMode.value ? E_WebsocketMessageType.WHISPER : E_WebsocketMessageType.BROADCAST, target: targetEntity.value });
	inputMessage.value = "";
}

function resetChatState() {
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

function handleAction(action: { type: "whisper" | "match"; entity: WebsocketEntityData }) {
	switch (action.type) {
		case "whisper":
			handleWhisper(action.entity);
			break;
		case "match":
			handleMatch(action.entity);
			break;
	}
}

function handleMatch(entity: WebsocketEntityData) {
	utils.lib.Log("Matching with:", entity);
	const match$ = useMatch();
	//TODO: this should not be in the chat component
	match$.challenge(props.client, entity);
}

function handleWhisper(entity: WebsocketEntityData) {
	utils.lib.Log("Whispering to:", entity);
	mode.value = "whisper";
	setTargetEntity(entity);
	nextTick(() => {
		(inputRef.value as any).$el.focus();
	});
}

function setTargetEntity(entity: WebsocketEntityData | null) {
	targetEntity.value = entity;
}

function handleMacros(value: string | undefined) {
	if (value === "/s") {
		resetChatState();
		inputMessage.value = "";
	}
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
	props.messages,
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

<style lang="scss" scoped>
@use "../../assets/css/common.scss" as *;

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
	background: oklch(0 0 0 / 0.3);
}

.messages::-webkit-scrollbar-thumb {
	background: oklch(from var(--foreground) l c h / 0.2);
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

.input-area {
	padding: 0.5rem;
	background: var(--p-content-background);
	border-top: 1px solid var(--p-gray-500);
}

.input-wrapper {
	display: flex;
	gap: 0.5rem;
}

.chat-element {
	height: 38px;
}
</style>
