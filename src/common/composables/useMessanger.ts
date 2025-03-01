import { E_WebsocketMessageType, WebsocketStructuredMessage } from "topsyde-utils";
import { MessagesClient } from "../types/types";

const useMessanger = (send: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean) => {
	function sendMessage(client: MessagesClient, inputMessage: string, options?: { type: E_WebsocketMessageType; channel?: string; target?: MessagesClient }) {
		if (!inputMessage.trim() || !client) return;

		if (options?.type === E_WebsocketMessageType.WHISPER) {
			sendWhisper(client, inputMessage, options.target);
			return;
		}

		// Format message according to WebsocketStructuredMessage interface
		const message: WebsocketStructuredMessage = {
			type: options?.type || E_WebsocketMessageType.MESSAGE,
			content: { message: inputMessage },
			channel: options?.channel || "global",
			timestamp: new Date().toISOString(),
			client: client,
		};

		// Send message to server
		send(JSON.stringify(message));
	}

	function sendWhisper(client: MessagesClient, inputMessage: string, target?: MessagesClient) {
		if (!inputMessage.trim() || !client || !target) return;

		// Format message according to WebsocketStructuredMessage interface
		const message: WebsocketStructuredMessage = {
			type: E_WebsocketMessageType.WHISPER,
			content: { message: inputMessage, target: target },
			channel: "global",
			timestamp: new Date().toISOString(),
			client: client,
		};

		// Send message to server
		send(JSON.stringify(message));
	}

	return { sendMessage, sendWhisper };
};

export default useMessanger;
