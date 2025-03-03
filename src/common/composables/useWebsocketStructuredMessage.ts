import { E_WebsocketMessageType, Lib, WebsocketStructuredMessage } from "topsyde-utils";
import { computed } from "vue";

const useWebsocketStructuredMessage = (wsm: WebsocketStructuredMessage) => {
	
	const room = computed(() => {
		return Lib.ToPascalCase(wsm.channel ?? "server");
	});

	const client = computed(() => {
		return wsm.client ?? wsm.content.client;
	});

	const type = computed(() => {
		return wsm.type;
	});

	const content = computed(() => {
		return wsm.content;
	});

	const isMessage = computed(() => {
		return type.value === E_WebsocketMessageType.MESSAGE || type.value === E_WebsocketMessageType.WHISPER || type.value === E_WebsocketMessageType.BROADCAST;
	});

	const isWhisper = computed(() => {
		return type.value === E_WebsocketMessageType.WHISPER;
	});

	const isBroadcast = computed(() => {
		return type.value === E_WebsocketMessageType.BROADCAST;
	});

	const isPrompt = computed(() => {
		return type.value === E_WebsocketMessageType.PROMPT;
	});

	const isSystemMessage = computed(() => {
		return type.value == E_WebsocketMessageType.SYSTEM;
	});

	const isErrorMessage = computed(() => {
		return type.value === E_WebsocketMessageType.ERROR;
	});

	const isGenericMessage = computed(() => {
		return type.value.includes(".");
	});

	const sender = computed(() => {
		if (!isGenericMessage.value) {
			return client.value?.name || client.value?.id || "System";
		}
		return "System";
	});

	const isHeartbeat = computed(() => {
		Lib.Log(`[${wsm.url}] - Heartbeat received`);
		return type.value === "pong";
	});

	const formattedTime = computed(() => {
		if (wsm.timestamp) {
			return new Date(wsm.timestamp).toLocaleTimeString();
		}
		return "???";
	});

	return { data: wsm, room, client, type, content, isSystemMessage, isErrorMessage, isGenericMessage, sender, formattedTime, isMessage, isWhisper, isBroadcast, isPrompt, isHeartbeat };
};

export default useWebsocketStructuredMessage;
