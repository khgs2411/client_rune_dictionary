<template>
  <!-- MMO-style Action Bar - Draggable, 8 slots + Run/Pass -->
  <div
    ref="container"
    :style="{ transform: `translate(${x}px, ${y}px)` }"
    class="select-none"
  >
    <div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 space-y-2">
      <!-- Drag Handle -->
      <div
        ref="handle"
        class="flex items-center justify-center py-1 cursor-move hover:bg-muted/50 rounded transition-colors"
        title="Drag to reposition"
      >
        <div class="flex gap-1">
          <div class="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
          <div class="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
          <div class="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
        </div>
      </div>

      <!-- Utility Buttons (Run / Pass) -->
      <div class="flex gap-2">
        <button
          @click="handlePass"
          class="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium text-xs sm:text-sm transition-colors min-h-[44px] sm:min-h-0"
        >
          Pass
        </button>
        <button
          @click="emitLeaveMatch"
          :disabled="isLeaving"
          class="flex-1 px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-medium text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0"
        >
          {{ isLeaving ? 'Leaving...' : 'Run' }}
        </button>
      </div>

      <!-- 8-Slot Action Bar (Horizontal) -->
      <div class="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-2">
        <button
          v-for="slot in actionSlots"
          :key="slot.id"
          @click="handleActionClick(slot.id)"
          :class="[
            'relative aspect-square bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium text-xs sm:text-sm transition-colors flex flex-col items-center justify-center p-1 min-h-[44px] sm:min-h-0',
            slot.isActive && 'ring-2 ring-primary'
          ]"
          :title="`${slot.name} (Hotkey: ${slot.keybind})`"
        >
          <!-- Action name -->
          <span class="text-[10px] sm:text-xs font-semibold truncate w-full text-center">
            {{ slot.name }}
          </span>

          <!-- Keybind indicator -->
          <span class="absolute bottom-0.5 right-0.5 text-[8px] sm:text-[10px] text-muted-foreground font-mono">
            {{ slot.keybind }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDraggable, useLocalStorage } from '@vueuse/core';
  import { onMounted, onUnmounted, ref } from 'vue';

  // Props
  const props = defineProps<{
    isLeaving: boolean;
  }>();

  // Emits
  const emit = defineEmits<{
    leaveMatch: [];
  }>();

  // ========================================
  // DRAGGABLE POSITIONING
  // ========================================

  const container = ref<HTMLElement | null>(null);
  const handle = ref<HTMLElement | null>(null);

  // Persist position in localStorage
  const savedPosition = useLocalStorage('match-action-bar-position', { x: 0, y: 0 });

  // Draggable composable
  const { x, y, style } = useDraggable(container, {
    initialValue: savedPosition.value,
    handle: handle,
    onEnd: () => {
      // Save position when drag ends
      savedPosition.value = { x: x.value, y: y.value };
    },
  });

  // ========================================
  // ACTION SLOTS (Placeholder data)
  // ========================================

  const actionSlots = ref([
    { id: 1, name: 'Attack', keybind: '1', isActive: false },
    { id: 2, name: 'Attack', keybind: '2', isActive: false },
    { id: 3, name: 'Attack', keybind: '3', isActive: false },
    { id: 4, name: 'Attack', keybind: '4', isActive: false },
    { id: 5, name: 'Attack', keybind: '5', isActive: false },
    { id: 6, name: 'Attack', keybind: '6', isActive: false },
    { id: 7, name: 'Attack', keybind: '7', isActive: false },
    { id: 8, name: 'Attack', keybind: '8', isActive: false },
  ]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  function handleActionClick(slotId: number) {
    console.log(`[ActionBar] Action ${slotId} clicked`);
    // TODO: Send action to match server
  }

  function handlePass() {
    console.log('[ActionBar] Pass button clicked');
    // TODO: Send pass action to match server
  }

  function emitLeaveMatch() {
    emit('leaveMatch');
  }

  // ========================================
  // KEYBOARD BINDINGS (1-8)
  // ========================================

  function handleKeyPress(event: KeyboardEvent) {
    const key = event.key;

    // Check if key is 1-8
    if (key >= '1' && key <= '8') {
      const slotIndex = parseInt(key) - 1;
      const slot = actionSlots.value[slotIndex];

      if (slot) {
        event.preventDefault();
        handleActionClick(slot.id);
      }
    }
  }

  // Register keyboard event listeners
  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
  });
</script>
