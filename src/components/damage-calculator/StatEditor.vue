<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex-grow">
          <CardTitle>{{ title }}</CardTitle>
          <CardDescription>{{ description }}</CardDescription>
        </div>
        <Select 
          :model-value="equipment"
          @update:model-value="(value) => value && typeof value === 'string' && $emit('update:equipment', value)"
        >
          <SelectTrigger class="w-[120px] sm:w-[140px]">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="tier in equipmentTiers" 
              :key="tier.value"
              :value="tier.value"
            >
              {{ tier.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatInput
          :model-value="stats.hp"
          @update:model-value="updateStat('hp', $event)"
          label="HP"
          stat-key="hp"
          :min="10"
          :max="200"
          :equipment-bonus="0"
          :show-range="showRanges"
        />
        <StatInput
          :model-value="stats.attack"
          @update:model-value="updateStat('attack', $event)"
          label="Attack"
          stat-key="attack"
          :equipment-bonus="equipmentBonus"
          :show-range="showRanges"
        />
        <StatInput
          :model-value="stats.defense"
          @update:model-value="updateStat('defense', $event)"
          label="Defense"
          stat-key="defense"
          :equipment-bonus="equipmentBonus"
          :show-range="showRanges"
        />
        <StatInput
          :model-value="stats.special_attack"
          @update:model-value="updateStat('special_attack', $event)"
          label="Sp. Attack"
          stat-key="special_attack"
          :equipment-bonus="equipmentBonus"
          :show-range="showRanges"
        />
        <StatInput
          :model-value="stats.special_defense"
          @update:model-value="updateStat('special_defense', $event)"
          label="Sp. Defense"
          stat-key="special_defense"
          :equipment-bonus="equipmentBonus"
          :show-range="showRanges"
        />
        <StatInput
          :model-value="stats.speed"
          @update:model-value="updateStat('speed', $event)"
          label="Speed"
          stat-key="speed"
          :equipment-bonus="0"
          :show-range="showRanges"
        />
        <StatInput
          :model-value="stats.tempo"
          @update:model-value="updateStat('tempo', $event)"
          label="Tempo"
          stat-key="tempo"
          :min="25"
          :max="200"
          :equipment-bonus="0"
          :show-range="showRanges"
        />
      </div>
      
      <div v-if="equipmentBonus > 0" class="mt-4 p-3 rounded-lg bg-muted/50">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Equipment Bonus</span>
          <Badge>+{{ Math.round(equipmentBonus * 100) }}% to combat stats</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StatBlock } from '@/composables/useDamageCalculations';
import StatInput from './StatInput.vue';

interface Props {
  title: string;
  description: string;
  stats: StatBlock;
  equipment: string;
  equipmentBonus: number;
  showRanges?: boolean;
}

withDefaults(defineProps<Props>(), {
  showRanges: false
});

const emit = defineEmits<{
  'update:stat': [stat: keyof StatBlock, value: number];
  'update:equipment': [value: string];
}>();

const equipmentTiers = [
  { value: 'none', label: 'None' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'iron', label: 'Iron' },
  { value: 'steel', label: 'Steel' },
  { value: 'mithril', label: 'Mithril' },
  { value: 'adamant', label: 'Adamant' },
  { value: 'rune', label: 'Rune' },
];

const updateStat = (stat: keyof StatBlock, value: number) => {
  emit('update:stat', stat, value);
};
</script>