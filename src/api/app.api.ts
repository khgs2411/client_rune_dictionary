import BaseApi from "./api.base";

export default class AppAPI extends BaseApi {
	constructor() {
		super("api", "http://localhost:3000");
	}

	public async ping() {
		const action = "ping";
		const response = await this.post(action, {});
        return response.data;
	}
}
