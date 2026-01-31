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

export enum E_NamePosition {
	PREFIX = "PREFIX",
	SUFFIX = "SUFFIX",
}

export interface I_TieredNameComponent {
	id: number;
	name: string;
	weight: number;
	position: E_NamePosition;
	restrictedNameIds: number[];
	compatibleWith: number[];
}

export interface I_AttributeNameComponents {
	tiers: {
		1?: I_TieredNameComponent[];
		2?: I_TieredNameComponent[];
		3?: I_TieredNameComponent[];
		4?: I_TieredNameComponent[];
	};
}

export interface AttributeModel {
	_id: string;
	attribute_id: number;
	name: string;
	weight: number;
	type: number;
	foundational?: number;
	name_components?: I_AttributeNameComponents;
}

export interface AttributeCreationData {
	name: string;
	weight: number;
	type?: number;
	foundational?: number;
	name_components?: I_AttributeNameComponents;
}

export interface AttributeUpdateData {
	id: string;
	name?: string;
	weight?: number;
	type?: number;
	foundational?: number;
	name_components?: I_AttributeNameComponents;
}
