import { BaseAPI } from "topsyde-utils";
import { AffixCreationData, AffixUpdateData, AffixModel } from "@/common/affix.types";

export class AffixesAPI extends BaseAPI {
	constructor() {
		super("affixes", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findAll(): Promise<AffixModel[]> {
		const response = await this.get<{ status: boolean; data: AffixModel[] }>("");
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async findById(id: string): Promise<AffixModel> {
		const response = await this.get<{ status: boolean; data: AffixModel }>(`find?id=${id}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async create(data: AffixCreationData): Promise<AffixModel> {
		const response = await this.post<{ status: boolean; data: AffixModel }>("", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async update(data: AffixUpdateData): Promise<AffixModel> {
		const response = await this.post<{ status: boolean; data: AffixModel }>("update", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async delete(id: string): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("delete", { id });
		BaseAPI.Status(response);
	}
}
