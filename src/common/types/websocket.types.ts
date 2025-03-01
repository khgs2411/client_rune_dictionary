import { Fn } from "@vueuse/core";

type HeartbeatOptions = {
	message?: string | ArrayBuffer | Blob;
	responseMessage?: string | ArrayBuffer | Blob;
	interval?: number;
	pongTimeout?: number;
};

type AutoReconnectOptions = {
	retries?: number | (() => boolean);
	delay?: number;
	onFailed?: Fn;
};

export type Heartbeat = boolean | HeartbeatOptions;

export type AutoReconnect = boolean | AutoReconnectOptions;
