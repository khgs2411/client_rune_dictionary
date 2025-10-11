<template>
  <Teleport to="body">
    <div
      v-if="config.debug.showWebSocketDebugger"
      ref="draggableContainer"
      :style="{ left: `${x}px`, top: `${y}px` }"
      class="fixed w-96 max-h-[60vh] bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden flex flex-col z-40">
      <!-- Header (Draggable Handle) -->
      <div
        ref="handle"
        class="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50 cursor-move select-none">
        <div class="flex items-center gap-2">
          <Icon icon="radix-icons:globe" class="h-4 w-4 text-primary" />
          <h3 class="text-sm font-semibold">WebSocket Events</h3>
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
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-6 w-6"
                  @click="config.debug.showWebSocketDebugger = false">
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
      <div ref="eventListRef" class="flex-1 overflow-y-auto p-2 space-y-1">
        <div v-if="events.length === 0" class="text-center text-sm text-muted-foreground py-8">
          No events yet. Waiting for WebSocket activity...
        </div>
        <div
          v-for="(event, index) in events"
          :key="index"
          class="text-xs font-mono p-2 rounded bg-muted/50 hover:bg-muted transition-colors">
          <div class="flex items-start justify-between gap-2 mb-1">
            <span
              class="font-semibold truncate"
              :class="{
                'text-green-500': event.type.includes('connect'),
                'text-red-500': event.type.includes('error') || event.type.includes('disconnect'),
                'text-blue-500': event.type.includes('match'),
                'text-yellow-500': event.type.includes('system'),
              }">
              {{ event.type }}
            </span>
            <span class="text-muted-foreground text-[10px] whitespace-nowrap">
              {{ event.timestamp }}
            </span>
          </div>
          <div class="text-muted-foreground break-all line-clamp-3">
            {{ formatEventData(event.data) }}
          </div>
        </div>
      </div>

      <!-- Footer Stats -->
      <div class="px-4 py-2 border-t border-border bg-background/50 text-xs text-muted-foreground">
        {{ events.length }} events captured
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@iconify/vue';
import { useConfigStore } from '@/stores/config.store';
import { nextTick, ref, watch } from 'vue';
import { useRxjs } from 'topsyde-utils';
import { useDraggable } from '@vueuse/core';

const config = useConfigStore();

// Draggable functionality
const draggableContainer = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);

const { x, y } = useDraggable(draggableContainer, {
  initialValue: { x: window.innerWidth - 400 - 16, y: 64 }, // right: 16px (right-4), top: 64px (top-16)
  handle,
});

export interface I_DebugConsoleEvent {
  type: string;
  data: any;
  timestamp: string;
}

const events = ref<I_DebugConsoleEvent[]>([]);
const eventListRef = ref<HTMLElement | null>(null);

// Subscribe to WebSocket debug events
useRxjs('debug', {
	message(data: I_DebugConsoleEvent) {
		events.value.push(data);
	},
});


function clearEvents() {
  events.value = [];
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

// Dev mode initialization message
if (import.meta.env.DEV) {
	events.value.push({
		type: 'system.debug.init',
		data: 'DebugConsole initialized (dev mode)',
		timestamp: new Date().toLocaleTimeString(),
	});
}
</script>
