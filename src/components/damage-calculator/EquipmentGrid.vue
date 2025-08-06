<template>
  <div class="grid grid-cols-7 gap-2">
    <EquipmentCard
      v-for="(tier, tierKey) in equipmentTiers"
      :key="tierKey"
      :tier="tierKey"
      :equipment="tier"
      :selected="selectedTier === tierKey"
      :comparison-tier="comparisonTier"
      :player-type="playerType"
      @select="$emit('select', tierKey)"
    />
  </div>
</template>

<script setup lang="ts">
import EquipmentCard from './EquipmentCard.vue';
import { EQUIPMENT_TIERS } from '@/composables/useDamageCalculations';

// Props
interface Props {
  selectedTier: string;
  comparisonTier?: string;
  playerType: 'player' | 'enemy';
}

defineProps<Props>();

// Emits
interface Emits {
  (e: 'select', tier: string): void;
}

defineEmits<Emits>();

// Equipment tiers for display
const equipmentTiers = EQUIPMENT_TIERS;
</script>