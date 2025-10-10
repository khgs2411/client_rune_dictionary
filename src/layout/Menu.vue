<template>
  <header class="flex justify-end items-center px-3 py-1 border-b border-border bg-background">
    <Sheet>
      <SheetTrigger as-child>
        <Button variant="ghost" size="icon" class="h-8 w-8">
          <Settings class="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle class="text-primary">Settings</SheetTitle>
          <SheetDescription> Customize your game settings </SheetDescription>
        </SheetHeader>

        <div class="py-4 space-y-6">
          <!-- Dark/Light Mode Toggle -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Appearance</label>
            <Button @click="settings.toggleColorMode()" variant="outline" size="sm" class="w-full">
              <Moon v-if="settings.colorMode === 'dark'" class="h-4 w-4 mr-2" />
              <Sun v-else class="h-4 w-4 mr-2" />
              {{ settings.colorMode === 'dark' ? 'Dark Mode' : 'Light Mode' }}
            </Button>
          </div>

          <!-- Theme Color Picker -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Color Theme</label>
            <div class="flex gap-3 flex-wrap">
              <Button
                v-for="theme in THEME_OPTIONS"
                :key="theme.value"
                @click="settings.setTheme(theme.value)"
                variant="ghost"
                :class="[
                  'w-10 h-10 p-0 rounded-full border-2 transition-all shrink-0 overflow-hidden',
                  settings.currentTheme === theme.value
                    ? 'border-foreground ring-2 ring-ring scale-110'
                    : 'border-transparent hover:scale-105',
                ]"
                :style="{ background: theme.color }"
                :title="theme.label"
                :aria-label="theme.label">
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </header>
</template>

<script setup lang="ts">
import { Settings, Sun, Moon } from 'lucide-vue-next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Button from '@/components/ui/button/Button.vue';
import { useSettingsStore } from '@/stores/settings.store';
import { THEME_OPTIONS } from '@/composables/useTheme';

const settings = useSettingsStore();
</script>
