export interface SlotEffect {
	type: string;
	action: string;
	target: string;
	value: {
		base: number | [number, number];
		damageType?: number;
		statusEffect?: string;
	};
	timing?: {
		delay?: number;
		duration?: number;
		hitCount?: number;
		chainCount?: number;
	};
}

export interface SlotData {
	text: string;
	dmg: number | number[];
	type: number | null;
	effects: SlotEffect[];
}

export interface AbilitySlots {
	[key: number]: SlotData;
}

export interface AbilityModel {
	_id: string;
	ability_id: number;
	name: string;
	description?: string;
	tier: number;
	creator: string;
	affixes: number[];
	slots: AbilitySlots;
	createdAt?: string;
	updatedAt?: string;
}

export interface GenerateAbilityRequest {
	user_id: string;
	attributes: number[];
}
