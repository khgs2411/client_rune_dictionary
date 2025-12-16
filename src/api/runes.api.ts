import { BaseAPI } from "topsyde-utils";
import { RuneCreationData, RuneUpdateData, RuneModel } from "@/common/rune.types";

// Re-thinking: Standard pattern is one API class per resource usually.
// But user wants "Grimoire Service".
// I will create `RunesAPI` class and `AspectsAPI` class.

export class RunesAPI extends BaseAPI {
	constructor() {
		super("runes", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findAll(): Promise<RuneModel[]> {
		const response = await this.get<{ status: boolean; data: { data: RuneModel[] } }>("");
		BaseAPI.Status(response);
		return response.data.data.data;
	}

	public async create(data: RuneCreationData): Promise<RuneModel> {
		const response = await this.post<{ status: boolean; data: { data: RuneModel } }>("", data);
		BaseAPI.Status(response);
		return response.data.data.data;
	}

	public async update(data: RuneUpdateData): Promise<RuneModel> {
		const response = await this.post<{ status: boolean; data: { data: RuneModel } }>("update", data);
		BaseAPI.Status(response);
		return response.data.data.data;
	}

	public async delete(id: string): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("delete", { id });
		BaseAPI.Status(response);
	}
}
