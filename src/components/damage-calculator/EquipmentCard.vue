<template>
  <motion.div
    class="equipment-card"
    :class="cardClasses"
    :whileHover="{ scale: 1.05 }"
    :whileTap="{ scale: 0.95 }"
    :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
    @click="$emit('select', tier)"
    role="button"
    tabindex="0"
    @keydown.enter="$emit('select', tier)"
    @keydown.space.prevent="$emit('select', tier)"
  >
    <!-- Equipment Icon -->
    <div class="text-2xl mb-2 transition-colors" :class="iconClasses">
      {{ getEquipmentIcon(tier) }}
    </div>

    <!-- Equipment Name -->
    <div class="text-sm font-medium mb-2">
      {{ formatTierName(tier) }}
    </div>

    <!-- Stats Preview -->
    <div class="space-y-1">
      <div class="text-xs text-muted-foreground" :title="`Strength: +${equipment.strength}`">
        ⚔️ {{ equipment.strength }}
      </div>
      <div class="text-xs text-muted-foreground" :title="`Magic: +${equipment.magic_damage}`">
        🔮 {{ equipment.magic_damage }}
      </div>
      <div class="text-xs text-muted-foreground" :title="`Accuracy: +${equipment.accuracy}`">
        🎯 {{ equipment.accuracy }}
      </div>
    </div>

    <!-- Selection Indicator -->
    <div v-if="selected" class="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
      ✓
    </div>

    <!-- Comparison Badge -->
    <div v-if="comparisonBadge" class="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" :class="comparisonBadge.type === 'better' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'">
      {{ comparisonBadge.text }}
    </div>
  </motion.div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import type { Equipment } from '@/composables/useDamageCalculations';
import { EQUIPMENT_TIERS } from '@/composables/useDamageCalculations';

// Props
interface Props {
  tier: string;
  equipment: Equipment;
  selected: boolean;
  comparisonTier?: string;
  playerType: 'player' | 'enemy';
}

const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'select', tier: string): void;
}

defineEmits<Emits>();

// Equipment tier order for comparison
const tierOrder = ['none', 'bronze', 'iron', 'steel', 'mithril', 'adamant', 'rune'];

// Computed properties
const cardClasses = computed(() => [
  'border rounded-lg p-3 cursor-pointer transition-all',
  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring',
  {
    'border-primary bg-primary/10': props.selected,
    'border-border bg-background hover:bg-accent': !props.selected,
    'opacity-75': props.tier === 'none'
  }
]);

const iconClasses = computed(() => [
  'text-2xl mb-2 transition-colors',
  {
    'text-primary': props.selected,
    'text-muted-foreground': !props.selected && props.tier === 'none',
    'text-foreground': !props.selected && props.tier !== 'none'
  }
]);

const comparisonBadge = computed(() => {
  if (!props.comparisonTier || props.comparisonTier === props.tier) return null;
  
  const currentIndex = tierOrder.indexOf(props.tier);
  const comparisonIndex = tierOrder.indexOf(props.comparisonTier);
  
  if (currentIndex > comparisonIndex) {
    return { type: 'better', text: '+' };
  } else if (currentIndex < comparisonIndex) {
    return { type: 'worse', text: '-' };
  }
  
  return null;
});

// Methods
const getEquipmentIcon = (tier: string): string => {
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

const formatTierName = (tier: string): string => {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};
</script>

<style scoped>
.equipment-card {
  @apply relative min-h-[120px] flex flex-col items-center justify-center text-center;
}
</style>