<template>
  <Teleport to="body">
    <div v-if="config.debug.showWebSocketDebugger" ref="draggableContainer" :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
    }" @scroll.prevent.stop :class="[
        'fixed bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden flex flex-col z-40 transition-shadow',
        isResizing ? 'border-primary shadow-xl' : 'border-border',
      ]">
      <!-- Header (Draggable Handle) -->
      <div ref="handle"
        class="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50 cursor-move select-none">
        <div class="flex items-center gap-2">
          <Icon icon="radix-icons:globe" class="h-4 w-4 text-primary" />
          <h3 class="text-sm font-semibold">Console</h3>
        </div>
        <div class="flex items-center gap-1">
          <TooltipProvider :delay-duration="0">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" size="icon" class="h-6 w-6" @click="clearEvents">
                  <Icon icon="radix-icons:trash" class="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Events</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider :delay-duration="0">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" size="icon" class="h-6 w-6" @click="resetPosition">
                  <Icon icon="radix-icons:reset" class="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Position & Size</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider :delay-duration="0">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" size="icon" class="h-6 w-6" @click="config.debug.showWebSocketDebugger = false">
                  <Icon icon="radix-icons:cross-2" class="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <!-- Event List -->
      <div ref="eventListRef" class="flex-1 overflow-y-auto p-2 space-y-1" @wheel.stop>
        <div v-if="events.length === 0" class="text-center text-sm text-muted-foreground py-8">
          No events yet. Waiting for WebSocket activity...
        </div>
        <div v-for="(event, index) in events" :key="index"
          class="text-xs font-mono p-2 rounded bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          @click="toggleExpanded(index)">
          <div class="flex items-start justify-between gap-2 mb-1">
            <div class="flex items-center gap-1 flex-1 min-w-0">
              <Icon :icon="expandedEvents.has(index)
                  ? 'radix-icons:chevron-down'
                  : 'radix-icons:chevron-right'
                " class="h-3 w-3 flex-shrink-0" />
              <span class="font-semibold truncate" :class="eventClass(event)">
                {{ event.type }}
              </span>
            </div>
            <span class="text-muted-foreground text-[10px] whitespace-nowrap">
              {{ event.timestamp }}
            </span>
          </div>
          <div class="text-muted-foreground break-all" :class="expandedEvents.has(index) ? '' : 'line-clamp-2'">
            {{ formatEventData(event.data) }}
          </div>
        </div>
      </div>

      <!-- Footer Stats -->
      <div
        class="px-4 py-2 border-t border-border bg-background/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ events.length }} events</span>
        <span class="text-[10px]">{{ size.width }}x{{ size.height }}</span>
      </div>

      <!-- Resize Handle (bottom-right corner) -->
      <div ref="resizeHandle"
        class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity">
        <Icon icon="radix-icons:corner-bottom-right" class="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
  import { Icon } from '@iconify/vue';
  import { useGameConfigStore } from '@/stores/gameConfig.store';
  import { useSettingsStore } from '@/stores/settings.store';
  import { computed, nextTick, ref, watch } from 'vue';
  import { useRxjs } from 'topsyde-utils';
  import { useDraggable, usePointerSwipe, watchDebounced } from '@vueuse/core';
  import { I_DebugConsoleEvent } from '@/common/events.types';

  const config = useGameConfigStore();
  const settings = useSettingsStore();

  // Refs
  const draggableContainer = ref<HTMLElement | null>(null);
  const handle = ref<HTMLElement | null>(null);
  const resizeHandle = ref<HTMLElement | null>(null);

  const isResizing = ref(false);
  const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

  const events = ref<I_DebugConsoleEvent[]>([]);
  const eventListRef = ref<HTMLElement | null>(null);
  const expandedEvents = ref<Set<number>>(new Set());

  // Size state (synced with settings store)
  const size = computed({
    get: () => ({ width: settings.debugConsole.width, height: settings.debugConsole.height }),
    set: (val) => settings.updateDebugConsole({ width: val.width, height: val.height }),
  });

  // Subscribe to WebSocket debug events
  useRxjs('debug', {
    log(data: I_DebugConsoleEvent) {
      events.value.push(data);
    },
  });

  // Draggable functionality - x and y manage position
  const { x, y } = useDraggable(draggableContainer, {
    initialValue: { x: settings.debugConsole.x, y: settings.debugConsole.y },
    handle,
  });

  function eventClass(event:any) {
    return {
      'text-green-500': event.type.includes('connect'),
      'text-red-500': event.type.includes('error') || event.type.includes('disconnect'),
      'text-blue-500': event.type.includes('match'),
      'text-yellow-500': event.type.includes('system'),
      'text-purple-500': event.type.includes('whisper'),
      'text-gray-500': event.type.includes('pong'),
    }
  }

  function clearEvents() {
    events.value = [];
    expandedEvents.value.clear();
  }

  function toggleExpanded(index: number) {
    if (expandedEvents.value.has(index)) {
      expandedEvents.value.delete(index);
    } else {
      expandedEvents.value.add(index);
    }
  }

  function resetPosition() {
    const defaultSettings = {
      x: window.innerWidth - 400 - 16,
      y: 64,
      width: 400,
      height: Math.min(window.innerHeight * 0.6, 600),
    };

    settings.updateDebugConsole(defaultSettings);
    x.value = defaultSettings.x;
    y.value = defaultSettings.y;
  }

  function formatEventData(data: any): string {
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    }
    return String(data);
  }

  // Sync draggable position to settings (debounced and rounded)
  watchDebounced(
    [x, y],
    ([newX, newY]) => {
      const roundedX = Math.round(newX);
      const roundedY = Math.round(newY);

      // Update the refs to rounded values
      x.value = roundedX;
      y.value = roundedY;

      // Save to settings
      settings.updateDebugConsole({ x: roundedX, y: roundedY });
    },
    { debounce: 300 },
  );

  // Resize functionality
  usePointerSwipe(resizeHandle, {
    onSwipeStart: (e) => {
      isResizing.value = true;
      resizeStart.value = {
        x: e.x,
        y: e.y,
        width: size.value.width,
        height: size.value.height,
      };
    },

    onSwipe: (e) => {
      if (!isResizing.value) return;

      const deltaX = e.x - resizeStart.value.x;
      const deltaY = e.y - resizeStart.value.y;

      const newWidth = Math.max(300, resizeStart.value.width + deltaX);
      const newHeight = Math.max(200, resizeStart.value.height + deltaY);

      size.value = { width: newWidth, height: newHeight };
    },

    onSwipeEnd: () => {
      // Round the final values
      size.value = {
        width: Math.round(size.value.width),
        height: Math.round(size.value.height),
      };
      isResizing.value = false;
    },
  });

  // Auto-scroll to bottom when new events arrive
  watch(
    () => events.value.length,
    async () => {
      await nextTick();
      if (eventListRef.value) {
        eventListRef.value.scrollTop = eventListRef.value.scrollHeight;
      }
    },
  );
</script>
