import { UseWebSocketOptions } from "@vueuse/core";
import { Lib, WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { ref, Ref } from "vue";
import { AutoReconnect, Heartbeat } from "../types/websocket.types";
import useWSM from "./useWSM";
import useWebsocketLogic from "./useWebsocketLogic";

const PING_PONG_INTERVAL = 20;
export const WEBSOCKET_URL = `${import.meta.env.VITE_WS_HOST}`;
console.log("ENV:", import.meta.env);
console.log("WEBSOCKET_URL", WEBSOCKET_URL);
const useWebSocketInterface = (client: Ref<WebsocketEntityData | null>, messages: Ref<WebsocketStructuredMessage[]>): UseWebSocketOptions => {
	const heartbeatOptions: Ref<Heartbeat> = ref({
		interval: PING_PONG_INTERVAL * 1000,
		pongTimeout: PING_PONG_INTERVAL * 1000,
		message: "ping",
	});

	const autoReconnectOptions: Ref<AutoReconnect> = ref({
		retries: 3,
		delay: 1000,
		onFailed: handleReconnectFailed,
	});

	function logMessage(title: string, ws: WebSocket, event?: MessageEvent) {
		const dataString = event ? event.data : "";
		Lib.Log(`[${ws.url}] - ${title}:`, dataString);
	}

	function handleMessage(ws: WebSocket, event: MessageEvent) {
		try {
			const data: WebsocketStructuredMessage = JSON.parse(event.data);
			const wsm$ = useWSM(data);
			
			if (wsm$.isMessage.value) {
				logMessage("Received message", ws, event);
				messages.value.push(wsm$.data);
			} else useWebsocketLogic(wsm$);
		
		} catch (err) {
			console.log(JSON.stringify(event.data));
			console.log(err);
		}
	}

	function handleConnected(ws: WebSocket) {
		logMessage("Connected", ws);

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
			content: {
				message: "Error with chat connection",
			},
			timestamp: new Date().toISOString(),
		});
	}

	function handleReconnectFailed() {
		Lib.Warn("Failed to connect WebSocket after multiple retries");
		messages.value.push({
			type: "error",
			content: {
				message: "Failed to reconnect to the server after multiple attempts",
			},
			timestamp: new Date().toISOString(),
		});
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
