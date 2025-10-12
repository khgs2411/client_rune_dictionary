<template>
  <div
    v-if="config.editor.enabled"
    class="fixed top-20 right-4 z-40 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 space-y-4 w-72">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-primary flex items-center gap-2">
        <Box class="h-4 w-4" />
        Level Editor
      </h3>
      <Button variant="ghost" size="icon" class="h-6 w-6" @click="toggleEditor">
        <X class="h-3 w-3" />
      </Button>
    </div>

    <!-- Editor Mode Status -->
    <div class="bg-primary/10 border border-primary/20 rounded-md p-3">
      <div class="flex items-center gap-2 text-xs text-primary font-medium">
        <div class="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
        Editor Mode Active
      </div>
      <p class="text-xs text-muted-foreground mt-1">Drag objects to reposition them</p>
    </div>

    <!-- Grid Settings -->
    <div class="space-y-3">
      <h4 class="text-xs font-semibold text-foreground">Grid Settings</h4>

      <!-- Show Grid Toggle -->
      <div class="flex items-center justify-between">
        <label class="text-xs font-medium cursor-pointer">Show Grid</label>
        <Switch v-model="config.editor.showGrid" />
      </div>

      <!-- Snap to Grid -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-xs font-medium">Grid Snap</label>
          <span class="text-xs text-muted-foreground font-mono">{{ config.editor.snapToGrid }}</span>
        </div>
        <Slider
          :model-value="[config.editor.snapToGrid]"
          @update:model-value="(val) => val && (config.editor.snapToGrid = val[0])"
          :min="0.1"
          :max="2"
          :step="0.1"
          class="w-full" />
        <div class="flex justify-between text-xs text-muted-foreground">
          <span>0.1</span>
          <span>2.0</span>
        </div>
      </div>

      <!-- Drag Opacity -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-xs font-medium">Drag Opacity</label>
          <span class="text-xs text-muted-foreground font-mono">{{
            config.editor.dragOpacity.toFixed(2)
          }}</span>
        </div>
        <Slider
          :model-value="[config.editor.dragOpacity]"
          @update:model-value="(val) => val && (config.editor.dragOpacity = val[0])"
          :min="0.1"
          :max="1"
          :step="0.05"
          class="w-full" />
      </div>
    </div>

    <!-- Scene Actions -->
    <div class="pt-3 border-t border-border space-y-2">
      <h4 class="text-xs font-semibold text-foreground">Scene Actions</h4>

      <!-- Object Count -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Saved Positions</span>
        <span class="font-mono text-foreground">{{ savedObjectCount }}</span>
      </div>

      <!-- Reset Scene Button -->
      <Button @click="handleResetScene" variant="destructive" size="sm" class="w-full text-xs">
        Reset All Positions
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameConfigStore } from '@/stores/gameConfig.store';
import { useSceneStore } from '@/stores/scene.store';
import Button from '@/components/ui/button/Button.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import Slider from '@/components/ui/slider/Slider.vue';
import { Box, X } from 'lucide-vue-next';
import { computed } from 'vue';

const config = useGameConfigStore();
const sceneStore = useSceneStore();

// Get saved object count for PlaygroundScene
const savedObjectCount = computed(() => {
  const scene = sceneStore.getScene('PlaygroundScene');
  return scene?.objects.length || 0;
});

// Toggle editor mode
function toggleEditor(): void {
  config.editor.enabled = false;
}

// Reset scene positions
function handleResetScene(): void {
  const confirmed = confirm(
    'Reset all saved positions?\n\nThis will clear all saved object positions and reload the scene to defaults.\n\nThis action cannot be undone.',
  );

  if (confirmed) {
    sceneStore.clearScene('PlaygroundScene');
    alert('Scene reset! Reloading page...');
    window.location.reload();
  }
}
</script>
