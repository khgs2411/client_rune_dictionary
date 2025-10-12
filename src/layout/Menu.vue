<template>
  <header
    class="flex justify-end items-center gap-1 px-3 py-1 border-b border-border bg-background">
    <TooltipProvider :delay-duration="0">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="toggleDebugger">
            <Icon
              :icon="
                config.debug.showWebSocketDebugger
                  ? 'radix-icons:globe'
                  : 'radix-icons:component-none'
              "
              class="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {{
              config.debug.showWebSocketDebugger
                ? 'Hide WebSocket Debugger'
                : 'Show WebSocket Debugger'
            }}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <GameSettings />
    <ApplicationSettings />
  </header>
</template>

<script setup lang="ts">
import ApplicationSettings from '@/components/ApplicationSettings.vue';
import GameSettings from '@/components/GameSettings.vue';
import Button from '@/components/ui/button/Button.vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@iconify/vue';
import { useGameConfigStore } from '@/stores/gameConfig.store';

const config = useGameConfigStore();

function toggleDebugger() {
  config.debug.showWebSocketDebugger = !config.debug.showWebSocketDebugger;
}
</script>
