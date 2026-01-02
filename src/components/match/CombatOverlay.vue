<template>
	<Teleport to="body">
		<Transition name="combat-overlay">
			<div v-if="isInCombat" class="fixed inset-0 z-40 pointer-events-none">
				<!-- Top Section: ATB Bar + Turn Timer -->
				<div class="absolute top-0 left-1/2 -translate-x-1/2 mt-4 pointer-events-auto combat-slide-down">
					<UnifiedATBBar :players="players" :enemies="enemies" />
					<TurnTimerText class="mt-2" :seconds="turnTimeRemaining" :is-visible="isTurnActive" />
				</div>

				<!-- Top Right: Enemy Status (diagonal from player) -->
				<div class="absolute top-16 right-[20%] pointer-events-auto combat-slide-right">
					<PartyStatusPanel :party-members="enemyMembers" variant="enemy" />
				</div>

				<!-- Center: Battle Stage (Vue-native sprites) -->
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none combat-fade-in">
					<BattleStage class="w-full max-w-4xl" :party-members="partyMembersWithSprites" :enemies="enemiesWithSprites" />
				</div>

				<!-- Bottom Left: Party Status (diagonal from enemy) -->
				<div class="absolute bottom-16 left-[20%] pointer-events-auto combat-slide-left">
					<PartyStatusPanel :party-members="partyMembers" />
				</div>

				<!-- Bottom Right: Action Bar -->
				<div class="absolute bottom-4 right-4 pointer-events-auto combat-slide-right">
					<ActionBar :is-player-turn="isPlayerTurn" :is-leaving="isLeaving" @action="handleAction" @leave-match="handleLeaveMatch" />
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

import UnifiedATBBar from "./UnifiedATBBar.vue";
import TurnTimerText from "./TurnTimerText.vue";
import BattleStage from "./BattleStage.vue";
import PartyStatusPanel from "./PartyStatusPanel.vue";
import ActionBar from "./ActionBar.vue";

type SpriteState = "idle" | "attack" | "hurt" | "victory" | "defeat";

const rxjs = useRxjs("scene:state");
const matchStore = useMatchStore();
const websocketStore = useWebSocketStore();
const actions = useMatchActions();

// Visibility
const isInCombat = computed(() => matchStore.currentMatchId !== null);
const isLeaving = ref(false);

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

// Battle Stage sprite data
const partyMembersWithSprites = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		spriteUrl: "/sprites/knight_00.png", // TODO: Get from player data
		animationState: playerAnimationState.value,
		flipX: false, // Knight natively faces right (toward enemy)
	},
]);

const enemiesWithSprites = computed(() => [
	{
		id: "enemy",
		name: matchStore.match.npc?.name ?? "Enemy",
		spriteUrl: "/sprites/goblin_00.png", // TODO: Get from NPC data
		animationState: enemyAnimationState.value,
		flipX: false, // Goblin natively faces left (toward player)
	},
]);

// Party Status data
const partyMembers = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		hp: matchStore.match.player?.health ?? 0,
		maxHp: matchStore.match.player?.maxHealth ?? 1,
		mp: 10, // TODO: Add MP to participant interface
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

// Watch health decreases → trigger 'hurt' animation
watch(
	() => matchStore.match.player?.health,
	(newHp, oldHp) => {
		if (oldHp !== undefined && newHp !== undefined && newHp < oldHp) {
			playerAnimationState.value = "hurt";
			setTimeout(() => (playerAnimationState.value = "idle"), 300);
		}
	},
);

watch(
	() => matchStore.match.npc?.health,
	(newHp, oldHp) => {
		if (oldHp !== undefined && newHp !== undefined && newHp < oldHp) {
			enemyAnimationState.value = "hurt";
			setTimeout(() => (enemyAnimationState.value = "idle"), 300);
		}
	},
);

// Action handlers
async function handleAction(action: number | string) {
	console.log("[CombatOverlay] Action received:", action);

	if (action === "attack") {
		playerAnimationState.value = "attack";
		setTimeout(() => (playerAnimationState.value = "idle"), 300);
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

async function handleLeaveMatch() {
	if (!matchStore.currentMatchId || !websocketStore.clientData) {
		console.warn("[CombatOverlay] Cannot leave - missing match ID or client data");
		return;
	}

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
			// Determine winner and trigger victory/defeat animation
			const isVictory = matchStore.matchResult?.winner === "player";
			playerAnimationState.value = isVictory ? "victory" : "defeat";
			enemyAnimationState.value = isVictory ? "defeat" : "victory";

			// Wait for animation then leave
			setTimeout(() => handleLeaveMatch(), 500);
		}
	},
);
</script>

<style scoped>
/* Entry animations - staggered, snappy */
.combat-slide-down {
	animation: slideDown 150ms ease-out;
}

.combat-slide-left {
	animation: slideLeft 150ms ease-out 25ms backwards;
}

.combat-slide-right {
	animation: slideRight 150ms ease-out 25ms backwards;
}

.combat-fade-in {
	animation: fadeIn 150ms ease-out 50ms backwards;
}

@keyframes slideDown {
	from {
		transform: translateX(-50%) translateY(-20px);
		opacity: 0;
	}
	to {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}
}

@keyframes slideLeft {
	from {
		transform: translateX(-20px);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes slideRight {
	from {
		transform: translateX(20px);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

/* Exit animation - all at once, fast */
.combat-overlay-leave-active {
	transition: opacity 100ms ease-in;
}

.combat-overlay-leave-to {
	opacity: 0;
}
</style>
