<template>
	<div class="loadout-page">
		<!-- Header -->
		<div class="page-header">
			<div class="header-left">
				<Icon icon="game-icons:shoulder-armor" class="header-icon" />
				<div>
					<h3 class="header-title">Combat Loadout</h3>
					<p class="header-sub">Equip skills for your next battle</p>
				</div>
			</div>
			<!-- Sync indicator -->
			<div v-if="loadoutStore.isSyncing" class="sync-indicator">
				<Icon icon="radix-icons:update" class="h-3 w-3 animate-spin" />
				<span>Saving...</span>
			</div>
		</div>

		<div class="columns">
			<!-- Left: Equipped Skills -->
			<div class="column-left">
				<div class="section-header">
					<Icon icon="game-icons:crystal-bars" class="section-icon" />
					<h4 class="section-title">Equipped</h4>
					<span class="slot-count">{{ loadoutStore.equippedCount }}/{{ maxSlots }}</span>
				</div>

				<div class="slot-grid">
					<div
						v-for="slot in maxSlots"
						:key="slot"
						class="equip-slot"
						:class="{ 'equip-slot--filled': loadoutStore.equippedSlots[slot - 1] }"
						:style="loadoutStore.equippedSlots[slot - 1] ? {
							'--el': getSkillColor(loadoutStore.equippedSlots[slot - 1]!),
							borderColor: getSkillColor(loadoutStore.equippedSlots[slot - 1]!) + '40',
							boxShadow: '0 0 20px ' + getSkillColor(loadoutStore.equippedSlots[slot - 1]!) + '12, inset 0 0 20px ' + getSkillColor(loadoutStore.equippedSlots[slot - 1]!) + '06',
						} : {}">
						<!-- Filled Slot -->
						<template v-if="loadoutStore.equippedSlots[slot - 1]">
							<div class="slot-content" @click="loadoutStore.unequipSkill(slot - 1)">
								<div
									class="slot-icon-box"
									:style="{ backgroundColor: getSkillColor(loadoutStore.equippedSlots[slot - 1]!) + '15' }">
									<Icon
										:icon="getSkillIcon(loadoutStore.equippedSlots[slot - 1]!)"
										class="slot-skill-icon"
										:style="{ color: getSkillColor(loadoutStore.equippedSlots[slot - 1]!) }" />
								</div>
								<p class="slot-skill-name">{{ loadoutStore.equippedSlots[slot - 1]!.name }}</p>
								<span
									class="slot-tier"
									:style="{
										backgroundColor: getTierColor(loadoutStore.equippedSlots[slot - 1]!.tier) + '20',
										color: getTierColor(loadoutStore.equippedSlots[slot - 1]!.tier),
									}">
									{{ getTierLabel(loadoutStore.equippedSlots[slot - 1]!.tier) }}
								</span>
							</div>
							<!-- Unequip Button -->
							<button class="unequip-btn" @click.stop="loadoutStore.unequipSkill(slot - 1)">
								<Icon icon="radix-icons:cross-2" class="h-3 w-3" />
							</button>
						</template>

						<!-- Empty Slot -->
						<template v-else>
							<div class="slot-empty">
								<div class="slot-empty-ring">
									<Icon icon="radix-icons:plus" class="slot-empty-icon" />
								</div>
								<p class="slot-empty-label">Slot {{ slot }}</p>
								<p class="slot-empty-hint">Empty</p>
							</div>
						</template>
					</div>
				</div>

				<!-- Loadout Summary -->
				<div class="summary-card">
					<div class="summary-divider">
						<span class="summary-div-line" />
						<span class="summary-div-label">Loadout Summary</span>
						<span class="summary-div-line" />
					</div>
					<div class="summary-stats">
						<div class="stat-box">
							<p class="stat-value stat-value--accent">{{ loadoutStore.equippedCount }}</p>
							<p class="stat-label">Equipped</p>
						</div>
						<div class="stat-box">
							<p class="stat-value">{{ maxSlots - loadoutStore.equippedCount }}</p>
							<p class="stat-label">Available</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Available Skills -->
			<div class="column-right">
				<div class="section-header">
					<Icon icon="game-icons:scroll-unfurled" class="section-icon" />
					<h4 class="section-title">Available Skills</h4>
					<span class="section-count">({{ availableSkills.length }})</span>
				</div>

				<div class="avail-list-container" @wheel.stop>
					<div v-if="loading || loadoutStore.isLoading" class="empty-state">
						<Icon icon="radix-icons:update" class="empty-icon animate-spin" />
						<p class="empty-text">Loading skills...</p>
					</div>

					<div v-else-if="availableSkills.length === 0" class="empty-state">
						<Icon icon="game-icons:empty-hourglass" class="empty-icon-lg" />
						<p class="empty-title">No skills available</p>
						<p class="empty-hint">Forge skills in the Skills tab</p>
					</div>

					<div v-else class="avail-list">
						<div
							v-for="skill in availableSkills"
							:key="skill.ability_id"
							class="avail-card"
							:class="{ 'avail-card--equipped': loadoutStore.isEquipped(skill.ability_id) }"
							:style="{
								borderLeftColor: loadoutStore.isEquipped(skill.ability_id) ? 'transparent' : getSkillColor(skill) + '50',
							}"
							@click="!loadoutStore.isEquipped(skill.ability_id) && equipToNextSlot(skill)">
							<div class="avail-card-inner">
								<div
									class="avail-icon-box"
									:style="{ backgroundColor: getSkillColor(skill) + '15' }">
									<Icon :icon="getSkillIcon(skill)" class="avail-icon" :style="{ color: getSkillColor(skill) }" />
								</div>
								<div class="avail-info">
									<div class="avail-name-row">
										<p class="avail-name">{{ skill.name }}</p>
										<span
											class="avail-tier"
											:style="{
												backgroundColor: getTierColor(skill.tier) + '20',
												color: getTierColor(skill.tier),
											}">
											T{{ skill.tier }}
										</span>
									</div>
									<p class="avail-preview">{{ getSkillPreview(skill, 50) }}</p>
								</div>
								<div class="avail-action">
									<template v-if="loadoutStore.isEquipped(skill.ability_id)">
										<span class="equipped-label">Equipped</span>
									</template>
									<template v-else-if="loadoutStore.equippedCount < maxSlots">
										<button class="equip-btn" @click.stop="equipToNextSlot(skill)">
											<Icon icon="radix-icons:plus" class="h-3 w-3" />
											Equip
										</button>
									</template>
									<template v-else>
										<span class="full-label">Full</span>
									</template>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error display -->
		<div v-if="error || loadoutStore.error" class="error-bar">
			<Icon icon="radix-icons:exclamation-triangle" class="h-4 w-4" />
			<span>{{ error || loadoutStore.error }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { CharactersAPI } from "@/api/characters.api";
import { useAuthStore } from "@/stores/auth.store";
import { useLoadoutStore } from "@/stores/loadout.store";
import { getSkillColor, getSkillIcon, getTierColor, getTierLabel, getSkillPreview } from "@/composables/useSkillDisplay";
import type { AbilityModel } from "@/common/ability.types";

const charactersApi = new CharactersAPI();
const authStore = useAuthStore();
const loadoutStore = useLoadoutStore();

const maxSlots = 4;

const availableSkills = ref<AbilityModel[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadSkills() {
	try {
		availableSkills.value = await charactersApi.getAbilities(authStore.username);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Failed to load skills";
	} finally {
		loading.value = false;
	}
}

function equipToNextSlot(skill: AbilityModel) {
	const nextSlot = loadoutStore.getNextAvailableSlot();
	if (nextSlot !== -1) {
		loadoutStore.equipSkill(skill, nextSlot);
	}
}

onMounted(async () => {
	await Promise.all([loadSkills(), loadoutStore.loadLoadout()]);
});
</script>

<style scoped>
/* ═══════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════ */

.loadout-page {
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

.column-left {
	display: flex;
	flex-direction: column;
}

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

.header-sub {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.3);
	margin-top: 1px;
}

.sync-indicator {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 0.7rem;
	color: var(--accent-60);
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

.slot-count {
	margin-left: auto;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.25);
}

.section-count {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.25);
}

/* ═══════════════════════════════════════════
   EQUIPPED SLOT GRID
   ═══════════════════════════════════════════ */

.slot-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
}

.equip-slot {
	aspect-ratio: 1;
	border-radius: 10px;
	border: 1px dashed rgba(255, 255, 255, 0.08);
	position: relative;
	overflow: hidden;
	transition: all 0.25s ease;
}

.equip-slot--filled {
	border-style: solid;
	background: rgba(255, 255, 255, 0.02);
}

.equip-slot--filled:hover {
	background: rgba(255, 255, 255, 0.04);
}

.slot-content {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 12px;
	cursor: pointer;
}

.slot-icon-box {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
}

.slot-skill-icon {
	width: 26px;
	height: 26px;
}

.slot-skill-name {
	font-size: 0.8rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	text-align: center;
	width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.slot-tier {
	font-size: 0.6rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	padding: 2px 8px;
	border-radius: 20px;
	margin-top: 6px;
}

.unequip-btn {
	position: absolute;
	top: 8px;
	right: 8px;
	width: 22px;
	height: 22px;
	border-radius: 4px;
	border: none;
	background: rgba(0, 0, 0, 0.5);
	color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	opacity: 0;
	transition: all 0.15s ease;
}

.equip-slot:hover .unequip-btn {
	opacity: 1;
}

.unequip-btn:hover {
	background: rgba(248, 113, 113, 0.2);
	color: #f87171;
}

/* ═══════════════════════════════════════════
   EMPTY SLOT
   ═══════════════════════════════════════════ */

.slot-empty {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.slot-empty-ring {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	border: 1px dashed rgba(255, 255, 255, 0.08);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
}

.slot-empty-icon {
	width: 18px;
	height: 18px;
	color: rgba(255, 255, 255, 0.1);
}

.slot-empty-label {
	font-size: 0.7rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.2);
}

.slot-empty-hint {
	font-size: 0.65rem;
	color: rgba(255, 255, 255, 0.1);
	margin-top: 2px;
}

/* ═══════════════════════════════════════════
   LOADOUT SUMMARY
   ═══════════════════════════════════════════ */

.summary-card {
	margin-top: 14px;
	padding: 14px 16px;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
}

.summary-divider {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 12px;
}

.summary-div-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--accent-40));
}

.summary-div-line:last-child {
	background: linear-gradient(to left, transparent, var(--accent-40));
}

.summary-div-label {
	font-size: 0.65rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.35);
	text-transform: uppercase;
	letter-spacing: 0.12em;
	white-space: nowrap;
}

.summary-stats {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
}

.stat-box {
	padding: 10px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.03);
	text-align: center;
}

.stat-value {
	font-size: 1.5rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.2);
	line-height: 1;
}

.stat-value--accent {
	color: var(--accent);
}

.stat-label {
	font-size: 0.65rem;
	color: rgba(255, 255, 255, 0.25);
	margin-top: 4px;
}

/* ═══════════════════════════════════════════
   AVAILABLE SKILLS LIST
   ═══════════════════════════════════════════ */

.avail-list-container {
	flex: 1;
	overflow-y: auto;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: rgba(255, 255, 255, 0.02);
	overscroll-behavior: contain;
}

.avail-list {
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.avail-card {
	padding: 10px 12px;
	border-radius: 8px;
	border-left: 3px solid transparent;
	background: rgba(255, 255, 255, 0.025);
	transition: all 0.2s ease;
	cursor: pointer;
}

.avail-card:hover:not(.avail-card--equipped) {
	background: rgba(255, 255, 255, 0.05);
	transform: translateX(2px);
}

.avail-card--equipped {
	opacity: 0.45;
	cursor: default;
}

.avail-card-inner {
	display: flex;
	align-items: center;
	gap: 10px;
}

.avail-icon-box {
	width: 36px;
	height: 36px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avail-icon {
	width: 18px;
	height: 18px;
}

.avail-info {
	flex: 1;
	min-width: 0;
}

.avail-name-row {
	display: flex;
	align-items: center;
	gap: 6px;
}

.avail-name {
	font-size: 0.8rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.avail-tier {
	font-size: 0.6rem;
	font-weight: 700;
	padding: 1px 6px;
	border-radius: 4px;
	white-space: nowrap;
	flex-shrink: 0;
}

.avail-preview {
	font-size: 0.68rem;
	color: rgba(255, 255, 255, 0.25);
	margin-top: 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.avail-action {
	flex-shrink: 0;
}

.equipped-label {
	font-size: 0.68rem;
	font-weight: 600;
	color: var(--accent-60);
}

.equip-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	font-size: 0.7rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.5);
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.equip-btn:hover {
	color: rgba(255, 255, 255, 0.8);
	border-color: rgba(255, 255, 255, 0.25);
	background: rgba(255, 255, 255, 0.05);
}

.full-label {
	font-size: 0.68rem;
	color: rgba(255, 255, 255, 0.15);
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
</style>
