import { IMatchParticipant } from "@/common/types/match.types";
import { Entity } from "../common/types/types";
import BaseAPI from "./api.base";

export default class MatchAPI extends BaseAPI {
	constructor() {
		super("match");
	}

	async pve(whoami: Entity) {
		const response = await this.post<{
			status: boolean;
			data: {
				message: string;
				whoami: Entity;
				matchId: string;
				channelId: string;
				match: {
					_entities: IMatchParticipant[];
				}
			};
		}>("pve", { whoami });
		BaseAPI.Status(response);
		return response.data;
	}

	async createMatch(host: Entity, target: Entity) {
		const response = await this.post("create", { target, host });
		BaseAPI.Status(response);
		return response.data;
	}

	async acceptMatch(matchId: string, host: Entity, target: Entity) {
		const response = await this.post("accept", { matchId, host, target });
		BaseAPI.Status(response);
		return response.data;
	}

	async decline(matchId: string, host: Entity, target: Entity) {
		const response = await this.post("decline", { matchId, host, target });
		BaseAPI.Status(response);
		return response.data;
	}

	async leaveMatch(matchId: string, whoami: Entity) {
		const response = await this.post("leave", { matchId, whoami });
		BaseAPI.Status(response);
		return response.data;
	}
}
