<template>
  <div class="interaction-overlay">
    <!-- Click "POW" effects -->
    <TransitionGroup name="click-effect">
      <div
        v-for="effect in clickEffects"
        :key="effect.id"
        class="click-effect"
        :style="{
          left: `${effect.x}px`,
          top: `${effect.y}px`,
        }">
        {{ effect.text }}
      </div>
    </TransitionGroup>

    <!-- Hover tooltip (world-space) -->
    <Transition name="tooltip">
      <div
        v-if="tooltip"
        class="hover-tooltip"
        :style="{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
        }">
        <div class="tooltip-title">{{ tooltip.title }}</div>
        <div v-if="tooltip.subtitle" class="tooltip-subtitle">{{ tooltip.subtitle }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRxjs } from 'topsyde-utils';
import type { I_InteractionEvent } from '@/game/modules/entity/interaction.types';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface Tooltip {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
}

const clickEffects = ref<ClickEffect[]>([]);
const tooltip = ref<Tooltip | null>(null);

let effectIdCounter = 0;

useRxjs('interaction', {
  click: (event: I_InteractionEvent) => onClickEvent(event),
  'hover-start': () => onHoverStart(),
  'hover-hold': (event: I_InteractionEvent) => onHoverHold(event),
  'hover-end': () => onHoverEnd(),
});

/**
 * Handle click event - spawn "POW" effect
 */
function onClickEvent(event: I_InteractionEvent) {
  const effect: ClickEffect = {
    id: effectIdCounter++,
    x: event.screenPosition.x,
    y: event.screenPosition.y,
    text: getRandomClickText(),
  };

  clickEffects.value.push(effect);

  // Remove after animation completes (1s)
  setTimeout(() => {
    const index = clickEffects.value.findIndex((e) => e.id === effect.id);
    if (index !== -1) {
      clickEffects.value.splice(index, 1);
    }
  }, 1000);
}

/**
 * Handle hover start - clear tooltip (wait for hover-hold)
 */
function onHoverStart() {
  tooltip.value = null;
}

/**
 * Handle hover hold - show tooltip
 */
function onHoverHold(event: I_InteractionEvent) {
  const metadata = event.interactable.metadata || {};

  tooltip.value = {
    x: event.screenPosition.x,
    y: event.screenPosition.y - 40, // Offset above cursor
    title: metadata.name || event.interactable.id,
    subtitle: metadata.description,
  };
}

/**
 * Handle hover end - hide tooltip
 */
function onHoverEnd() {
  tooltip.value = null;
}

/**
 * Random click text (comic book style)
 */
function getRandomClickText(): string {
  const texts = ['POW!', 'BAM!', 'CLICK!', 'ZAP!', 'WHAM!'];
  return texts[Math.floor(Math.random() * texts.length)];
}
</script>

<style scoped>
.interaction-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

/* Click "POW" effect */
.click-effect {
  position: absolute;
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 2rem;
  font-weight: bold;
  color: hsl(var(--primary));
  text-shadow:
    2px 2px 0 hsl(var(--primary-foreground)),
    -2px -2px 0 hsl(var(--primary-foreground)),
    2px -2px 0 hsl(var(--primary-foreground)),
    -2px 2px 0 hsl(var(--primary-foreground));
  transform: translate(-50%, -50%);
  animation: click-pop 1s ease-out forwards;
}

@keyframes click-pop {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
  }
  50% {
    transform: translate(-50%, -60%) scale(1.2) rotate(5deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -80%) scale(1) rotate(0deg);
  }
}

/* Transition for click effects */
.click-effect-enter-active {
  animation: click-pop 1s ease-out;
}

.click-effect-leave-active {
  display: none;
}

/* Hover tooltip */
.hover-tooltip {
  position: absolute;
  transform: translateX(-50%);
  background: hsl(var(--popover));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 250px;
  pointer-events: none;
}

.tooltip-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--popover-foreground));
  margin-bottom: 0.25rem;
}

.tooltip-subtitle {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

/* Tooltip transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(5px);
}
</style>
