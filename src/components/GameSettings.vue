<template>
  <Sheet>
    <TooltipProvider :delay-duration="0">
      <Tooltip>
        <TooltipTrigger as-child>
          <SheetTrigger as-child>
            <slot name="trigger">
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <Gamepad2 class="h-4 w-4" />
              </Button>
            </slot>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Game Settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <SheetContent class="overflow-y-auto" @wheel.stop>
      <SheetHeader>
        <SheetTitle class="text-primary">Game Settings</SheetTitle>
        <SheetDescription>Configure your gameplay experience</SheetDescription>
      </SheetHeader>
      <div class="py-4 space-y-6">
        <!-- Dynamically generate groups -->
        <template v-for="(group, groupName) in groupedFields" :key="groupName">
          <div class="pt-4 border-t border-border space-y-6 first:pt-0 first:border-t-0">
            <h3 class="text-sm font-semibold text-primary">{{ groupName }}</h3>

            <!-- Dynamically generate fields in each group -->
            <template v-for="field in group" :key="field.key">
              <!-- Boolean field (Switch) -->
              <div v-if="field.type === 'boolean'" class="space-y-2">
                <div class="flex items-center justify-between">
                  <label :for="field.id" class="text-sm font-medium cursor-pointer">
                    {{ field.meta.label }}
                  </label>
                  <Switch :id="field.id" v-model="field.ref[field.fieldName]" />
                </div>
                <p v-if="field.meta.description" class="text-xs text-muted-foreground">
                  {{ field.meta.description }}
                </p>
              </div>

              <!-- Numeric field (Slider) -->
              <div v-else-if="field.type === 'number'" class="space-y-3">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium">{{ field.meta.label }}</label>
                  <span class="text-sm text-muted-foreground font-mono">
                    {{ formatNumber(field.ref[field.fieldName]) }}
                  </span>
                </div>
                <Slider :model-value="[field.ref[field.fieldName]]"
                  @update:model-value="(val) => val && (field.ref[field.fieldName] = val[0])" :min="field.meta.min"
                  :max="field.meta.max" :step="field.meta.step" class="w-full" />
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>{{ formatNumber(field.meta.min!) }} (min)</span>
                  <span>{{ formatNumber(field.meta.max!) }} (max)</span>
                </div>
                <p v-if="field.meta.description" class="text-xs text-muted-foreground">
                  {{ field.meta.description }}
                </p>
              </div>
            </template>
          </div>
        </template>

        <!-- Level Editor Actions -->
        <div class="pt-4 border-t border-border space-y-4">
          <h3 class="text-sm font-semibold text-primary">Level Editor</h3>

          <div class="space-y-2">
            <Button @click="handleResetScene" variant="destructive" size="sm" class="w-full">
              Reset Scene Positions
            </Button>
            <p class="text-xs text-muted-foreground">
              Clear all saved object positions and reset to defaults. Requires scene reload.
            </p>
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
  import Switch from '@/components/ui/switch/Switch.vue';
  import { useGameConfigStore, type ConfigFieldMetadata } from '@/stores/gameConfig.store';
  import { useSceneStore } from '@/stores/scene.store';
  import { Gamepad2 } from 'lucide-vue-next';
  import { computed } from 'vue';
  import TooltipProvider from './ui/tooltip/TooltipProvider.vue';
  import Tooltip from './ui/tooltip/Tooltip.vue';
  import TooltipTrigger from './ui/tooltip/TooltipTrigger.vue';
  import TooltipContent from './ui/tooltip/TooltipContent.vue';

  const config = useGameConfigStore();
  const sceneStore = useSceneStore();

  interface ConfigField {
    key: string; // Unique key for v-for
    id: string; // HTML id for label
    category: string;
    fieldName: string;
    ref: any; // Reference to the reactive object
    type: 'boolean' | 'number' | 'string' | 'object';
    meta: ConfigFieldMetadata;
  }

  // Extract all fields from config with their metadata
  const allFields = computed<ConfigField[]>(() => {
    const fields: ConfigField[] = [];
    const categories = ['character', 'camera', 'debug', 'interaction', 'editor'] as const;

    categories.forEach((category) => {
      const categoryObj = config[category];
      Object.keys(categoryObj).forEach((fieldName) => {
        const value = categoryObj[fieldName as keyof typeof categoryObj];
        const meta = config.getFieldMetadata(category, fieldName, value);

        // Skip hidden fields
        if (meta.hidden) return;

        // Determine type
        let type: ConfigField['type'] = 'string';
        if (typeof value === 'boolean') type = 'boolean';
        else if (typeof value === 'number') type = 'number';
        else if (typeof value === 'object') type = 'object';

        // Skip unsupported types (objects, strings for now)
        if (type === 'object' || type === 'string') return;

        fields.push({
          key: `${category}.${fieldName}`,
          id: `config-${category}-${fieldName}`,
          category,
          fieldName,
          ref: categoryObj,
          type,
          meta,
        });
      });
    });

    return fields;
  });

  // Group fields by their group metadata
  const groupedFields = computed(() => {
    const groups: Record<string, ConfigField[]> = {};

    allFields.value.forEach((field) => {
      const groupName = field.meta.group || 'General';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(field);
    });

    // Sort fields within each group by order (if specified)
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => {
        const orderA = a.meta.order ?? 999;
        const orderB = b.meta.order ?? 999;
        return orderA - orderB;
      });
    });

    return groups;
  });

  // Format numbers for display (handle small decimals)
  function formatNumber(value: number): string {
    if (value === 0) return '0';
    if (Math.abs(value) < 0.01) return value.toFixed(4);
    if (Math.abs(value) < 1) return value.toFixed(3);
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2);
  }

  // Reset scene positions to defaults
  function handleResetScene(): void {
    const confirmed = confirm(
      'Reset scene positions?\n\nThis will clear all saved object positions and reload the scene to defaults.\n\nThis action cannot be undone.'
    );

    if (confirmed) {
      // Clear saved positions for PlaygroundScene
      sceneStore.clearScene('PlaygroundScene');

      // Reload the page to reinitialize the scene
      alert('Scene reset! Reloading page...');
      window.location.reload();
    }
  }
</script>
