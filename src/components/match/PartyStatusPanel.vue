<template>
	<div class="flex flex-col gap-2">
		<div
			v-for="member in partyMembers"
			:key="member.id"
			:class="[
				'bg-card/90 backdrop-blur-sm rounded-xl border-2 shadow-lg p-4 min-w-[280px]',
				variant === 'enemy' ? 'border-destructive' : 'border-border',
			]"
		>
			<!-- Name -->
			<div class="flex items-center justify-between mb-3">
				<span class="text-base font-bold text-foreground">{{ member.name }}</span>
				<!-- Status Effects -->
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
			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground flex items-center gap-1.5">
						<Icon icon="lucide:heart" class="w-4 h-4" />
						HP
					</span>
					<span class="text-sm font-mono font-semibold">{{ member.hp }}/{{ member.maxHp }}</span>
				</div>
				<Progress :value="member.hp" :max="member.maxHp" color="health" container-class="h-3" />
			</div>

			<!-- MP Bar -->
			<div class="space-y-1.5 mt-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground flex items-center gap-1.5">
						<Icon icon="lucide:droplets" class="w-4 h-4" />
						MP
					</span>
					<span class="text-sm font-mono font-semibold">{{ member.mp }}/{{ member.maxMp }}</span>
				</div>
				<Progress :value="member.mp" :max="member.maxMp" color="mana" container-class="h-3" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
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

const { variant } = withDefaults(
	defineProps<{
		partyMembers: PartyMember[];
		variant?: "player" | "enemy";
	}>(),
	{
		variant: "player",
	},
);
</script>
