import { UseWebSocketOptions } from "@vueuse/core";
import { Lib, WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { ref, Ref } from "vue";
import { AutoReconnect, Heartbeat } from "../types/websocket.types";
import useWSM, { I_UseWSM } from "./useWSM";
import useWebsocketLogic from "./useWebsocketLogic";

export const WEBSOCKET_HOST = import.meta.env.VITE_WS_HOST;
const PING_PONG_INTERVAL = 20;

const useWebSocketInterface = (client: Ref<WebsocketEntityData | null>, messages: Ref<WebsocketStructuredMessage[]>): UseWebSocketOptions => {
	const logic$ = useWebsocketLogic();
	const heartbeatOptions: Ref<Heartbeat> = ref({
		interval: PING_PONG_INTERVAL * 1000,
		pongTimeout: PING_PONG_INTERVAL * 1000,
		message: "ping",
	});

	const autoReconnectOptions: Ref<AutoReconnect> = ref({
		retries: 1,
		delay: 1000,
		onFailed: handleReconnectFailed,
	});

	function handleMessage(ws: WebSocket, event: MessageEvent) {
		try {
			const data: WebsocketStructuredMessage = JSON.parse(event.data);
			const wsm$ = useWSM(data);

			if (wsm$.isMessage.value) onMessageReceived(ws, event, wsm$);
			else onActionReceived(ws, event, wsm$);
		} catch (err) {
			console.log(JSON.stringify(event.data));
			console.log(err);
		}
	}

	function onMessageReceived(ws: WebSocket, event: MessageEvent, wsm$: I_UseWSM) {
		logMessage("Received message", ws, event);
		messages.value.push(wsm$.data);
	}

	function onActionReceived(ws: WebSocket, event: MessageEvent, wsm$: I_UseWSM) {
		logMessage("Received action", ws, event);
		logic$.process(wsm$);
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

	function logMessage(title: string, ws: WebSocket, event?: MessageEvent, toString: boolean = false) {
		let dataString = event ? event.data : "";
		try {
			if (!toString) dataString = JSON.parse(dataString);
		} catch (err) {
			dataString = dataString.toString();
		}
		Lib.Log(`[${ws.url}] - ${title}`, dataString);
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
