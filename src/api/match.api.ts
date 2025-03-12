import { Entity } from "../common/types/types";
import BaseAPI from "./api.base";

export default class MatchAPI extends BaseAPI {
	constructor() {
		super("match");
	}

	async createMatch(host: Entity, target: Entity) {
		return this.post("create", { target, host });
	}

	async acceptMatch(matchId: string, host: Entity, target: Entity) {
		return this.post("accept", { matchId, host, target });
	}

	async decline(matchId: string, host: Entity, target: Entity) {
		return this.post("decline", { matchId, host, target });
	}
}
