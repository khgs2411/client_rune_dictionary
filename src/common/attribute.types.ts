export enum E_AttributeType {
	ELEMENTAL = 1,
	PHYSICAL = 2,
	ARCANE = 3,
}

export const ATTRIBUTE_TYPE_LABELS: Record<E_AttributeType, string> = {
	[E_AttributeType.ELEMENTAL]: "Elemental",
	[E_AttributeType.PHYSICAL]: "Physical",
	[E_AttributeType.ARCANE]: "Arcane",
};

export interface AttributeModel {
	_id: string;
	attribute_id: number;
	name: string;
	weight: number;
	type: number;
}

export interface AttributeCreationData {
	name: string;
	weight: number;
	type?: number;
}

export interface AttributeUpdateData {
	id: string;
	name?: string;
	weight?: number;
	type?: number;
}
