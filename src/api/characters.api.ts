import { BaseAPI } from "topsyde-utils";
import type { AbilityModel } from "@/common/ability.types";

export interface EquippedSlot {
	slot_index: number;
	ability_id: number | null;
	ability?: AbilityModel;
}

export interface SlotUpdate {
	ability_id: number;
	slot_index: number;
}

export class CharactersAPI extends BaseAPI {
	constructor() {
		super("characters", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async getAbilities(userId: string): Promise<AbilityModel[]> {
		const response = await this.get<{ status: boolean; data: AbilityModel[] }>(`abilities?user_id=${userId}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async getLoadout(userId: string): Promise<EquippedSlot[]> {
		const response = await this.get<{ status: boolean; data: EquippedSlot[] }>(`loadout?user_id=${userId}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async updateLoadout(userId: string, slots: (SlotUpdate | null)[]): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("loadout", {
			user_id: userId,
			slots,
		});
		BaseAPI.Status(response);
	}
}
