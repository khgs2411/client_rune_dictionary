import { BaseAPI } from "topsyde-utils";
import { AspectCreationData, AspectUpdateData, AspectModel } from "@/common/aspect.types";

export class AspectsAPI extends BaseAPI {
	constructor() {
		super("aspects", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findAll(): Promise<AspectModel[]> {
		const response = await this.get<{ status: boolean; data: AspectModel[] }>("");
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async findById(id: string): Promise<AspectModel> {
		const response = await this.get<{ status: boolean; data: AspectModel }>(`find?id=${id}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async create(data: AspectCreationData): Promise<AspectModel> {
		const response = await this.post<{ status: boolean; data: AspectModel }>("", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async update(data: AspectUpdateData): Promise<AspectModel> {
		const response = await this.post<{ status: boolean; data: AspectModel }>("update", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async delete(id: string): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("delete", { id });
		BaseAPI.Status(response);
	}
}
