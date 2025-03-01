import { UseWebSocketOptions } from "@vueuse/core";
import { Lib, WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { ref, Ref } from "vue";
import { AutoReconnect, Heartbeat } from "../types/websocket.types";

const PING_PONG_INTERVAL = 20;
export const WEBSOCKET_URL = `ws://${import.meta.env.VITE_WS_HOST || "localhost"}:3000`;

const useWebSocketInterface = (client: Ref<WebsocketEntityData | null>, messages: Ref<WebsocketStructuredMessage[]>): UseWebSocketOptions => {
	const heartbeatOptions: Ref<Heartbeat> = ref({
		interval: PING_PONG_INTERVAL * 1000,
		pongTimeout: PING_PONG_INTERVAL * 1000,
		message: "ping",
	});

	const autoReconnectOptions: Ref<AutoReconnect> = ref({
		retries: 20,
		delay: 1000,
		onFailed: handleReconnectFailed,
	});

	function handleMessage(ws: WebSocket, event: MessageEvent) {
		Lib.Log(`[${ws.url}] - Received message:`, event.data);
		const data: WebsocketStructuredMessage = JSON.parse(event.data);
		Lib.Log(`[${ws.url}] - Parsed message:`, data);
		if (handleHeartbeat(data)) return;
		messages.value.push(data);
	}

	function handleConnected(ws: WebSocket) {
		Lib.Log(`[${ws.url}] - Connected!`, ws.readyState);

		const clientName = client.value?.name || "Guest";

		messages.value.push({
			type: "system",
			content: {
				message: `Connected to chat server as ${clientName}`,
			},
			timestamp: new Date().toISOString(),
		});
	}

	function handleDisconnected(ws: WebSocket, event: CloseEvent) {
		Lib.Log(`[${ws.url}] - Disconnected!`, ws.readyState, event);
		messages.value.push({
			type: "system",
			content: {
				message: `Disconnected from chat server (code: ${event.code})`,
				client: {
					id: client.value?.id || "Guest",
					name: "Guest",
				},
			},
			timestamp: new Date().toISOString(),
		});
	}

	function handleError(ws: WebSocket, event: Event) {
		Lib.Warn(`[${ws.url}] - WebSocket error:`, event);
		messages.value.push({
			type: "error",
			content: "Error with chat connection",
			timestamp: new Date().toISOString(),
		});
	}

	function handleReconnectFailed() {
		Lib.Warn("Failed to connect WebSocket after multiple retries");
		messages.value.push({
			type: "error",
			content: "Failed to reconnect to the server after multiple attempts",
			timestamp: new Date().toISOString(),
		});
	}

	function handleHeartbeat(wsm: WebsocketStructuredMessage) {
		if (wsm.type === "pong") {
			Lib.Log(`[${wsm.timestamp}] - Heartbeat received`);
			return true;
		}
		return false;
	}

	return {
		autoReconnect: autoReconnectOptions.value,
		heartbeat: heartbeatOptions.value,
		onConnected: handleConnected,
		onDisconnected: handleDisconnected,
		onMessage: handleMessage,
		onError: handleError,
		protocols: client.value ? [`${client.value.id}-${client.value.name}`] : undefined,
	};
};

export default useWebSocketInterface;
