export enum E_RuneType {
	ELEMENTAL = 1,
	PHYSICAL = 2,
	ARCANE = 3,
}

export const RUNE_TYPE_LABELS: Record<E_RuneType, string> = {
	[E_RuneType.ELEMENTAL]: "Elemental",
	[E_RuneType.PHYSICAL]: "Physical",
	[E_RuneType.ARCANE]: "Arcane",
};

export interface RuneModel {
	_id: string;
	rune_id: number;
	name: string;
	weight: number;
	type: number;
}

export interface RuneCreationData {
	name: string;
	weight: number;
	type?: number;
}

export interface RuneUpdateData {
	id: string;
	name?: string;
	weight?: number;
	type?: number;
}
