<template>
	<Teleport to="body">
		<Transition name="combat-overlay">
			<div v-if="isInCombat" class="fixed inset-0 z-40 pointer-events-none combat-screen">
				<!-- Full-screen dark overlay behind everything -->
				<div class="absolute inset-0 bg-black/40 pointer-events-none combat-bg-fade" />

				<!-- Top Section: ATB Bar + Turn Timer -->
				<div class="absolute top-0 left-1/2 -translate-x-1/2 mt-3 pointer-events-auto combat-slide-down w-[90%] max-w-lg">
					<UnifiedATBBar :players="players" :enemies="enemies" />
					<TurnTimerText class="mt-1.5" :seconds="turnTimeRemaining" :is-visible="isTurnActive" />
				</div>

				<!-- Top Right: Enemy Status Panel -->
				<div class="absolute top-14 right-4 sm:right-[8%] pointer-events-auto combat-slide-right">
					<PartyStatusPanel :party-members="enemyMembers" variant="enemy" />
				</div>

				<!-- Center: Battle Stage -->
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none combat-fade-in">
					<BattleStage class="w-full max-w-5xl mx-4" :party-members="partyMembersWithSprites" :enemies="enemiesWithSprites" />
				</div>

				<!-- Bottom Left: Player Status Panel -->
				<div class="absolute bottom-20 left-4 sm:left-[8%] pointer-events-auto combat-slide-left">
					<PartyStatusPanel :party-members="partyMembers" />
				</div>

				<!-- Bottom Right: Action Bar -->
				<div class="absolute bottom-3 right-4 sm:right-[5%] pointer-events-auto combat-slide-up">
					<ActionBar :is-player-turn="isPlayerTurn" :is-leaving="isLeaving" :abilities="matchStore.match.playerAbilities" @action="handleAction" @ability="handleAbility" @leave-match="handleLeaveMatch" />
				</div>

				<!-- Turn announcement flash -->
				<Transition name="turn-announce">
					<div v-if="showTurnAnnounce" class="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
						<div :class="['turn-announce-text', isPlayerTurn ? 'text-cyan-400' : 'text-red-400']">
							{{ isPlayerTurn ? "YOUR TURN" : "ENEMY TURN" }}
						</div>
					</div>
				</Transition>

				<!-- Damage flash overlay -->
				<div v-if="showDamageFlash" class="absolute inset-0 pointer-events-none damage-flash" />
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

import UnifiedATBBar from "./UnifiedATBBar.vue";
import TurnTimerText from "./TurnTimerText.vue";
import BattleStage from "./BattleStage.vue";
import PartyStatusPanel from "./PartyStatusPanel.vue";
import ActionBar from "./ActionBar.vue";

type SpriteState = "idle" | "attack" | "hurt" | "victory" | "defeat";

// Map NPC names to sprite sheet IDs (registered in SpriteSheetRegistry)
// Falls back to static image for NPCs without a registered sheet
const NPC_SHEET_MAP: Record<string, string> = {
	slime: "slime",
};

// Static sprite fallback for NPCs not in the sheet registry
const NPC_STATIC_SPRITE_MAP: Record<string, string> = {
	skeleton: "/sprites/enemies/skeleton.png",
	goblin: "/sprites/goblin_00.png",
};

const rxjs = useRxjs("scene:state");
const matchStore = useMatchStore();
const websocketStore = useWebSocketStore();
const actions = useMatchActions();

// Visibility
const isInCombat = computed(() => matchStore.currentMatchId !== null);
const isLeaving = ref(false);

// Turn announcement
const showTurnAnnounce = ref(false);
const showDamageFlash = ref(false);

// ATB Bar data
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

// Animation states for sprites
const playerAnimationState = ref<SpriteState>("idle");
const enemyAnimationState = ref<SpriteState>("idle");

// Resolve NPC to either a spriteSheetId or static spriteUrl
function getNpcSpriteData(): { spriteSheetId?: string; spriteUrl?: string } {
	const npcName = matchStore.match.npc?.name?.toLowerCase() ?? "";

	// Check sprite sheet registry first (animated sheets)
	for (const [key, sheetId] of Object.entries(NPC_SHEET_MAP)) {
		if (npcName.includes(key)) return { spriteSheetId: sheetId };
	}

	// Check static sprites
	for (const [key, path] of Object.entries(NPC_STATIC_SPRITE_MAP)) {
		if (npcName.includes(key)) return { spriteUrl: path };
	}

	// Default: slime sprite sheet
	return { spriteSheetId: "slime" };
}

// Battle Stage sprite data
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

// Party Status data
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

// Enemy Status data
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

// Turn state
const isPlayerTurn = computed(() => matchStore.match.turn.isPlayerTurn);
const isTurnActive = computed(() => matchStore.match.turnTimer.visible);
const turnTimeRemaining = computed(() => Math.ceil((matchStore.match.timer.remaining ?? 0) / 1000));

// Watch health decreases -> trigger 'hurt' animation + damage flash
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

// Turn start announcement
watch(
	() => matchStore.match.turnTimer.visible,
	(visible) => {
		if (visible) {
			showTurnAnnounce.value = true;
			setTimeout(() => (showTurnAnnounce.value = false), 800);
		}
	},
);

// Action handlers
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

// Auto-leave on match finish
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
/* Entry animations - staggered, cinematic */
.combat-bg-fade {
	animation: bgFadeIn 300ms ease-out;
}

.combat-slide-down {
	animation: slideDown 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

.combat-slide-left {
	animation: slideLeft 250ms cubic-bezier(0.16, 1, 0.3, 1) 50ms backwards;
}

.combat-slide-right {
	animation: slideRight 250ms cubic-bezier(0.16, 1, 0.3, 1) 50ms backwards;
}

.combat-slide-up {
	animation: slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) 100ms backwards;
}

.combat-fade-in {
	animation: fadeIn 300ms ease-out 75ms backwards;
}

@keyframes bgFadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes slideDown {
	from {
		transform: translateX(-50%) translateY(-30px);
		opacity: 0;
	}
	to {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}
}

@keyframes slideLeft {
	from {
		transform: translateX(-30px);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes slideRight {
	from {
		transform: translateX(30px);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes slideUp {
	from {
		transform: translateY(30px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* Exit animation */
.combat-overlay-leave-active {
	transition: opacity 200ms ease-in;
}

.combat-overlay-leave-to {
	opacity: 0;
}

/* Turn announcement */
.turn-announce-text {
	font-size: 2.5rem;
	font-weight: 900;
	letter-spacing: 0.15em;
	text-shadow:
		0 0 20px currentColor,
		0 0 40px currentColor,
		0 2px 8px rgba(0, 0, 0, 0.8);
	animation: announceIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

/* Damage flash */
.damage-flash {
	background: radial-gradient(ellipse at center, rgba(255, 30, 30, 0.15) 0%, transparent 70%);
	animation: damageFlash 0.2s ease-out forwards;
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
</style>
