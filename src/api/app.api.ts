import BaseAPI from "./api.base";

export default class API extends BaseAPI {
	constructor() {
		super("api");
	}

	public async ping() {
		const action = "ping";
		const response = await this.post(action, {});
		return response.data;
	}
}
