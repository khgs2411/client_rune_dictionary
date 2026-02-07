<template>
	<div class="atb-bar-wrapper relative rounded-xl overflow-hidden">
		<!-- Background -->
		<div class="absolute inset-0 atb-panel-bg" />
		<div class="absolute inset-0 atb-panel-border" />

		<div class="relative z-10 flex items-center gap-3 px-4 py-2.5">
			<!-- Player Section -->
			<div class="flex items-center gap-2.5 flex-1">
				<div v-for="player in players" :key="player.id" class="flex items-center gap-2 flex-1">
					<!-- Player icon -->
					<div class="w-7 h-7 rounded-md flex items-center justify-center player-icon-bg shrink-0">
						<Icon icon="game-icons:knight-banner" class="w-4 h-4 text-cyan-300" />
					</div>
					<!-- ATB Progress -->
					<div class="flex-1 atb-bar-container h-3">
						<div class="atb-fill atb-fill-player" :style="{ width: `${player.readiness}%` }">
							<div class="atb-shine" />
						</div>
					</div>
				</div>
			</div>

			<!-- Clash Divider -->
			<div class="shrink-0 relative">
				<Icon icon="game-icons:crossed-swords" class="w-5 h-5 text-white/30" />
			</div>

			<!-- Enemy Section -->
			<div class="flex items-center gap-2.5 flex-1">
				<div v-for="enemy in enemies" :key="enemy.id" class="flex items-center gap-2 flex-1">
					<!-- ATB Progress -->
					<div class="flex-1 atb-bar-container h-3">
						<div class="atb-fill atb-fill-enemy" :style="{ width: `${enemy.readiness}%` }">
							<div class="atb-shine" />
						</div>
					</div>
					<!-- Enemy icon -->
					<div class="w-7 h-7 rounded-md flex items-center justify-center enemy-icon-bg shrink-0">
						<Icon icon="game-icons:skull-crossed-bones" class="w-4 h-4 text-red-300" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Combatant {
	id: string;
	name: string;
	readiness: number;
}

defineProps<{
	players: Combatant[];
	enemies: Combatant[];
}>();
</script>

<style scoped>
.atb-panel-bg {
	background: linear-gradient(180deg, rgba(10, 15, 30, 0.92) 0%, rgba(12, 18, 35, 0.9) 100%);
	backdrop-filter: blur(12px);
}

.atb-panel-border {
	border: 1px solid rgba(255, 255, 255, 0.06);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.player-icon-bg {
	background: linear-gradient(135deg, rgba(0, 180, 230, 0.2), rgba(0, 140, 200, 0.1));
	border: 1px solid rgba(0, 200, 255, 0.2);
}

.enemy-icon-bg {
	background: linear-gradient(135deg, rgba(200, 50, 50, 0.2), rgba(160, 30, 30, 0.1));
	border: 1px solid rgba(255, 60, 60, 0.2);
}

.atb-bar-container {
	position: relative;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 4px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.04);
}

.atb-fill {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	border-radius: 3px;
	transition: width 0.15s linear;
}

.atb-fill-player {
	background: linear-gradient(90deg, #0891b2, #06b6d4);
	box-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
}

.atb-fill-enemy {
	background: linear-gradient(90deg, #dc2626, #ef4444);
	box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.atb-shine {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 40%;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%);
	border-radius: 3px 3px 0 0;
}
</style>
