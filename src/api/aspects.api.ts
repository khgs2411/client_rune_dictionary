import { BaseAPI } from "topsyde-utils";
import { AspectCreationData, AspectUpdateData, AspectModel } from "@/common/aspect.types";

export default class GrimoireAPI extends BaseAPI {
	constructor() {
		super("grimoire", import.meta.env.VITE_HOST || "http://localhost:3000");
		// Note: The server endpoints are currently at /runes and /aspects, not /grimoire/runes
		// So I might need to override the base path or use absolute paths for endpoints if BaseAPI forces a prefix.
		// Looking at MatchAPI, it passes "match" as prefix, and endpoints are "pve".
		// If BaseAPI implementation appends prefix, I might need two API classes or a different strategy if I want to use one class for both /runes and /aspects.
		// BaseAPI usually concatenates: host + prefix + endpoint.
		// If I instantiate with "", I can manage /runes and /aspects manually.
	}

	// Since we have two distinct controllers (Runes, Aspects) on the server,
	// and BaseAPI usually targets one 'resource' prefix,
	// I will use two separate private instances or methods to hit them,
	// OR just use 'runes' as prefix for one set and 'aspects' for another?
	// Actually, I'll allow this class to handle both by NOT using the prefix in super() if possible,
	// or by instantiating BaseAPI twice internally?
	// Let's look at BaseAPI usage again.
	// MatchAPI uses super("match", ...).

	// Strategy: I will Create `RunesAPI` and `AspectsAPI` separately in this file or helper classes?
	// Or I can just pass empty string as prefix and manually add "runes/" or "aspects/" to endpoints.
}

export class AspectsAPI extends BaseAPI {
	constructor() {
		super("aspects", import.meta.env.VITE_HOST || "http://localhost:3000");
	}

	public async findAll(): Promise<AspectModel[]> {
		const response = await this.get<{ status: boolean; data: { data: AspectModel[] } }>("");
		BaseAPI.Status(response);
		return response.data.data.data;
	}

	public async create(data: AspectCreationData): Promise<AspectModel> {
		const response = await this.post<{ status: boolean; data: { data: AspectModel } }>("", data);
		BaseAPI.Status(response);
		return response.data.data.data;
	}

	public async update(data: AspectUpdateData): Promise<AspectModel> {
		const response = await this.post<{ status: boolean; data: { data: AspectModel } }>("update", data);
		BaseAPI.Status(response);
		return response.data.data.data;
	}

	public async delete(id: string): Promise<void> {
		const response = await this.post<{ status: boolean; data: { message: string } }>("delete", { id });
		BaseAPI.Status(response);
	}
}
