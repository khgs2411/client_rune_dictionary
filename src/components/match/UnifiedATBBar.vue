<template>
	<div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg px-4 py-2">
		<div class="flex items-center gap-4">
			<!-- Player Section -->
			<div class="flex items-center gap-3">
				<div v-for="player in players" :key="player.id" class="flex items-center gap-2">
					<!-- Player indicator -->
					<div class="w-7 h-7 rounded bg-primary flex items-center justify-center">
						<Icon icon="lucide:user" class="w-4 h-4 text-primary-foreground" />
					</div>
					<!-- ATB Progress -->
					<div class="w-48">
						<Progress :value="player.readiness" :max="100" color="atb" />
					</div>
				</div>
			</div>

			<!-- Divider with swords icon -->
			<div class="flex items-center gap-1 text-muted-foreground">
				<Icon icon="lucide:swords" class="w-4 h-4" />
			</div>

			<!-- Enemy Section -->
			<div class="flex items-center gap-3">
				<div v-for="enemy in enemies" :key="enemy.id" class="flex items-center gap-2">
					<!-- ATB Progress -->
					<div class="w-48">
						<Progress :value="enemy.readiness" :max="100" color="enemy" />
					</div>
					<!-- Enemy indicator -->
					<div class="w-7 h-7 rounded bg-destructive flex items-center justify-center">
						<Icon icon="lucide:skull" class="w-4 h-4 text-destructive-foreground" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Progress } from "@/components/ui/progress";

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
