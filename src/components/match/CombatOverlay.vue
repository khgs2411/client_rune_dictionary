<template>
	<Teleport to="body">
		<Transition name="combat-overlay">
			<div v-if="isInCombat" class="fixed inset-0 z-40 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="combat-backdrop" />

				<!-- Grimoire Battle Frame -->
				<div class="battle-frame">
					<!-- Shimmer sweep -->
					<div class="frame-shimmer" />

					<!-- Corner ornaments -->
					<div class="corner-ornament tl" />
					<div class="corner-ornament tr" />
					<div class="corner-ornament bl" />
					<div class="corner-ornament br" />

					<!-- Atmospheric layers -->
					<div class="frame-glow" />
					<div class="frame-vignette" />

					<!-- Content wrapper (above atmosphere) -->
					<div class="frame-body">
						<!-- Turn Timer Bar (top) -->
						<div class="frame-timer">
							<TurnTimerBar
								:seconds="turnTimeRemaining"
								:max-seconds="turnMaxSeconds"
								:is-visible="isTurnActive"
								:is-player-turn="isPlayerTurn" />
						</div>

						<!-- Ornate divider below timer -->
						<div class="frame-divider">
							<span class="divider-line" />
							<span class="divider-diamond" />
							<span class="divider-line" />
						</div>

						<!-- Main battle content: Status | Stage | Status -->
						<div class="battle-content">
							<!-- Left: Player Status -->
							<div class="status-column">
								<PartyStatusPanel
									:party-members="partyMembers"
									:atb-progress="players[0]?.readiness ?? 0"
									:active-effects="playerActiveEffects" />
							</div>

							<!-- Center: Battle Stage + Floating Numbers -->
							<div class="stage-column">
								<BattleStage :party-members="partyMembersWithSprites" :enemies="enemiesWithSprites" />

								<!-- Floating numbers - Player side -->
								<div class="float-nums float-nums-left">
									<FloatingNumber
										v-for="num in playerFloatingNumbers"
										:key="num.id"
										:value="num.value"
										:type="num.type" />
								</div>

								<!-- Floating numbers - Enemy side -->
								<div class="float-nums float-nums-right">
									<FloatingNumber
										v-for="num in enemyFloatingNumbers"
										:key="num.id"
										:value="num.value"
										:type="num.type" />
								</div>

								<!-- Turn announcement flash -->
								<Transition name="turn-announce">
									<div v-if="showTurnAnnounce" class="turn-announce-overlay">
										<div :class="['turn-announce-text', isPlayerTurn ? 'announce-player' : 'announce-enemy']">
											{{ isPlayerTurn ? "YOUR TURN" : "ENEMY TURN" }}
										</div>
									</div>
								</Transition>

								<!-- Damage flash -->
								<div v-if="showDamageFlash" class="damage-flash" />
							</div>

							<!-- Right: Enemy Status -->
							<div class="status-column">
								<PartyStatusPanel
									:party-members="enemyMembers"
									variant="enemy"
									:atb-progress="enemies[0]?.readiness ?? 0"
									:active-effects="npcActiveEffects" />
							</div>
						</div>

						<!-- Ornate divider above action bar -->
						<div class="frame-divider">
							<span class="divider-line" />
							<span class="divider-diamond" />
							<span class="divider-line" />
						</div>

						<!-- Action Bar (bottom) -->
						<div class="frame-actions">
							<ActionBar
								:is-player-turn="isPlayerTurn"
								:is-leaving="isLeaving"
								:abilities="matchStore.match.playerAbilities"
								@action="handleAction"
								@ability="handleAbility"
								@leave-match="handleLeaveMatch" />
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import MatchAPI from "@/api/match.api";
import { E_SceneState } from "@/game/systems/SceneState";
import { useMatchActions } from "@/composables/useMatchActions";
import { useMatchStore } from "@/stores/match.store";
import { useWebSocketStore } from "@/stores/websocket.store";
import { useRxjs } from "topsyde-utils";

import TurnTimerBar from "./TurnTimerBar.vue";
import BattleStage from "./BattleStage.vue";
import PartyStatusPanel from "./PartyStatusPanel.vue";
import ActionBar from "./ActionBar.vue";
import FloatingNumber from "./FloatingNumber.vue";

type SpriteState = "idle" | "attack" | "hurt" | "victory" | "defeat";

const NPC_SHEET_MAP: Record<string, string> = {
	slime: "slime",
};

const NPC_STATIC_SPRITE_MAP: Record<string, string> = {
	skeleton: "/sprites/enemies/skeleton.png",
	goblin: "/sprites/goblin_00.png",
};

const rxjs = useRxjs("scene:state");
const matchStore = useMatchStore();
const websocketStore = useWebSocketStore();
const actions = useMatchActions();

const isInCombat = computed(() => matchStore.currentMatchId !== null);
const isLeaving = ref(false);

const showTurnAnnounce = ref(false);
const showDamageFlash = ref(false);

const players = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		readiness: matchStore.match.player?.readiness ?? 0,
	},
]);

const enemies = computed(() => [
	{
		id: "enemy",
		name: matchStore.match.npc?.name ?? "Enemy",
		readiness: matchStore.match.npc?.readiness ?? 0,
	},
]);

const playerAnimationState = ref<SpriteState>("idle");
const enemyAnimationState = ref<SpriteState>("idle");

function getNpcSpriteData(): { spriteSheetId?: string; spriteUrl?: string } {
	const npcName = matchStore.match.npc?.name?.toLowerCase() ?? "";

	for (const [key, sheetId] of Object.entries(NPC_SHEET_MAP)) {
		if (npcName.includes(key)) return { spriteSheetId: sheetId };
	}

	for (const [key, path] of Object.entries(NPC_STATIC_SPRITE_MAP)) {
		if (npcName.includes(key)) return { spriteUrl: path };
	}

	return { spriteSheetId: "slime" };
}

const partyMembersWithSprites = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		spriteSheetId: "local-player",
		animationState: playerAnimationState.value,
		flipX: false,
	},
]);

const enemiesWithSprites = computed(() => {
	const npcSprite = getNpcSpriteData();
	return [
		{
			id: "enemy",
			name: matchStore.match.npc?.name ?? "Enemy",
			...npcSprite,
			animationState: enemyAnimationState.value,
			flipX: false,
		},
	];
});

const partyMembers = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		hp: matchStore.match.player?.health ?? 0,
		maxHp: matchStore.match.player?.maxHealth ?? 1,
		mp: 10,
		maxMp: 10,
		statusEffects: [],
	},
]);

const enemyMembers = computed(() => [
	{
		id: "enemy",
		name: matchStore.match.npc?.name ?? "Enemy",
		hp: matchStore.match.npc?.health ?? 0,
		maxHp: matchStore.match.npc?.maxHealth ?? 1,
		mp: 0,
		maxMp: 0,
		statusEffects: [],
	},
]);

const floatingNumbers = computed(() => matchStore.match.choreographer.floatingNumbers);

const playerFloatingNumbers = computed(() =>
	(floatingNumbers.value ?? []).filter(n => matchStore.match.player && n.targetId === matchStore.match.player.entityId),
);
const enemyFloatingNumbers = computed(() =>
	(floatingNumbers.value ?? []).filter(n => matchStore.match.npc && n.targetId === matchStore.match.npc.entityId),
);

const playerActiveEffects = computed(() => {
	const playerId = matchStore.match.player?.entityId;
	if (!playerId) return [];
	return matchStore.match.activeEffects[playerId] ?? [];
});

const npcActiveEffects = computed(() => {
	const npcId = matchStore.match.npc?.entityId;
	if (!npcId) return [];
	return matchStore.match.activeEffects[npcId] ?? [];
});

const isPlayerTurn = computed(() => matchStore.match.turn.isPlayerTurn && !matchStore.match.choreographer.isAnimating);
const isTurnActive = computed(() => matchStore.match.turnTimer.visible);
const turnTimeRemaining = computed(() => Math.ceil((matchStore.match.timer.remaining ?? 0) / 1000));
const turnMaxSeconds = computed(() => Math.ceil((matchStore.match.timer.duration ?? 30000) / 1000));

watch(
	() => matchStore.match.player?.health,
	(newHp, oldHp) => {
		if (oldHp !== undefined && newHp !== undefined && newHp < oldHp) {
			playerAnimationState.value = "hurt";
			showDamageFlash.value = true;
			setTimeout(() => (playerAnimationState.value = "idle"), 400);
			setTimeout(() => (showDamageFlash.value = false), 200);
		}
	},
);

watch(
	() => matchStore.match.npc?.health,
	(newHp, oldHp) => {
		if (oldHp !== undefined && newHp !== undefined && newHp < oldHp) {
			enemyAnimationState.value = "hurt";
			setTimeout(() => (enemyAnimationState.value = "idle"), 400);
		}
	},
);

watch(
	() => matchStore.match.turnTimer.visible,
	(visible) => {
		if (visible) {
			showTurnAnnounce.value = true;
			setTimeout(() => (showTurnAnnounce.value = false), 800);
		}
	},
);

async function handleAction(action: number | string) {
	if (action === "attack") {
		playerAnimationState.value = "attack";
		setTimeout(() => (playerAnimationState.value = "idle"), 350);
	}

	switch (action) {
		case "attack":
			actions.attack();
			break;
		case "pass":
			actions.pass();
			break;
		case "run":
			actions.run();
			break;
		default:
			actions.sendAction(action.toString());
	}
}

function handleAbility(abilityId: string) {
	playerAnimationState.value = "attack";
	setTimeout(() => (playerAnimationState.value = "idle"), 350);
	actions.useAbility(abilityId);
}

async function handleLeaveMatch() {
	if (!matchStore.currentMatchId || !websocketStore.clientData) return;

	isLeaving.value = true;

	try {
		const api = new MatchAPI();
		await api.leaveMatch({
			whoami: websocketStore.clientData,
			matchId: matchStore.currentMatchId,
		});

		matchStore.$reset();
		rxjs.$next("onStateChange", E_SceneState.OVERWORLD);
	} catch (error) {
		console.error("[CombatOverlay] Failed to leave match:", error);
	} finally {
		isLeaving.value = false;
	}
}

watch(
	() => matchStore.matchState,
	async (state) => {
		if (state === "FINISHED") {
			const isVictory = matchStore.matchResult?.winner === "player";
			playerAnimationState.value = isVictory ? "victory" : "defeat";
			enemyAnimationState.value = isVictory ? "defeat" : "victory";

			setTimeout(() => handleLeaveMatch(), 1200);
		}
	},
);
</script>

<style scoped>
/* ═══════════════════════════════════════════
   CSS CUSTOM PROPERTIES — grimoire gold palette
   ═══════════════════════════════════════════ */

.battle-frame {
	--accent: #d9aa5a;
	--accent-60: rgba(217, 170, 90, 0.6);
	--accent-40: rgba(217, 170, 90, 0.4);
	--accent-25: rgba(217, 170, 90, 0.25);
	--accent-15: rgba(217, 170, 90, 0.15);
	--accent-08: rgba(217, 170, 90, 0.08);
}

/* ═══════════════════════════════════════════
   BACKDROP
   ═══════════════════════════════════════════ */

.combat-backdrop {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.75);
	backdrop-filter: blur(4px);
	animation: bgFadeIn 300ms ease-out;
}

/* ═══════════════════════════════════════════
   BATTLE FRAME — the grimoire container
   ═══════════════════════════════════════════ */

.battle-frame {
	position: relative;
	z-index: 10;
	width: 95%;
	max-width: 1000px;
	height: 400px;
	border-radius: 12px;
	overflow: hidden;
	border: 1px solid var(--accent-40);
	background: #0b0b13;
	box-shadow:
		0 0 60px var(--accent-08),
		0 0 120px rgba(0, 0, 0, 0.5),
		0 8px 40px rgba(0, 0, 0, 0.7);
	display: flex;
	flex-direction: column;
	animation: frameIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes frameIn {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* ═══════════════════════════════════════════
   SHIMMER
   ═══════════════════════════════════════════ */

.frame-shimmer {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
	z-index: 5;
	border-radius: 12px;
}

.frame-shimmer::after {
	content: "";
	position: absolute;
	top: -100%;
	left: -100%;
	width: 300%;
	height: 300%;
	background: linear-gradient(
		50deg,
		transparent 35%,
		rgba(255, 255, 255, 0.012) 42%,
		rgba(255, 255, 255, 0.03) 50%,
		rgba(255, 255, 255, 0.012) 58%,
		transparent 65%
	);
	animation: shimmerSweep 6s ease-in-out infinite;
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
   CORNER ORNAMENTS
   ═══════════════════════════════════════════ */

.corner-ornament {
	position: absolute;
	width: 18px;
	height: 18px;
	pointer-events: none;
	z-index: 6;
	opacity: 0.6;
}

.corner-ornament.tl {
	top: 8px;
	left: 8px;
	border-top: 1.5px solid var(--accent-60);
	border-left: 1.5px solid var(--accent-60);
}

.corner-ornament.tr {
	top: 8px;
	right: 8px;
	border-top: 1.5px solid var(--accent-60);
	border-right: 1.5px solid var(--accent-60);
}

.corner-ornament.bl {
	bottom: 8px;
	left: 8px;
	border-bottom: 1.5px solid var(--accent-60);
	border-left: 1.5px solid var(--accent-60);
}

.corner-ornament.br {
	bottom: 8px;
	right: 8px;
	border-bottom: 1.5px solid var(--accent-60);
	border-right: 1.5px solid var(--accent-60);
}

/* ═══════════════════════════════════════════
   ATMOSPHERIC LAYERS
   ═══════════════════════════════════════════ */

.frame-glow {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 1;
	background: radial-gradient(ellipse at 50% 0%, var(--accent-15), transparent 55%);
}

.frame-vignette {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 2;
	background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
}

/* ═══════════════════════════════════════════
   FRAME BODY
   ═══════════════════════════════════════════ */

.frame-body {
	position: relative;
	z-index: 3;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

/* Turn timer section */
.frame-timer {
	padding: 10px 16px 4px;
	flex-shrink: 0;
}

/* Ornate dividers */
.frame-divider {
	display: flex;
	align-items: center;
	gap: 0;
	padding: 4px 16px;
	flex-shrink: 0;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--accent-25));
}

.divider-line:last-child {
	background: linear-gradient(to left, transparent, var(--accent-25));
}

.divider-diamond {
	width: 6px;
	height: 6px;
	transform: rotate(45deg);
	border: 1px solid var(--accent-40);
	background: var(--accent-08);
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   MAIN BATTLE CONTENT — 3-column layout
   ═══════════════════════════════════════════ */

.battle-content {
	flex: 1;
	display: flex;
	gap: 0;
	overflow: hidden;
	min-height: 0;
}

/* Side status columns */
.status-column {
	width: 180px;
	flex-shrink: 0;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

/* Center stage */
.stage-column {
	flex: 1;
	position: relative;
	min-width: 0;
	overflow: hidden;
}

/* Floating numbers overlaid on stage */
.float-nums {
	position: absolute;
	top: 30%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	pointer-events: none;
	z-index: 20;
}

.float-nums-left {
	left: 15%;
}

.float-nums-right {
	right: 15%;
}

/* Turn announcement overlay (inside stage) */
.turn-announce-overlay {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	z-index: 30;
}

/* Damage flash (inside stage) */
.damage-flash {
	position: absolute;
	inset: 0;
	pointer-events: none;
	background: radial-gradient(ellipse at center, rgba(255, 30, 30, 0.15) 0%, transparent 70%);
	animation: damageFlash 0.2s ease-out forwards;
	z-index: 25;
}

/* Action bar section */
.frame-actions {
	padding: 4px 8px 8px;
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   TURN ANNOUNCEMENT — grimoire serif style
   ═══════════════════════════════════════════ */

.turn-announce-text {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 2rem;
	font-weight: 900;
	letter-spacing: 0.12em;
	-webkit-text-stroke: 1px rgba(0, 0, 0, 0.5);
	paint-order: stroke fill;
	animation: announceIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.announce-player {
	color: #22d3ee;
	text-shadow:
		0 0 20px rgba(34, 211, 238, 0.6),
		0 0 40px rgba(34, 211, 238, 0.3),
		0 2px 8px rgba(0, 0, 0, 0.8);
}

.announce-enemy {
	color: #f87171;
	text-shadow:
		0 0 20px rgba(248, 113, 113, 0.6),
		0 0 40px rgba(248, 113, 113, 0.3),
		0 2px 8px rgba(0, 0, 0, 0.8);
}

@keyframes announceIn {
	0% {
		transform: scale(2);
		opacity: 0;
	}
	30% {
		transform: scale(1);
		opacity: 1;
	}
	70% {
		transform: scale(1);
		opacity: 1;
	}
	100% {
		transform: scale(0.95);
		opacity: 0;
	}
}

.turn-announce-enter-active {
	transition: none;
}
.turn-announce-leave-active {
	transition: opacity 0.15s ease-out;
}
.turn-announce-leave-to {
	opacity: 0;
}

/* ═══════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════ */

@keyframes bgFadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes damageFlash {
	0% {
		opacity: 0;
	}
	30% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

/* Exit */
.combat-overlay-leave-active {
	transition: opacity 200ms ease-in;
}

.combat-overlay-leave-to {
	opacity: 0;
}

/* ═══════════════════════════════════════════
   RESPONSIVE — stack on small screens
   ═══════════════════════════════════════════ */

@media (max-width: 640px) {
	.battle-content {
		flex-direction: column;
	}

	.status-column {
		width: 100%;
		flex-direction: row;
		justify-content: center;
		padding: 4px 8px;
	}

	.stage-column {
		min-height: 200px;
	}
}
</style>
