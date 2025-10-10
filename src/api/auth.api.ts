import { BaseAPI } from "topsyde-utils"

export interface ILoginResponse {
	status: boolean;
	authorized: boolean;
	msg: string;
}
export default class AuthAPI extends BaseAPI {
	constructor(controller: string = "main", base_url?: string) {
		super(controller, base_url ?? "https://faas-ams3-2a2df116.doserverless.co/api/v1/web/fn-8b5106d1-8570-4f63-a2af-01748ac110f3");
	}

	public async login(username: string, password?: string) {
		const action = "index";
		const payload = {
			api_key: password ?? process.env.API_KEY,
			action: "auth_login",
			data: {
				api_key: password ?? process.env.API_KEY,
				username,
			},
		};
		const response = await this.post<ILoginResponse>(action, payload);
		BaseAPI.Status(response);
		return response.data;
	}

	public async ping() {
		const action = "ping";
		const response = await this.post(action, {});
		BaseAPI.Status(response);
		return response.data;
	}

	public async handshake(username: string, password: string, api_key: string) {
		const action = "handshake";
		const response = await this.post<{ status: boolean; data: { id: string; name: string } }>(action, { username, password, api_key });
		BaseAPI.Status(response);
		return response.data;
	}
}
