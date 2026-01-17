import { BaseAPI } from "topsyde-utils";
import type { AbilityModel, GenerateAbilityRequest } from "@/common/ability.types";

export class SkillsAPI extends BaseAPI {
	constructor() {
		super("red", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findByUser(userId: string): Promise<AbilityModel[]> {
		const response = await this.get<{ status: boolean; data: AbilityModel[] }>(`abilities?user_id=${userId}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async generate(userId: string, attributes: number[]): Promise<AbilityModel> {
		const request: GenerateAbilityRequest = { user_id: userId, attributes };
		const response = await this.post<{ status: boolean; data: AbilityModel }>("create", request);
		BaseAPI.Status(response);
		return response.data.data;
	}
}
