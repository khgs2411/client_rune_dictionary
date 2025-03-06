import BaseAPI from "./api.base";

export default class API extends BaseAPI {
	constructor() {
		super("api", `${import.meta.env.NODE_ENV === "production" ? "https" : "http"}://${import.meta.env.VITE_WS_HOST || "localhost"}:3000`);
	}

	public async ping() {
		const action = "ping";
		const response = await this.post(action, {});
		return response.data;
	}

	public async handshake(username: string, password: string, api_key: string) {
		const action = "handshake";
		const response = await this.post<{ status: boolean; data: { id: string; name: string } }>(action, { username, password, api_key });
		return response.data;
	}
}
