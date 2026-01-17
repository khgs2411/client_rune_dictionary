export interface AffixModel {
	_id: string;
	affix_id: number;
	hash: string;
	tier: number;
	weight: number;
	potency: number;
	attribute_ids: number[];
	required_attribute_ids: number[];
	blocked_affix_ids: number[];
}

export interface AffixCreationData {
	hash: string;
	tier: 1 | 2 | 3 | 4;
	weight: number;
	potency: number;
	attribute_ids: number[];
	required_attribute_ids: number[];
	blocked_affix_ids: number[];
}

export interface AffixUpdateData {
	id: string;
	hash?: string;
	tier?: number;
	weight?: number;
	potency?: number;
	attribute_ids?: number[];
	required_attribute_ids?: number[];
	blocked_affix_ids?: number[];
}
