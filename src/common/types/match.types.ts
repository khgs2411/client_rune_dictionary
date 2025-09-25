export type MatchType = "pvp" | "pve";
export interface MatchCard {
	type: MatchType;
	title: string;
	subtitle: string;
	content: string;
	wip?: boolean;
	disabled?: boolean;
	loading?: boolean;
}


export interface IMatchParticipant {
	id: string;
	name: string;
	stats: {
		attack: number,

		defense: number,

		special_attack: number,

		special_defense: number,

		speed: number,

		health: number,

		maxHealth: number,
	},
	npc: boolean,
}