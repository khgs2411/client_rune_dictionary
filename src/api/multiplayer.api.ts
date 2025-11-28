import { PositionVector3, Vec3 } from "@/common/types";
import { BaseAPI } from "topsyde-utils";

export interface I_PlayerInScene {
	id: string;
	position: Vec3;
	rotation: Vec3;
	username: string;
	raw: { position: PositionVector3; rotation: PositionVector3 };
}

export default class MultiplayerAPI extends BaseAPI {
	constructor() {
		super("multiplayer", import.meta.env.VITE_HOST);
	}

	public async getPlayersInScene(id: string) {
		const response = await this.post<{
			status: boolean;
			data: { message: string; playersInScene: I_PlayerInScene[] };
		}>("state", { id });
		BaseAPI.Status(response);
		return response.data;
	}
}
