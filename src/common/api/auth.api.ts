import BaseApi from "./api.base";

export default class AuthAPI extends BaseApi {
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
		return this.post(action, payload).then((res) => res.data);
	}
}
