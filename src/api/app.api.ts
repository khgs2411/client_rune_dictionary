import BaseApi from "./api.base";

export default class API extends BaseApi {
	constructor() {
		super("api", "http://localhost:3000");
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
