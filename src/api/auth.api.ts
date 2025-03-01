import BaseAPI from "./api.base";

export interface ILoginResponse {
	status: boolean;
	authorized: boolean;
	msg: string;
}
export default class AuthAPI extends BaseAPI {
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
		return response.data;
	}
}
