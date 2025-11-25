<template>
  <div class="relative min-h-svh w-full overflow-hidden font-sans">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img src="@/assets/login-bg.png" alt="Fantasy World" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
    </div>

    <!-- User Switch Button Group - Dev Only -->
    <div v-if="isDev" class="absolute top-4 right-4 z-50">
      <ButtonGroup>
        <Button
          variant="outline"
          class="bg-background/80 backdrop-blur-md"
          @click="switchUser($event, 'tal')"
          >Tal</Button
        >
        <Button
          variant="outline"
          class="bg-background/80 backdrop-blur-md"
          @click="switchUser($event, 'yazin')"
          >Yazin</Button
        >
      </ButtonGroup>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex min-h-svh items-center justify-center px-4 py-8">
      <div class="w-full max-w-md animate-fade-in space-y-8">
        <!-- Logo/Title -->
        <div class="text-center space-y-2 animate-float">
          <h1
            class="font-fantasy text-5xl font-bold tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-shadow-glow">
            RUNE RPG
          </h1>
          <p class="text-lg text-white/90 font-medium drop-shadow-md">Enter the Realm</p>
        </div>

        <!-- Login Card -->
        <div
          class="group relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <!-- Decorative Corner Accents (OSRS Style) -->
          <div
            class="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-yellow-400/50 rounded-tl-lg"></div>
          <div
            class="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-yellow-400/50 rounded-tr-lg"></div>
          <div
            class="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-yellow-400/50 rounded-bl-lg"></div>
          <div
            class="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-yellow-400/50 rounded-br-lg"></div>

          <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
            <!-- Username Input -->
            <div class="space-y-2">
              <Label for="username" class="text-white/90 font-medium ml-1">Username</Label>
              <div class="relative">
                <Input
                  id="username"
                  v-model="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  :disabled="isLoading"
                  autocomplete="username"
                  class="h-12 border-white/20 bg-black/20 text-white placeholder:text-white/40 focus:border-yellow-400/50 focus:ring-yellow-400/20 transition-all duration-300" />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <Label for="password" class="text-white/90 font-medium ml-1">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  :disabled="isLoading"
                  autocomplete="current-password"
                  class="h-12 border-white/20 bg-black/20 text-white placeholder:text-white/40 focus:border-yellow-400/50 focus:ring-yellow-400/20 transition-all duration-300" />
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-sm text-red-200 text-center animate-in fade-in slide-in-from-top-2">
              {{ errorMessage }}
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              class="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-white/10 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              :disabled="isLoading">
              <span v-if="isLoading" class="flex items-center gap-2">
                <span class="animate-spin">⚔️</span> Summoning...
              </span>
              <span v-else>Begin Adventure</span>
            </Button>
          </form>
        </div>

        <!-- Footer Text -->
        <p
          class="text-center text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer">
          Need an account? Contact the Guild Master
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import AuthAPI from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import ButtonGroup from '@/components/ui/button-group/ButtonGroup.vue';

const router = useRouter();
const authStore = useAuthStore();

// Form state
const { username, password } = storeToRefs(authStore);
const isLoading = ref(false);
const errorMessage = ref('');

const isDev = import.meta.env.DEV;

// Dev-only user switcher
function switchUser(e: Event, user: string) {
  e.preventDefault();
  // In a real app, you wouldn't hardcode passwords even for dev,
  // but keeping the switching logic for convenience without the hardcoded values in source if possible.
  // For now, we'll just pre-fill the username to speed up dev testing.
  authStore.username = user;
  // Password still needs to be entered manually or handled via a secure dev-only config
  // if you really need auto-login.
  // For safety, I've removed the hardcoded password map.
}

// Login handler
async function handleLogin() {
  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter both username and password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const authAPI = new AuthAPI();
    const response = await authAPI.login(username.value, password.value);

    if (response.authorized) {
      // Set auth token
      authStore.setAuth(username.value);
      // Navigate to game
      router.push('/game');
    } else {
      errorMessage.value = response.msg || 'Login failed';
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    errorMessage.value = 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500;600&display=swap');
</style>

<style scoped>
.font-fantasy {
  font-family: 'Cinzel', serif;
}

.text-shadow-glow {
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 20px rgba(20, 85, 180, 0.5);
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
