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

	// Format the timestamp
	const formattedTime = computed(() => {
		if (wsm.timestamp) {
			return new Date(wsm.timestamp).toLocaleTimeString();
		}
		return new Date().toLocaleTimeString();
	});

	return { room, client, type, content, isSystemMessage, isErrorMessage, isGenericMessage, sender, formattedTime };
};

export default useWebsocketStructuredMessage;
