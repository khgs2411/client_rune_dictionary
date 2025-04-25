export type MatchType = "pvp" | "pve";
export interface MatchCard {
	type: MatchType;
	title: string;
	subtitle: string;
	content: string;
}
