export interface IAffixProperties {
	is_damage: number;
	is_typed: number;
	is_convert: number;
	is_percent: number;
	is_duration: number;
	is_range: number;
	hit_count: number;
	cooldown: number;
	wait_turns: number;
	is_stun: number;
	is_slow: number;
	is_retaliate: number;
	is_silence: number;
	is_sleep: number;
	is_taunt: number;
	is_fear: number;
	is_confuse: number;
	is_charm: number;
	is_heal: number;
	is_frenzy: number;
}

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
	properties: IAffixProperties;
}

export interface AffixCreationData {
	hash: string;
	tier: 1 | 2 | 3 | 4;
	weight: number;
	potency: number;
	attribute_ids: number[];
	required_attribute_ids: number[];
	blocked_affix_ids: number[];
	properties: Partial<IAffixProperties>;
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
	properties?: Partial<IAffixProperties>;
}
