import { UseWebSocketOptions, UseWebSocketReturn } from "@vueuse/core";
import { E_WebsocketMessageType, Lib, Rxjs, WebsocketEntityData, WebsocketStructuredMessage } from "topsyde-utils";
import { ref, Ref } from "vue";
import { AutoReconnect, Heartbeat } from "../types/websocket.types";
import useWSM, { I_UseWSM } from "./useWSM";
import useWebsocketEventHandler, { I_WebsocketEventHandlerInterface } from "./useWebsocketEventHandler";

export const WEBSOCKET_HOST = import.meta.env.VITE_WS_HOST || "wss://topsyde-gaming.duckdns.org:3000";
console.log("WebSocket Host:", WEBSOCKET_HOST);
const PING_PONG_INTERVAL = 20;

export type WebsocketClient = UseWebSocketReturn<WebsocketStructuredMessage>;

const useWebSocketInterface = (client: Ref<WebsocketEntityData | null>, messages: Ref<WebsocketStructuredMessage[]>): UseWebSocketOptions => {
	const eventHandler: I_WebsocketEventHandlerInterface = useWebsocketEventHandler();

	// Track if this is a development hot reload reconnection
	const lastDisconnectTime = ref<number>(0);

	const heartbeatOptions: Ref<Heartbeat> = ref({
		interval: PING_PONG_INTERVAL * 1000,
		pongTimeout: PING_PONG_INTERVAL * 1000,
		message: "ping",
	});

	const autoReconnectOptions: Ref<AutoReconnect> = ref({
		retries: 10, // More retries in dev mode
		delay: 500, // Faster reconnect in dev
		onFailed: handleReconnectFailed,
	});

	function handleMessage(ws: WebSocket, event: MessageEvent) {
		try {
			const data: WebsocketStructuredMessage = JSON.parse(event.data);
			const wsm$ = useWSM(data);
			if (wsm$.type.value == E_WebsocketMessageType.PONG) return;
			if (wsm$.isMessage.value) onMessageReceived(ws, event, wsm$);
			else onActionReceived(ws, event, wsm$);
		} catch (err) {
			Lib.Warn(JSON.stringify(event.data));
			Lib.Warn(err);
		}
	}

	function onMessageReceived(ws: WebSocket, event: MessageEvent, wsm$: I_UseWSM) {
		logMessage("Received message", ws, event);
		messages.value.push(wsm$.data);
	}

	function onActionReceived(ws: WebSocket, event: MessageEvent, wsm$: I_UseWSM) {
		logMessage("Received action", ws, event);
		eventHandler.process(wsm$);
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
		console.clear();
		Lib.Log(`[${ws.url}] - Disconnected!`, ws.readyState, event);

		// Track disconnect time for hot reload detection
		lastDisconnectTime.value = Date.now();
		Rxjs.Next("system", {
			cta: "disconnected",
			data: {},
		});

		// In dev mode, suppress disconnect messages for expected hot reload disconnects
		if (!import.meta.env.DEV || event.code !== 1006) {
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
		const ignore_these = ['match.atb.readiness.update', 'match.state.update'];
		let dataString = event ? event.data : "";
		try {
			if (!toString) dataString = JSON.parse(dataString);
		} catch (err) {
			dataString = dataString.toString();
		}
		if (ignore_these.includes(dataString?.type)) return;
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
