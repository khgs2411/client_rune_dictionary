import { Entity } from "../common/types/types";
import BaseAPI from "./api.base";

export default class MatchAPI extends BaseAPI {
	constructor() {
		super("match", "http://localhost:3000");
	}

	async createMatch(entity: Entity, target: Entity) {
		return this.post("create", { target, entity });
	}

	async acceptMatch(matchId: string) {
		return this.post("accept", { matchId });
	}

	async decline(matchId: string) {
		return this.post("decline", { matchId });
	}
}
