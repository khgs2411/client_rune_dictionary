<template>
  <Card>
    <CardHeader>
      <CardTitle>Equipment Selection</CardTitle>
      <CardDescription>Choose gear tiers for player and enemy with visual comparison</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-6">
        <!-- Player Equipment Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <Label class="text-sm font-medium">Player Equipment</Label>
            <Button
              variant="outline"
              size="sm"
              @click="copyPlayerEquipmentToEnemy"
            >
              Copy to Enemy
            </Button>
          </div>
          <EquipmentGrid
            :selected-tier="playerEquipment"
            @select="(tier) => $emit('update:player-equipment', tier)"
            :comparison-tier="enemyEquipment"
            player-type="player"
          />
        </div>

        <!-- Divider with quick actions -->
        <div class="flex items-center gap-4">
          <div class="flex-1 border-t border-border"></div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="swapEquipment"
            >
              ⇅ Swap
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="matchEquipment"
            >
              ⚖ Match
            </Button>
          </div>
          <div class="flex-1 border-t border-border"></div>
        </div>

        <!-- Enemy Equipment Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <Label class="text-sm font-medium">Enemy Equipment</Label>
            <Button
              variant="outline"
              size="sm"
              @click="copyEnemyEquipmentToPlayer"
            >
              Copy to Player
            </Button>
          </div>
          <EquipmentGrid
            :selected-tier="enemyEquipment"
            @select="(tier) => $emit('update:enemy-equipment', tier)"
            :comparison-tier="playerEquipment"
            player-type="enemy"
          />
        </div>

        <!-- Equipment Comparison Summary -->
        <div class="border rounded-lg p-4 bg-muted/30">
          <Label class="text-sm font-medium mb-3 block">Equipment Bonus Comparison</Label>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="text-sm text-muted-foreground">Player</div>
              <EquipmentStats
                :equipment="playerEquipmentData"
                :bonus="playerEquipmentBonus"
                variant="player"
              />
            </div>
            <div class="space-y-2">
              <div class="text-sm text-muted-foreground">Enemy</div>
              <EquipmentStats
                :equipment="enemyEquipmentData"
                :bonus="enemyEquipmentBonus"
                variant="enemy"
              />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import EquipmentGrid from './EquipmentGrid.vue';
import EquipmentStats from './EquipmentStats.vue';
import { EQUIPMENT_TIERS, type Equipment } from '@/composables/useDamageCalculations';

// Props
interface Props {
  playerEquipment: string;
  enemyEquipment: string;
  playerEquipmentBonus: number;
  enemyEquipmentBonus: number;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  (e: 'update:player-equipment', value: string): void;
  (e: 'update:enemy-equipment', value: string): void;
}

const emit = defineEmits<Emits>();

// Computed properties
const playerEquipmentData = computed((): Equipment => {
  return EQUIPMENT_TIERS[props.playerEquipment] || EQUIPMENT_TIERS.none;
});

const enemyEquipmentData = computed((): Equipment => {
  return EQUIPMENT_TIERS[props.enemyEquipment] || EQUIPMENT_TIERS.none;
});

// Methods
const copyPlayerEquipmentToEnemy = () => {
  emit('update:enemy-equipment', props.playerEquipment);
};

const copyEnemyEquipmentToPlayer = () => {
  emit('update:player-equipment', props.enemyEquipment);
};

const swapEquipment = () => {
  const tempPlayer = props.playerEquipment;
  emit('update:player-equipment', props.enemyEquipment);
  emit('update:enemy-equipment', tempPlayer);
};

const matchEquipment = () => {
  // Find the higher tier equipment and match both to it
  const tiers = Object.keys(EQUIPMENT_TIERS);
  const playerIndex = tiers.indexOf(props.playerEquipment);
  const enemyIndex = tiers.indexOf(props.enemyEquipment);
  
  const higherTier = playerIndex > enemyIndex ? props.playerEquipment : props.enemyEquipment;
  
  emit('update:player-equipment', higherTier);
  emit('update:enemy-equipment', higherTier);
};
</script>