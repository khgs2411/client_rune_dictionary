<template>
	<div class="skills-page">
		<!-- Header -->
		<div class="page-header">
			<div class="header-left">
				<Icon icon="game-icons:scroll-unfurled" class="header-icon" />
				<div>
					<h3 class="header-title">Your Skills</h3>
					<p class="header-count">{{ skills.length }} abilities forged</p>
				</div>
			</div>
			<button class="forge-btn" @click="openForge">
				<Icon icon="game-icons:anvil" class="h-4 w-4" />
				Open Rune Forge
			</button>
		</div>

		<div class="columns">
			<!-- Left: Skills List -->
			<div class="column-left">
				<div class="section-header">
					<Icon icon="game-icons:book-pile" class="section-icon" />
					<h4 class="section-title">Skill Collection</h4>
				</div>

				<div class="skill-list-container" @wheel.stop>
					<div v-if="skillsLoading" class="empty-state">
						<Icon icon="radix-icons:update" class="empty-icon animate-spin" />
						<p class="empty-text">Loading skills...</p>
					</div>

					<div v-else-if="skills.length === 0" class="empty-state">
						<Icon icon="game-icons:empty-hourglass" class="empty-icon-lg" />
						<p class="empty-title">No skills yet</p>
						<p class="empty-hint">Open the Rune Forge to create your first ability</p>
					</div>

					<div v-else class="skill-list">
						<div
							v-for="skill in skills"
							:key="skill.ability_id"
							class="skill-card"
							:class="{ 'skill-card--selected': selectedSkill?.ability_id === skill.ability_id }"
							:style="{
								'--el': getSkillColor(skill),
								'--el-20': getSkillColor(skill) + '33',
								'--el-10': getSkillColor(skill) + '1a',
								borderLeftColor: selectedSkill?.ability_id === skill.ability_id ? getSkillColor(skill) : 'transparent',
								boxShadow: selectedSkill?.ability_id === skill.ability_id ? '0 0 20px ' + getSkillColor(skill) + '15, inset 0 0 20px ' + getSkillColor(skill) + '08' : 'none',
							}"
							@click="selectedSkill = skill">
							<div class="skill-card-inner">
								<div class="skill-card-left">
									<div class="skill-icon-box" :style="{ backgroundColor: getSkillColor(skill) + '15' }">
										<Icon :icon="getSkillIcon(skill)" class="skill-icon" :style="{ color: getSkillColor(skill) }" />
									</div>
									<div class="skill-info">
										<p class="skill-name">{{ skill.name }}</p>
										<p class="skill-preview">{{ getSkillPreview(skill) }}</p>
									</div>
								</div>
								<span class="tier-badge" :style="{ backgroundColor: getTierColor(skill.tier) + '20', color: getTierColor(skill.tier) }">
									{{ getTierLabel(skill.tier) }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Skill Detail Panel -->
			<div class="column-right">
				<div class="section-header">
					<Icon icon="game-icons:book-cover" class="section-icon" />
					<h4 class="section-title">Skill Details</h4>
				</div>

				<div class="detail-container">
					<Transition name="slide-fade" mode="out-in">
						<div v-if="selectedSkill" :key="selectedSkill.ability_id" class="detail-panel" :style="{ '--el': getSkillColor(selectedSkill), '--el-40': getSkillColor(selectedSkill) + '66', '--el-25': getSkillColor(selectedSkill) + '40', '--el-15': getSkillColor(selectedSkill) + '26', '--el-08': getSkillColor(selectedSkill) + '14', '--tier': getTierColor(selectedSkill.tier) }">
							<!-- Skill Header with Emblem -->
							<div class="detail-header">
								<div class="detail-emblem-row">
									<div class="emblem-ring">
										<div class="emblem-inner">
											<Icon :icon="getSkillIcon(selectedSkill)" class="emblem-icon" />
										</div>
									</div>
								</div>

								<h4 class="detail-name">{{ selectedSkill.name }}</h4>

								<!-- Tier with wing dividers -->
								<div class="tier-row">
									<span class="tier-wing" />
									<span class="tier-label">{{ getTierLabel(selectedSkill.tier) }}</span>
									<span class="tier-wing" />
								</div>

								<Button variant="ghost" size="icon" class="detail-close" @click="selectedSkill = null">
									<Icon icon="radix-icons:cross-2" class="h-3.5 w-3.5" />
								</Button>
							</div>

							<!-- Ornate divider -->
							<div class="detail-divider">
								<span class="divider-line" />
								<span class="divider-diamond" />
								<span class="divider-line" />
							</div>

							<!-- Slot Effects -->
							<div class="detail-slots" @wheel.stop>
								<template v-for="(slot, index) in sortedSlots(selectedSkill)" :key="index">
									<!-- Separator between slots -->
									<div v-if="index > 0" class="slot-sep">
										<span class="slot-sep-line" />
										<span class="slot-sep-dot" />
										<span class="slot-sep-line" />
									</div>

									<div class="slot-block">
										<p class="slot-text">{{ slot.data.text }}</p>
										<div v-if="slot.data.effects && slot.data.effects.length > 0" class="slot-effects">
											<div v-for="(effect, ei) in slot.data.effects" :key="ei" class="effect-row">
												<span class="eff-type" :style="{ color: effectTypeColor(effect.type) }">
													{{ formatEffectType(effect.type) }}
												</span>
												<span class="eff-dot">&middot;</span>
												<span class="eff-action" :style="{ color: actionColor(effect.action) }">
													{{ formatAction(effect.action) }}
												</span>
												<span v-if="effect.target === 'SELF'" class="eff-self">Self</span>
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>

						<div v-else class="empty-detail">
							<div class="empty-detail-ring">
								<Icon icon="game-icons:book-cover" class="empty-detail-icon" />
							</div>
							<p class="empty-detail-title">No Skill Selected</p>
							<p class="empty-detail-hint">Select a skill from the list to view details</p>
						</div>
					</Transition>
				</div>
			</div>
		</div>

		<!-- Error display -->
		<div v-if="error" class="error-bar">
			<Icon icon="radix-icons:exclamation-triangle" class="h-4 w-4" />
			<span>{{ error }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { CharactersAPI } from "@/api/characters.api";
import { useAuthStore } from "@/stores/auth.store";
import { useForgeStore } from "@/stores/forge.store";
import { getSkillColor, getSkillIcon, getTierColor, getTierLabel, getSkillPreview } from "@/composables/useSkillDisplay";
import type { AbilityModel, SlotData } from "@/common/ability.types";

const charactersApi = new CharactersAPI();
const authStore = useAuthStore();
const forgeStore = useForgeStore();

const skills = ref<AbilityModel[]>([]);
const skillsLoading = ref(true);
const error = ref<string | null>(null);
const selectedSkill = ref<AbilityModel | null>(null);

async function loadSkills() {
	try {
		skills.value = await charactersApi.getAbilities(authStore.username);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load skills";
	} finally {
		skillsLoading.value = false;
	}
}

function openForge() {
	forgeStore.openForge();
}

function sortedSlots(skill: AbilityModel): { key: string; data: SlotData }[] {
	if (!skill.slots) return [];
	return Object.keys(skill.slots)
		.sort((a, b) => Number(a) - Number(b))
		.map((key) => ({ key, data: skill.slots[Number(key)] }));
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

watch(
	() => forgeStore.forgedAbility,
	(newAbility) => {
		if (newAbility) {
			const exists = skills.value.some((s) => s.ability_id === newAbility.ability_id);
			if (!exists) {
				skills.value.unshift(newAbility);
			}
		}
	},
);

onMounted(() => {
	loadSkills();
});
</script>

<style scoped>
/* ═══════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════ */

.skills-page {
	--accent: #d9aa5a;
	--accent-60: #d9aa5a99;
	--accent-40: #d9aa5a66;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.columns {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24px;
	flex: 1;
	overflow: hidden;
}

.column-left,
.column-right {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* ═══════════════════════════════════════════
   PAGE HEADER
   ═══════════════════════════════════════════ */

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12px;
}

.header-icon {
	width: 20px;
	height: 20px;
	color: var(--accent);
	opacity: 0.8;
}

.header-title {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.1rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.9);
	letter-spacing: 0.02em;
}

.header-count {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.3);
	margin-top: 1px;
}

.forge-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	font-size: 0.8rem;
	font-weight: 600;
	color: white;
	background: linear-gradient(135deg, #7c3aed, #4f46e5);
	border: none;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.forge-btn:hover {
	background: linear-gradient(135deg, #6d28d9, #4338ca);
	box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
}

/* ═══════════════════════════════════════════
   SECTION HEADERS
   ═══════════════════════════════════════════ */

.section-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 10px;
}

.section-icon {
	width: 14px;
	height: 14px;
	color: var(--accent);
	opacity: 0.6;
}

.section-title {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.5);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

/* ═══════════════════════════════════════════
   SKILL LIST
   ═══════════════════════════════════════════ */

.skill-list-container {
	flex: 1;
	overflow-y: auto;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	overscroll-behavior: contain;
}

.skill-list {
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

/* ═══════════════════════════════════════════
   SKILL CARD — element-colored left border
   ═══════════════════════════════════════════ */

.skill-card {
	padding: 12px 14px;
	border-radius: 8px;
	border-left: 3px solid transparent;
	background: rgba(255, 255, 255, 0.025);
	cursor: pointer;
	transition: all 0.2s ease;
}

.skill-card:hover {
	background: rgba(255, 255, 255, 0.05);
	transform: translateX(2px);
}

.skill-card--selected {
	background: rgba(255, 255, 255, 0.05);
}

.skill-card-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.skill-card-left {
	display: flex;
	align-items: center;
	gap: 12px;
	min-width: 0;
}

.skill-icon-box {
	width: 38px;
	height: 38px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.skill-icon {
	width: 20px;
	height: 20px;
}

.skill-info {
	min-width: 0;
}

.skill-name {
	font-size: 0.85rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.skill-preview {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.3);
	margin-top: 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.tier-badge {
	font-size: 0.65rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	padding: 3px 8px;
	border-radius: 20px;
	white-space: nowrap;
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   DETAIL PANEL
   ═══════════════════════════════════════════ */

.detail-container {
	flex: 1;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	overflow: hidden;
}

.detail-panel {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.detail-header {
	position: relative;
	padding: 20px 20px 8px;
	text-align: center;
	flex-shrink: 0;
}

.detail-emblem-row {
	display: flex;
	justify-content: center;
	margin-bottom: 10px;
}

/* ═══════════════════════════════════════════
   EMBLEM RING — matching AbilityCard
   ═══════════════════════════════════════════ */

.emblem-ring {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	border: 1.5px solid var(--el-40);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow:
		0 0 24px var(--el-15),
		inset 0 0 16px var(--el-08);
	animation: ringBreath 3.5s ease-in-out infinite;
}

.emblem-inner {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--el-15), var(--el-08));
	display: flex;
	align-items: center;
	justify-content: center;
}

.emblem-icon {
	width: 24px;
	height: 24px;
	color: var(--el);
	filter: drop-shadow(0 0 6px var(--el-40));
}

@keyframes ringBreath {
	0%,
	100% {
		box-shadow:
			0 0 24px var(--el-15),
			inset 0 0 16px var(--el-08);
	}
	50% {
		box-shadow:
			0 0 36px var(--el-25),
			inset 0 0 20px var(--el-15);
	}
}

/* ═══════════════════════════════════════════
   DETAIL NAME — serif with element glow
   ═══════════════════════════════════════════ */

.detail-name {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.2rem;
	font-weight: 700;
	letter-spacing: 0.03em;
	color: rgba(255, 255, 255, 0.95);
	text-shadow: 0 0 20px var(--el-25);
}

.detail-close {
	position: absolute;
	top: 12px;
	right: 12px;
	color: rgba(255, 255, 255, 0.25);
	width: 28px;
	height: 28px;
	border-radius: 6px;
}

.detail-close:hover {
	color: rgba(255, 255, 255, 0.6);
	background: rgba(255, 255, 255, 0.06);
}

/* ═══════════════════════════════════════════
   TIER ROW — rarity with wing dividers
   ═══════════════════════════════════════════ */

.tier-row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 40px 0;
	justify-content: center;
}

.tier-wing {
	flex: 1;
	max-width: 50px;
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
   DETAIL DIVIDER — ornate with diamond
   ═══════════════════════════════════════════ */

.detail-divider {
	display: flex;
	align-items: center;
	padding: 10px 20px 4px;
	flex-shrink: 0;
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
	width: 6px;
	height: 6px;
	transform: rotate(45deg);
	border: 1px solid var(--el-40);
	background: var(--el-08);
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   SLOT EFFECTS — AbilityCard-style
   ═══════════════════════════════════════════ */

.detail-slots {
	flex: 1;
	overflow-y: auto;
	padding: 10px 24px 20px;
	overscroll-behavior: contain;
}

.slot-block {
	padding: 8px 0;
}

.slot-text {
	font-size: 0.88rem;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.8);
	font-style: italic;
	text-align: center;
}

.slot-effects {
	margin-top: 6px;
}

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

/* ═══════════════════════════════════════════
   EFFECT ANNOTATIONS
   ═══════════════════════════════════════════ */

.effect-row {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	margin-top: 4px;
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

.eff-self {
	font-size: 10px;
	color: #67e8f9;
	opacity: 0.7;
	font-weight: 500;
	padding-left: 2px;
}

/* ═══════════════════════════════════════════
   EMPTY STATES
   ═══════════════════════════════════════════ */

.empty-state {
	padding: 48px 24px;
	text-align: center;
}

.empty-icon {
	width: 32px;
	height: 32px;
	color: rgba(255, 255, 255, 0.15);
	margin: 0 auto 8px;
}

.empty-icon-lg {
	width: 48px;
	height: 48px;
	color: rgba(255, 255, 255, 0.1);
	margin: 0 auto 8px;
}

.empty-text {
	font-size: 0.8rem;
	color: rgba(255, 255, 255, 0.3);
}

.empty-title {
	font-size: 0.85rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.3);
}

.empty-hint {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.2);
	margin-top: 4px;
}

.empty-detail {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.empty-detail-ring {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.06);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
}

.empty-detail-icon {
	width: 28px;
	height: 28px;
	color: rgba(255, 255, 255, 0.1);
}

.empty-detail-title {
	font-size: 0.85rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.3);
}

.empty-detail-hint {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.2);
	margin-top: 4px;
}

/* ═══════════════════════════════════════════
   ERROR BAR
   ═══════════════════════════════════════════ */

.error-bar {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 16px;
	padding: 10px 14px;
	background: rgba(239, 68, 68, 0.08);
	color: #f87171;
	font-size: 0.8rem;
	border-radius: 8px;
	border: 1px solid rgba(239, 68, 68, 0.2);
}

/* ═══════════════════════════════════════════
   TRANSITIONS
   ═══════════════════════════════════════════ */

.slide-fade-enter-active {
	transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
	transition: all 0.15s ease-in;
}

.slide-fade-enter-from {
	opacity: 0;
	transform: translateX(10px);
}

.slide-fade-leave-to {
	opacity: 0;
	transform: translateX(-10px);
}
</style>
