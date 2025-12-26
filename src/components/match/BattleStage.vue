<template>
	<div ref="stageRef" class="battle-stage relative h-[50vh] overflow-hidden">
		<!-- Stage Backdrop -->
		<div class="absolute inset-0 stage-backdrop rounded-2xl overflow-hidden">
			<!-- Gradient background -->
			<div class="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-slate-900/90" />
			<!-- Arena floor effect -->
			<div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-900/30 to-transparent" />
			<!-- Decorative grid lines -->
			<div
				class="absolute inset-0 opacity-10"
				style="background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px" />
			<!-- Vignette -->
			<div class="absolute inset-0 bg-radial-gradient pointer-events-none" />
			<!-- Border glow -->
			<div class="absolute inset-0 rounded-2xl border border-primary/20 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />
		</div>

		<!-- Combatants Container -->
		<div class="relative z-10 flex justify-between items-end px-[10%] h-full pb-12">
			<!-- Player Zone (Left) -->
			<div class="combatant-zone flex flex-col items-center gap-4">
				<BattleSprite v-for="member in partyMembers" :key="member.id" :sprite-url="member.spriteUrl" :name="member.name" :state="member.animationState" :flip-x="member.flipX" :scale="spriteScale" />
			</div>

			<!-- VS Indicator -->
			<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-primary/30 select-none">VS</div>

			<!-- Enemy Zone (Right) -->
			<div class="combatant-zone flex flex-col items-center gap-4">
				<BattleSprite v-for="enemy in enemies" :key="enemy.id" :sprite-url="enemy.spriteUrl" :name="enemy.name" :state="enemy.animationState" :flip-x="enemy.flipX" :scale="spriteScale" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useElementSize } from "@vueuse/core";
import BattleSprite from "./BattleSprite.vue";

interface Combatant {
	id: string;
	name: string;
	spriteUrl: string;
	animationState: "idle" | "attack" | "hurt" | "victory" | "defeat";
	flipX?: boolean;
}

defineProps<{
	partyMembers: Combatant[];
	enemies: Combatant[];
}>();

// Responsive sprite scaling based on stage size
const stageRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(stageRef);

const spriteScale = computed(() => {
	if (width.value < 480) return 1; // Mobile
	if (width.value < 768) return 1.5; // Tablet
	return 2; // Desktop (768+)
});
</script>

<style scoped>
.bg-radial-gradient {
	background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
}
</style>
