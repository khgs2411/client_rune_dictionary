<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between mb-1">
      <Label :htmlFor="inputId" class="text-sm font-medium">
        {{ label }}
      </Label>
      <Badge v-if="equipmentBonus > 0" variant="secondary" class="text-xs">
        +{{ Math.round(equipmentBonus * 100) }}%
      </Badge>
    </div>
    <div class="flex items-center gap-2">
      <Input 
        :id="inputId"
        type="number"
        :model-value="String(modelValue)"
        @update:model-value="handleInput"
        :min="min"
        :max="max"
        class="flex-1"
      />
      <div 
        v-if="totalValue !== modelValue" 
        class="text-xs text-muted-foreground font-medium min-w-[3rem] text-right"
      >
        = {{ totalValue }}
      </div>
    </div>
    <div 
      v-if="showRange" 
      class="mt-1 flex items-center justify-between text-xs text-muted-foreground"
    >
      <span>{{ min }}</span>
      <Slider
        :model-value="[modelValue]"
        @update:model-value="(val) => val && handleInput(String(val[0]))"
        :min="min"
        :max="max"
        :step="1"
        class="mx-2"
      />
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { computed } from 'vue';

interface Props {
  modelValue: number;
  label: string;
  statKey: string;
  min?: number;
  max?: number;
  equipmentBonus?: number;
  showRange?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: 99,
  equipmentBonus: 0,
  showRange: false
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const inputId = computed(() => `stat-${props.statKey}`);

const totalValue = computed(() => {
  if (props.equipmentBonus <= 0) return props.modelValue;
  return Math.round(props.modelValue * (1 + props.equipmentBonus));
});

const handleInput = (value: string | number) => {
  const numValue = typeof value === 'string' ? Number(value) : value;
  if (!isNaN(numValue)) {
    const clampedValue = Math.max(props.min, Math.min(props.max, numValue));
    emit('update:modelValue', clampedValue);
  }
};
</script>

