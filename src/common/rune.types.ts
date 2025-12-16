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
