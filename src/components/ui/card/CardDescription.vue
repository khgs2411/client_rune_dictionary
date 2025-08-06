<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <p
    data-slot="card-description"
    :class="cn('text-muted-foreground text-sm leading-relaxed mt-1', props.class)"
  >
    <slot />
  </p>
</template>
