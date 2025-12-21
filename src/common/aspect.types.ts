export interface IAspectProperties {
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

export interface AspectModel {
	_id: string;
	aspect_id: number;
	hash: string;
	tier: number;
	weight: number;
	potency: number;
	rune_ids: number[];
	required_rune_ids: number[];
	blocked_aspect_ids: number[];
	properties: IAspectProperties;
}

export interface AspectCreationData {
	hash: string;
	tier: 1 | 2 | 3 | 4;
	weight: number;
	potency: number;
	rune_ids: number[];
	required_rune_ids: number[];
	blocked_aspect_ids: number[];
	properties: Partial<IAspectProperties>;
}

export interface AspectUpdateData {
	id: string;
	hash?: string;
	tier?: number;
	weight?: number;
	potency?: number;
	rune_ids?: number[];
	required_rune_ids?: number[];
	blocked_aspect_ids?: number[];
	properties?: Partial<IAspectProperties>;
}
