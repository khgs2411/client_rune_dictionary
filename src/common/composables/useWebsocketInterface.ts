import { UseWebSocketOptions } from "@vueuse/core";
import { Lib, WebsocketStructuredMessage } from "topsyde-utils";
import { Ref } from "vue";

const PING_PONG_INTERVAL = 60000;
export const WEBSOCKET_URL = `ws://${import.meta.env.VITE_WS_HOST || "localhost"}:3000`;

const useWebSocketInterface = (messages: Ref<string[]>): UseWebSocketOptions => {
	// Handle connection established
	const handleConnected = (ws: WebSocket) => {
		Lib.Log(`[${ws.url}] - Connected!`, ws.readyState);
		messages.value.push("Connected to chat server");
	};

	// Handle disconnection
	const handleDisconnected = (ws: WebSocket, event: CloseEvent) => {
		Lib.Log(`[${ws.url}] - Disconnected!`, ws.readyState, event);
		messages.value.push(`Disconnected from chat server (code: ${event.code})`);
	};

	// Handle incoming messages
	const handleMessage = (ws: WebSocket, event: MessageEvent) => {
		if (event.data) {
			try {
				const data: WebsocketStructuredMessage = JSON.parse(event.data);
				if (data.type === "pong") {
					Lib.Log(`[${ws.url}] - Received pong from server`);
					return;
				}
				Lib.Log(`[${ws.url}] - Received:, ${event.data}`);
				messages.value.push(data.content);
			} catch (e) {
				messages.value.push(event.data);
			}
		}
	};

	// Handle errors
	const handleError = (ws: WebSocket, event: Event) => {
		Lib.Warn(`[${ws.url}] - WebSocket error:`, event);
		messages.value.push("Error with chat connection");
	};

	// Handle reconnection failure
	const handleReconnectFailed = () => {
		Lib.Warn("Failed to connect WebSocket after multiple retries");
		messages.value.push("Failed to reconnect to the server after multiple attempts");
	};

	return {
		autoReconnect: {
			retries: 3,
			delay: 3000,
			onFailed: handleReconnectFailed,
		},
		heartbeat: {
			interval: PING_PONG_INTERVAL,
			pongTimeout: PING_PONG_INTERVAL,
			message: "ping",
		},
		onConnected: handleConnected,
		onDisconnected: handleDisconnected,
		onMessage: handleMessage,
		onError: handleError,
	};
};

export default useWebSocketInterface;
