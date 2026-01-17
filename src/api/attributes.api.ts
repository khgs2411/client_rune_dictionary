import { BaseAPI } from "topsyde-utils";
import { AttributeCreationData, AttributeUpdateData, AttributeModel } from "@/common/attribute.types";

export class AttributesAPI extends BaseAPI {
	constructor() {
		super("attributes", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findAll(): Promise<AttributeModel[]> {
		const response = await this.get<{ status: boolean; data: AttributeModel[] }>("get");
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async findById(id: string): Promise<AttributeModel> {
		const response = await this.get<{ status: boolean; data: AttributeModel }>(`find?id=${id}`);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async create(data: AttributeCreationData): Promise<AttributeModel> {
		const response = await this.post<{ status: boolean; data: AttributeModel }>("create", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async update(data: AttributeUpdateData): Promise<AttributeModel> {
		const response = await this.post<{ status: boolean; data: AttributeModel }>("update", data);
		BaseAPI.Status(response);
		return response.data.data;
	}

	public async delete(id: string): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("delete", { id });
		BaseAPI.Status(response);
	}
}
