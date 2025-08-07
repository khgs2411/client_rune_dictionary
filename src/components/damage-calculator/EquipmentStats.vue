<template>
  <div class="text-sm">
    <!-- Equipment Tier -->
    <div class="flex items-center gap-2 mb-3" :class="tierClasses">
      <span class="text-lg">{{ getEquipmentIcon() }}</span>
      <span class="text-sm">{{ getTierName() }}</span>
    </div>

    <!-- Individual Stats -->
    <div class="space-y-1">
      <div class="flex justify-between items-center">
        <div class="text-xs text-muted-foreground">Strength</div>
        <div class="font-mono text-xs" :class="getStatComparisonClass('strength')">
          +{{ equipment.strength }}
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div class="text-xs text-muted-foreground">Magic</div>
        <div class="font-mono text-xs" :class="getStatComparisonClass('magic_damage')">
          +{{ equipment.magic_damage }}
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div class="text-xs text-muted-foreground">Accuracy</div>
        <div class="font-mono text-xs" :class="getStatComparisonClass('accuracy')">
          +{{ equipment.accuracy }}
        </div>
      </div>
    </div>

    <!-- Total Bonus -->
    <div class="flex justify-between items-center border-t pt-2 mt-2" :class="bonusClasses">
      <div class="text-xs text-muted-foreground font-medium">Equipment Bonus</div>
      <div class="font-mono font-medium">
        {{ formatBonus(bonus) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Equipment } from '@/composables/useDamageCalculations';
import { EQUIPMENT_TIERS } from '@/composables/useDamageCalculations';
import { computed } from 'vue';

// Props
interface Props {
  equipment: Equipment;
  bonus: number;
  variant: 'player' | 'enemy';
  comparisonEquipment?: Equipment;
}

const props = defineProps<Props>();

// Equipment tier mapping
const tierMap = computed(() => {
  return Object.entries(EQUIPMENT_TIERS).find(([_, eq]) => 
    eq.strength === props.equipment.strength &&
    eq.magic_damage === props.equipment.magic_damage &&
    eq.accuracy === props.equipment.accuracy
  )?.[0] || 'unknown';
});

// Computed properties
const tierClasses = computed(() => [
  'flex items-center gap-2 mb-3',
  {
    'text-blue-600': props.variant === 'player',
    'text-red-600': props.variant === 'enemy'
  }
]);

const bonusClasses = computed(() => [
  'border-t pt-2 mt-2',
  {
    'border-blue-200': props.variant === 'player',
    'border-red-200': props.variant === 'enemy'
  }
]);

// Methods
const getEquipmentIcon = (): string => {
  const tier = tierMap.value;
  const icons: Record<string, string> = {
    none: '🚫',
    bronze: '🥉',
    iron: '⚙️',
    steel: '⚔️',
    mithril: '💎',
    adamant: '🔹',
    rune: '⭐'
  };
  return icons[tier] || '❓';
};

const getTierName = (): string => {
  const tier = tierMap.value;
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};

const getStatComparisonClass = (statKey: keyof Equipment): string => {
  if (!props.comparisonEquipment) return '';
  
  const currentValue = props.equipment[statKey];
  const comparisonValue = props.comparisonEquipment[statKey];
  
  if (currentValue > comparisonValue) return 'text-green-600';
  if (currentValue < comparisonValue) return 'text-red-600';
  return '';
};

const formatBonus = (bonus: number): string => {
  return (bonus * 100).toFixed(1);
};
</script>

