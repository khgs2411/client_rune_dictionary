import { E_WebsocketMessageType, WebsocketStructuredMessage } from "topsyde-utils";
import { MessagesEntity } from "../types/types";

export interface I_SendMessageOptions {
	type?: E_WebsocketMessageType;
	channel?: string;
	target?: MessagesEntity;
	metadata?: Record<string, string>;
}

const useMessenger = (send: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean) => {
	// const utils = useUtils();
	function sendMessage(client: MessagesEntity, input: string, options?: I_SendMessageOptions) {
		if (!input.trim() || !client) return;

		if (options?.type === E_WebsocketMessageType.WHISPER) {
			sendWhisper(client, input, options.target);
			return;
		}

		// Format message according to WebsocketStructuredMessage interface
		const message: WebsocketStructuredMessage = {
			type: options?.type || E_WebsocketMessageType.MESSAGE,
			content: { message: input },
			channel: options?.channel || "global",
			timestamp: new Date().toISOString(),
			client: client,
			metadata: options?.metadata,
		};

		// Send message to server
		send(JSON.stringify(message));
	}

	function sendWhisper(client: MessagesEntity, inputMessage: string, target?: MessagesEntity) {
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

export default useMessenger;
