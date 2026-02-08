import type { AbilityModel } from "@/common/ability.types";

type Element =
	| "fire"
	| "frost"
	| "water"
	| "earth"
	| "wind"
	| "light"
	| "shadow"
	| "arcane"
	| "lightning"
	| "poison"
	| "blood"
	| "chaos";

const ELEMENT_COLORS: Record<Element, string> = {
	fire: "#ef4444",
	frost: "#3b82f6",
	water: "#0ea5e9",
	earth: "#a16207",
	wind: "#22c55e",
	light: "#fbbf24",
	shadow: "#7c3aed",
	arcane: "#a855f7",
	lightning: "#facc15",
	poison: "#84cc16",
	blood: "#dc2626",
	chaos: "#ec4899",
};

const ELEMENT_ICONS: Record<Element, string> = {
	fire: "game-icons:fire",
	frost: "game-icons:snowflake-2",
	water: "game-icons:water-drop",
	earth: "game-icons:stone-block",
	wind: "game-icons:wind-slap",
	light: "game-icons:sun",
	shadow: "game-icons:evil-moon",
	arcane: "game-icons:magic-swirl",
	lightning: "game-icons:lightning-bolt",
	poison: "game-icons:poison-bottle",
	blood: "game-icons:drop",
	chaos: "game-icons:chaos-oracle",
};

const ELEMENT_KEYWORDS: [Element, string[]][] = [
	["fire", ["fire", "flame", "burn", "ember"]],
	["frost", ["frost", "ice", "freeze"]],
	["water", ["water", "aqua", "hydro"]],
	["earth", ["earth", "rock", "stone"]],
	["wind", ["wind", "air", "gust"]],
	["light", ["light", "holy", "radiant"]],
	["shadow", ["shadow", "dark", "void"]],
	["arcane", ["arcane", "magic", "mystic"]],
	["lightning", ["lightning", "thunder", "shock"]],
	["poison", ["poison", "venom", "toxic"]],
	["blood", ["blood", "crimson", "sanguine"]],
	["chaos", ["chaos"]],
];

const TIER_COLORS: Record<number, string> = {
	1: "#9ca3af",
	2: "#22c55e",
	3: "#3b82f6",
	4: "#a855f7",
	5: "#f59e0b",
};

const TIER_LABELS: Record<number, string> = {
	1: "Common",
	2: "Uncommon",
	3: "Rare",
	4: "Epic",
	5: "Legendary",
};

function inferElement(skill: AbilityModel): Element {
	const name = skill.name.toLowerCase();
	const slotText = skill.slots
		? Object.values(skill.slots)
				.map((s) => s.text)
				.join(" ")
				.toLowerCase()
		: "";
	const combined = `${name} ${slotText}`;

	for (const [element, keywords] of ELEMENT_KEYWORDS) {
		if (keywords.some((kw) => combined.includes(kw))) return element;
	}
	return "arcane";
}

export function getSkillColor(skill: AbilityModel): string {
	return ELEMENT_COLORS[inferElement(skill)] || "#6b7280";
}

export function getSkillIcon(skill: AbilityModel): string {
	return ELEMENT_ICONS[inferElement(skill)] || "game-icons:magic-swirl";
}

export function getTierColor(tier: number): string {
	return TIER_COLORS[tier] || "#6b7280";
}

export function getTierLabel(tier: number): string {
	return TIER_LABELS[tier] || `Tier ${tier}`;
}

export function getSkillPreview(skill: AbilityModel, maxLength = 60): string {
	const slots = skill.slots;
	if (!slots) return "No description";
	const slotKeys = Object.keys(slots).sort();
	if (slotKeys.length === 0) return "No description";
	const text = slots[Number(slotKeys[0])]?.text ?? "No description";
	return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
