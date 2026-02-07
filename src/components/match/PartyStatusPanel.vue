<template>
	<div class="flex flex-col gap-2.5">
		<div
			v-for="member in partyMembers"
			:key="member.id"
			:class="[
				'status-panel relative rounded-lg p-4 min-w-[260px] overflow-hidden',
				variant === 'enemy' ? 'enemy-panel' : 'player-panel',
			]">
			<!-- Panel background effects -->
			<div class="absolute inset-0 rounded-lg panel-bg" />
			<div class="absolute inset-0 rounded-lg panel-border" />

			<!-- Content -->
			<div class="relative z-10">
				<!-- Name + Status Effects -->
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<Icon
							:icon="variant === 'enemy' ? 'game-icons:skull-crossed-bones' : 'game-icons:knight-banner'"
							:class="['w-4 h-4', variant === 'enemy' ? 'text-red-400' : 'text-cyan-400']" />
						<span class="text-sm font-bold text-white tracking-wide">{{ member.name }}</span>
					</div>
					<div class="flex items-center gap-1">
						<Tooltip v-for="effect in member.statusEffects" :key="effect.id">
							<TooltipTrigger>
								<StatusEffectIcon :effect="effect" />
							</TooltipTrigger>
							<TooltipContent>
								<p class="font-semibold">{{ effect.name }}</p>
								<p class="text-xs text-muted-foreground">{{ effect.description }}</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<!-- HP Bar -->
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-semibold tracking-widest uppercase text-white/50">HP</span>
						<span class="text-[11px] font-mono font-bold text-white/80">{{ member.hp }}/{{ member.maxHp }}</span>
					</div>
					<div class="bar-container h-3.5">
						<div class="bar-fill bar-hp" :style="{ width: `${hpPercent(member)}%` }">
							<div class="bar-shine" />
						</div>
						<!-- Damage flash overlay -->
						<div class="bar-track-marks" />
					</div>
				</div>

				<!-- MP Bar -->
				<div class="space-y-1 mt-2.5">
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-semibold tracking-widest uppercase text-white/50">MP</span>
						<span class="text-[11px] font-mono font-bold text-white/80">{{ member.mp }}/{{ member.maxMp }}</span>
					</div>
					<div class="bar-container h-2.5">
						<div class="bar-fill bar-mp" :style="{ width: `${mpPercent(member)}%` }">
							<div class="bar-shine" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import StatusEffectIcon from "./StatusEffectIcon.vue";

interface StatusEffect {
	id: string;
	name: string;
	description: string;
	icon: string;
	type: "buff" | "debuff";
}

interface PartyMember {
	id: string;
	name: string;
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
	statusEffects: StatusEffect[];
}

withDefaults(
	defineProps<{
		partyMembers: PartyMember[];
		variant?: "player" | "enemy";
	}>(),
	{
		variant: "player",
	},
);

function hpPercent(member: PartyMember): number {
	return member.maxHp > 0 ? Math.max(0, Math.min(100, (member.hp / member.maxHp) * 100)) : 0;
}

function mpPercent(member: PartyMember): number {
	return member.maxMp > 0 ? Math.max(0, Math.min(100, (member.mp / member.maxMp) * 100)) : 0;
}
</script>

<style scoped>
/* Panel backgrounds */
.panel-bg {
	background: linear-gradient(135deg, rgba(10, 15, 30, 0.92) 0%, rgba(15, 20, 40, 0.88) 100%);
	backdrop-filter: blur(12px);
}

.player-panel .panel-border {
	border: 1px solid rgba(0, 200, 255, 0.15);
	box-shadow:
		inset 0 1px 0 rgba(0, 200, 255, 0.08),
		0 4px 16px rgba(0, 0, 0, 0.4);
}

.enemy-panel .panel-border {
	border: 1px solid rgba(255, 60, 60, 0.2);
	box-shadow:
		inset 0 1px 0 rgba(255, 60, 60, 0.08),
		0 4px 16px rgba(0, 0, 0, 0.4);
}

/* Bar containers */
.bar-container {
	position: relative;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 4px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.06);
}

.bar-fill {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	border-radius: 3px;
	transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* HP bar - green to yellow to red */
.bar-hp {
	background: linear-gradient(90deg, #22c55e, #4ade80);
	box-shadow:
		0 0 8px rgba(34, 197, 94, 0.3),
		inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

.bar-fill[style*="width: 5"] .bar-hp,
.bar-fill[style*="width: 4"] .bar-hp,
.bar-fill[style*="width: 3"] .bar-hp {
	background: linear-gradient(90deg, #eab308, #facc15);
	box-shadow:
		0 0 8px rgba(234, 179, 8, 0.3),
		inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

/* MP bar - blue */
.bar-mp {
	background: linear-gradient(90deg, #3b82f6, #60a5fa);
	box-shadow:
		0 0 6px rgba(59, 130, 246, 0.3),
		inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

/* Shine effect on bars */
.bar-shine {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 40%;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
	border-radius: 3px 3px 0 0;
}

/* Subtle notch marks on HP bar */
.bar-track-marks {
	position: absolute;
	inset: 0;
	background: repeating-linear-gradient(90deg, transparent, transparent 24%, rgba(0, 0, 0, 0.15) 24%, rgba(0, 0, 0, 0.15) 25%);
}
</style>
