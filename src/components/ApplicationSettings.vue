<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger as-child>
      <slot name="trigger">
        <Button variant="ghost" size="icon" class="h-8 w-8">
          <Settings class="h-4 w-4" />
        </Button>
      </slot>
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
              @click="settings.theme.setTheme(theme.value)"
              variant="ghost"
              :class="[
                'w-10 h-10 p-0 rounded-full border-2 transition-all shrink-0 overflow-hidden',
                settings.theme.currentTheme === theme.value
                  ? 'border-foreground ring-2 ring-ring scale-110'
                  : 'border-transparent hover:scale-105',
              ]"
              :style="{ background: theme.color }"
              :title="theme.label"
              :aria-label="theme.label">
            </Button>
          </div>
        </div>

        <!-- Logout Button -->
        <div v-if="showLogout" class="pt-4 border-t border-border">
          <Button @click="handleLogout" variant="destructive" size="sm" class="w-full text-destructive-foreground">
            <LogOut class="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Settings, Sun, Moon, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
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
import { computed, ref } from 'vue';

const settings = useSettingsStore();
const router = useRouter();

const isOpen = ref(false);

function handleLogout() {
  console.log('👋 Logging out...');
  isOpen.value = false; // Close the sheet
  // TODO: Clear any auth tokens/session data here
  router.push('/login');
}

const showLogout = computed(() => router.currentRoute.value.name !== 'login');
</script>
