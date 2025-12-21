import { BaseAPI } from "topsyde-utils";
import { RuneCreationData, RuneUpdateData, RuneModel } from "@/common/rune.types";

export class RunesAPI extends BaseAPI {
	constructor() {
		super("runes", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findAll(): Promise<RuneModel[]> {
		const response = await this.get<{ status: boolean; data: RuneModel[] }>("");
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async findById(id: string): Promise<RuneModel> {
		const response = await this.get<{ status: boolean; data: RuneModel }>(`find?id=${id}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async create(data: RuneCreationData): Promise<RuneModel> {
		const response = await this.post<{ status: boolean; data: RuneModel }>("", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async update(data: RuneUpdateData): Promise<RuneModel> {
		const response = await this.post<{ status: boolean; data: RuneModel }>("update", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async delete(id: string): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("delete", { id });
		BaseAPI.Status(response);
	}
}
