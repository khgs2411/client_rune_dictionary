<template>
	<div class="ability-card" :style="cssVars">
		<div class="card-frame">
			<!-- Diagonal shimmer sweep -->
			<div class="card-shimmer" />

			<!-- Corner ornaments -->
			<div class="corner-ornament tl" />
			<div class="corner-ornament tr" />
			<div class="corner-ornament bl" />
			<div class="corner-ornament br" />

			<!-- Radial glow from top -->
			<div class="card-glow" />

			<!-- Inner vignette for depth -->
			<div class="card-vignette" />

			<!-- Card content -->
			<div class="card-body">
				<!-- ═══ EMBLEM ═══ -->
				<div class="flex justify-center pt-6 pb-3">
					<div class="emblem-ring">
						<div class="emblem-inner">
							<Icon :icon="elementIcon" class="emblem-icon" />
						</div>
					</div>
				</div>

				<!-- ═══ NAME ═══ -->
				<h3 class="ability-name">{{ ability.name }}</h3>

				<!-- ═══ TIER ═══ -->
				<div class="tier-row">
					<span class="tier-wing" />
					<span class="tier-label">{{ tierLabel }}</span>
					<span class="tier-wing" />
				</div>

				<!-- ═══ ORNATE DIVIDER ═══ -->
				<div class="main-divider">
					<span class="divider-line" />
					<span class="divider-diamond" />
					<span class="divider-line" />
				</div>

				<!-- ═══ SLOTS ═══ -->
				<div class="slots-scroll">
					<template v-for="(entry, idx) in sortedSlots" :key="entry.key">
						<!-- Separator between slots -->
						<div v-if="idx > 0" class="slot-sep">
							<span class="slot-sep-line" />
							<span class="slot-sep-dot" />
							<span class="slot-sep-line" />
						</div>

						<div class="slot-block">
							<!-- The incantation text — hero content -->
							<p class="slot-text">{{ entry.slot.text }}</p>

							<!-- Mechanical annotations — quiet secondary info -->
							<div v-for="(effect, ei) in entry.slot.effects || []" :key="ei" class="effect-row">
								<Icon
									:icon="effectTypeIcon(effect.type)"
									class="w-3.5 h-3.5 shrink-0 opacity-80"
									:style="{ color: effectTypeColor(effect.type) }" />
								<span class="eff-type" :style="{ color: effectTypeColor(effect.type) }">
									{{ formatEffectType(effect.type) }}
								</span>
								<span class="eff-dot">&middot;</span>
								<span class="eff-action" :style="{ color: actionColor(effect.action) }">
									{{ formatAction(effect.action) }}
								</span>
								<span
									v-if="hasValue(effect)"
									class="eff-value"
									:style="{ color: actionColor(effect.action) }">
									{{ formatDamageValue(effect.value.base) }}
								</span>
								<span v-if="effect.target === 'SELF'" class="eff-self">Self</span>
								<span v-if="effect.timing?.hitCount && effect.timing.hitCount > 1" class="eff-timing">
									&times;{{ effect.timing.hitCount }} hits
								</span>
								<span v-if="effect.timing?.duration" class="eff-timing">
									{{ effect.timing.duration }} turn{{ effect.timing.duration > 1 ? "s" : "" }}
								</span>
								<span v-if="effect.timing?.delay" class="eff-timing">
									{{ effect.timing.delay }}t delay
								</span>
							</div>
						</div>
					</template>

					<div v-if="slotCount === 0" class="py-8 text-center text-white/20 text-sm italic">
						No effects inscribed
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import type { AbilityModel, SlotData, SlotEffect } from "@/common/ability.types";

interface Props {
	ability: AbilityModel;
	showTier?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showTier: true,
});

// ── CSS custom properties for dynamic element color ──

const cssVars = computed(() => ({
	"--el": elementColor.value,
	"--el-60": elementColor.value + "99",
	"--el-40": elementColor.value + "66",
	"--el-25": elementColor.value + "40",
	"--el-15": elementColor.value + "26",
	"--el-08": elementColor.value + "14",
	"--tier": tierColor.value,
}));

// ── Slot data ──

const sortedSlots = computed(() => {
	const slots = props.ability.slots;
	if (!slots) return [];
	return Object.keys(slots)
		.sort((a, b) => Number(a) - Number(b))
		.map(key => ({ key, slot: slots[Number(key)] as SlotData }));
});

const slotCount = computed(() => sortedSlots.value.length);

const allSlotText = computed(() => sortedSlots.value.map(s => s.slot.text).join(" "));

// ── Element inference ──

const inferredElement = computed(() => {
	const name = props.ability.name.toLowerCase();
	const desc = allSlotText.value.toLowerCase();
	const combined = `${name} ${desc}`;

	if (combined.includes("fire") || combined.includes("flame") || combined.includes("burn") || combined.includes("ember")) return "fire";
	if (combined.includes("frost") || combined.includes("ice") || combined.includes("freeze")) return "frost";
	if (combined.includes("water") || combined.includes("aqua") || combined.includes("hydro")) return "water";
	if (combined.includes("earth") || combined.includes("rock") || combined.includes("stone")) return "earth";
	if (combined.includes("wind") || combined.includes("air") || combined.includes("gust")) return "wind";
	if (combined.includes("light") || combined.includes("holy") || combined.includes("radiant")) return "light";
	if (combined.includes("shadow") || combined.includes("dark") || combined.includes("void")) return "shadow";
	if (combined.includes("arcane") || combined.includes("magic") || combined.includes("mystic")) return "arcane";
	if (combined.includes("lightning") || combined.includes("thunder") || combined.includes("shock")) return "lightning";
	if (combined.includes("poison") || combined.includes("venom") || combined.includes("toxic")) return "poison";
	if (combined.includes("blood") || combined.includes("crimson") || combined.includes("sanguine")) return "blood";
	if (combined.includes("chaos")) return "chaos";

	return "arcane";
});

const elementColor = computed(() => {
	const map: Record<string, string> = {
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
	return map[inferredElement.value] || "#6b7280";
});

const elementIcon = computed(() => {
	const map: Record<string, string> = {
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
	return map[inferredElement.value] || "game-icons:magic-swirl";
});

const tierColor = computed(() => {
	const map: Record<number, string> = { 1: "#9ca3af", 2: "#22c55e", 3: "#3b82f6", 4: "#a855f7", 5: "#f59e0b" };
	return map[props.ability.tier] || "#6b7280";
});

const tierLabel = computed(() => {
	const labels: Record<number, string> = { 1: "Common", 2: "Uncommon", 3: "Rare", 4: "Epic", 5: "Legendary" };
	return labels[props.ability.tier] || `Tier ${props.ability.tier}`;
});

// ── Helpers ──

function effectTypeIcon(type: string): string {
	const map: Record<string, string> = {
		IMMEDIATE: "game-icons:sword-wound",
		PERIODIC: "game-icons:burning-dot",
		DELAYED: "game-icons:time-bomb",
		MULTI_HIT: "game-icons:swords-power",
		STAT_MODIFIER: "game-icons:aura",
	};
	return map[type] || "game-icons:magic-swirl";
}

function effectTypeColor(type: string): string {
	const map: Record<string, string> = {
		IMMEDIATE: "#cbd5e1",
		PERIODIC: "#fb923c",
		DELAYED: "#fbbf24",
		MULTI_HIT: "#22d3ee",
		STAT_MODIFIER: "#a78bfa",
	};
	return map[type] || "#cbd5e1";
}

function formatEffectType(type: string): string {
	const map: Record<string, string> = {
		IMMEDIATE: "Instant",
		PERIODIC: "Periodic",
		DELAYED: "Delayed",
		MULTI_HIT: "Multi-Hit",
		STAT_MODIFIER: "Modifier",
	};
	return map[type] || type;
}

function actionColor(action: string): string {
	const map: Record<string, string> = { DAMAGE: "#f87171", HEAL: "#4ade80", RESOURCE_RESTORE: "#60a5fa" };
	return map[action] || "#e2e8f0";
}

function formatAction(action: string): string {
	const map: Record<string, string> = { DAMAGE: "Damage", HEAL: "Heal", RESOURCE_RESTORE: "Restore" };
	return map[action] || action;
}

function hasValue(effect: SlotEffect): boolean {
	if (!effect.value?.base) return false;
	if (Array.isArray(effect.value.base)) return effect.value.base.some(v => v > 0);
	return effect.value.base > 0;
}

function formatDamageValue(base: number | [number, number]): string {
	if (Array.isArray(base)) {
		if (base[0] === base[1]) return String(base[0]);
		return `${base[0]}–${base[1]}`;
	}
	return String(base);
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   CARD FRAME — the enchanted artifact container
   ═══════════════════════════════════════════ */

.ability-card {
	width: 100%;
	max-width: 380px;
}

.card-frame {
	position: relative;
	border-radius: 12px;
	overflow: hidden;
	border: 1px solid var(--el-40);
	background: #0b0b13;
	box-shadow:
		0 0 40px var(--el-08),
		0 4px 24px rgba(0, 0, 0, 0.6);
}

/* ═══════════════════════════════════════════
   SHIMMER — diagonal light sweep
   ═══════════════════════════════════════════ */

.card-shimmer {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
	z-index: 5;
	border-radius: 12px;
}

.card-shimmer::after {
	content: "";
	position: absolute;
	top: -100%;
	left: -100%;
	width: 300%;
	height: 300%;
	background: linear-gradient(
		50deg,
		transparent 35%,
		rgba(255, 255, 255, 0.015) 42%,
		rgba(255, 255, 255, 0.04) 50%,
		rgba(255, 255, 255, 0.015) 58%,
		transparent 65%
	);
	animation: shimmerSweep 5s ease-in-out infinite;
}

@keyframes shimmerSweep {
	0%,
	100% {
		transform: translateX(-40%) translateY(-40%);
	}
	50% {
		transform: translateX(20%) translateY(20%);
	}
}

/* ═══════════════════════════════════════════
   CORNER ORNAMENTS — ancient book page feel
   ═══════════════════════════════════════════ */

.corner-ornament {
	position: absolute;
	width: 16px;
	height: 16px;
	pointer-events: none;
	z-index: 4;
	opacity: 0.7;
}

.corner-ornament.tl {
	top: 8px;
	left: 8px;
	border-top: 1.5px solid var(--el-60);
	border-left: 1.5px solid var(--el-60);
}

.corner-ornament.tr {
	top: 8px;
	right: 8px;
	border-top: 1.5px solid var(--el-60);
	border-right: 1.5px solid var(--el-60);
}

.corner-ornament.bl {
	bottom: 8px;
	left: 8px;
	border-bottom: 1.5px solid var(--el-60);
	border-left: 1.5px solid var(--el-60);
}

.corner-ornament.br {
	bottom: 8px;
	right: 8px;
	border-bottom: 1.5px solid var(--el-60);
	border-right: 1.5px solid var(--el-60);
}

/* ═══════════════════════════════════════════
   ATMOSPHERIC LAYERS
   ═══════════════════════════════════════════ */

.card-glow {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 1;
	background: radial-gradient(ellipse at 50% 0%, var(--el-15), transparent 60%);
}

.card-vignette {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 2;
	background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%);
}

.card-body {
	position: relative;
	z-index: 3;
}

/* ═══════════════════════════════════════════
   EMBLEM — element icon with concentric ring
   ═══════════════════════════════════════════ */

.emblem-ring {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	border: 1.5px solid var(--el-40);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow:
		0 0 30px var(--el-15),
		inset 0 0 20px var(--el-08);
	animation: ringBreath 3.5s ease-in-out infinite;
}

.emblem-inner {
	width: 52px;
	height: 52px;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--el-15), var(--el-08));
	display: flex;
	align-items: center;
	justify-content: center;
}

.emblem-icon {
	width: 28px;
	height: 28px;
	color: var(--el);
	filter: drop-shadow(0 0 6px var(--el-40));
}

@keyframes ringBreath {
	0%,
	100% {
		box-shadow:
			0 0 30px var(--el-15),
			inset 0 0 20px var(--el-08);
	}
	50% {
		box-shadow:
			0 0 45px var(--el-25),
			inset 0 0 25px var(--el-15);
	}
}

/* ═══════════════════════════════════════════
   ABILITY NAME — the visual anchor
   ═══════════════════════════════════════════ */

.ability-name {
	text-align: center;
	padding: 0 24px;
	font-size: 1.25rem;
	font-weight: 700;
	letter-spacing: 0.03em;
	line-height: 1.3;
	color: rgba(255, 255, 255, 0.95);
	text-shadow: 0 0 20px var(--el-25);
	font-family: Georgia, "Times New Roman", serif;
}

/* ═══════════════════════════════════════════
   TIER — rarity label flanked by wings
   ═══════════════════════════════════════════ */

.tier-row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 32px 0;
	justify-content: center;
}

.tier-wing {
	flex: 1;
	max-width: 60px;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--tier));
	opacity: 0.4;
}

.tier-wing:last-child {
	background: linear-gradient(to left, transparent, var(--tier));
}

.tier-label {
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.18em;
	color: var(--tier);
	white-space: nowrap;
}

/* ═══════════════════════════════════════════
   MAIN DIVIDER — ornate with diamond gem
   ═══════════════════════════════════════════ */

.main-divider {
	display: flex;
	align-items: center;
	gap: 0;
	padding: 14px 20px 6px;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--el-40));
}

.divider-line:last-child {
	background: linear-gradient(to left, transparent, var(--el-40));
}

.divider-diamond {
	width: 8px;
	height: 8px;
	transform: rotate(45deg);
	border: 1px solid var(--el-40);
	background: var(--el-08);
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   SLOTS — the inscribed effects
   ═══════════════════════════════════════════ */

.slots-scroll {
	padding: 8px 24px 20px;
}

.slot-block {
	padding: 8px 0;
}

.slot-text {
	font-size: 0.9rem;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.85);
	font-style: italic;
	text-align: center;
}

/* ── Slot separator ── */

.slot-sep {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 0;
}

.slot-sep-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--el-08));
}

.slot-sep-line:last-child {
	background: linear-gradient(to left, transparent, var(--el-08));
}

.slot-sep-dot {
	width: 3px;
	height: 3px;
	border-radius: 50%;
	background: var(--el-25);
	flex-shrink: 0;
}

/* ── Effect annotations ── */

.effect-row {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	margin-top: 6px;
	font-size: 11px;
}

.eff-type {
	font-weight: 600;
}

.eff-dot {
	color: rgba(255, 255, 255, 0.15);
	font-size: 14px;
	line-height: 1;
}

.eff-action {
	font-weight: 500;
}

.eff-value {
	font-weight: 800;
	font-size: 13px;
	letter-spacing: 0.02em;
}

.eff-self {
	font-size: 10px;
	color: #67e8f9;
	opacity: 0.7;
	font-weight: 500;
	padding-left: 2px;
}

.eff-timing {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.3);
	font-weight: 500;
}
</style>
