<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon" class="h-8 w-8">
          <Gamepad2 class="h-4 w-4" />
        </Button>
      </slot>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle class="text-primary">Game Settings</SheetTitle>
        <SheetDescription> Configure your gameplay experience </SheetDescription>
      </SheetHeader>

      <div class="py-4 space-y-6">
        <!-- Character Movement Speed -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium">Movement Speed</label>
            <span class="text-sm text-muted-foreground font-mono">{{
              config.character.moveSpeed
            }}</span>
          </div>
          <Slider
            v-model="speedValue"
            :min="1"
            :max="20"
            :step="1"
            class="w-full"
            @update:model-value="updateSpeed" />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>Slow (1)</span>
            <span>Fast (20)</span>
          </div>
        </div>

        <!-- Jump Settings Section -->
        <div class="pt-4 border-t border-border space-y-6">
          <h3 class="text-sm font-semibold text-primary">Jump Settings</h3>

          <!-- Jump Initial Velocity -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="text-sm font-medium">Jump Power</label>
              <span class="text-sm text-muted-foreground font-mono">{{
                config.character.jumpInitialVelocity
              }}</span>
            </div>
            <Slider
              v-model="jumpVelocityValue"
              :min="5"
              :max="20"
              :step="0.5"
              class="w-full"
              @update:model-value="updateJumpVelocity" />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Weak (5)</span>
              <span>Strong (20)</span>
            </div>
          </div>

          <!-- Jump Gravity -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="text-sm font-medium">Gravity (Weight)</label>
              <span class="text-sm text-muted-foreground font-mono">{{
                config.character.jumpGravity
              }}</span>
            </div>
            <Slider
              v-model="jumpGravityValue"
              :min="10"
              :max="70"
              :step="1"
              class="w-full"
              @update:model-value="updateJumpGravity" />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Light (10)</span>
              <span>Heavy (70)</span>
            </div>
          </div>

          <!-- Max Fall Speed -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="text-sm font-medium">Max Fall Speed</label>
              <span class="text-sm text-muted-foreground font-mono">{{
                config.character.jumpMaxFallSpeed
              }}</span>
            </div>
            <Slider
              v-model="jumpMaxFallSpeedValue"
              :min="10"
              :max="40"
              :step="1"
              class="w-full"
              @update:model-value="updateJumpMaxFallSpeed" />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Slow (10)</span>
              <span>Fast (40)</span>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Slider from '@/components/ui/slider/Slider.vue';
import { useGameConfig } from '@/stores/gameConfig.store';
import { Gamepad2 } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

const config = useGameConfig();
const isOpen = ref(false);

// Local slider values (array format required by reka-ui)
const speedValue = ref([config.character.moveSpeed]);
const jumpVelocityValue = ref([config.character.jumpInitialVelocity]);
const jumpGravityValue = ref([config.character.jumpGravity]);
const jumpMaxFallSpeedValue = ref([config.character.jumpMaxFallSpeed]);

// Update config when sliders change
function updateSpeed(value: number[] | undefined) {
  if (!value) return;
  config.character.moveSpeed = value[0];
}

function updateJumpVelocity(value: number[] | undefined) {
  if (!value) return;
  config.character.jumpInitialVelocity = value[0];
}

function updateJumpGravity(value: number[] | undefined) {
  if (!value) return;
  config.character.jumpGravity = value[0];
}

function updateJumpMaxFallSpeed(value: number[] | undefined) {
  if (!value) return;
  config.character.jumpMaxFallSpeed = value[0];
}

// Sync with store changes (in case modified elsewhere)
watch(
  () => config.character.moveSpeed,
  (newSpeed) => {
    speedValue.value = [newSpeed];
  },
);

watch(
  () => config.character.jumpInitialVelocity,
  (newValue) => {
    jumpVelocityValue.value = [newValue];
  },
);

watch(
  () => config.character.jumpGravity,
  (newValue) => {
    jumpGravityValue.value = [newValue];
  },
);

watch(
  () => config.character.jumpMaxFallSpeed,
  (newValue) => {
    jumpMaxFallSpeedValue.value = [newValue];
  },
);
</script>
