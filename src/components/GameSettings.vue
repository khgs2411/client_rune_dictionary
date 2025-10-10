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
            <span class="text-sm text-muted-foreground font-mono">{{ config.characterMoveSpeed }}</span>
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
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Gamepad2 } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Button from '@/components/ui/button/Button.vue';
import Slider from '@/components/ui/slider/Slider.vue';
import { useConfigStore } from '@/stores/config.store';

const config = useConfigStore();
const isOpen = ref(false);

// Local slider value (array format required by reka-ui)
const speedValue = ref([config.characterMoveSpeed]);

// Update config when slider changes
function updateSpeed(value: number[]) {
  config.characterMoveSpeed = value[0];
}

// Sync with store changes (in case it's modified elsewhere)
watch(
  () => config.characterMoveSpeed,
  (newSpeed) => {
    speedValue.value = [newSpeed];
  }
);
</script>
