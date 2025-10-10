<template>
  <!-- Lighting -->
  <TresAmbientLight :intensity="0.3" />
  <TresDirectionalLight :position="[5, 5, 5]" :intensity="0.8" />
  <TresPointLight :position="[0, 2, 0]" :intensity="1" :color="settings.theme.primary" />

  <!-- Rotating background elements - animated runes -->
  <TresGroup ref="backgroundGroup">
    <!-- Central rotating ring -->
    <TresMesh :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[3, 0.1, 16, 100]" />
      <TresMeshStandardMaterial
        :color="settings.theme.primary"
        :emissive="settings.theme.primary"
        :emissiveIntensity="0.5" />
    </TresMesh>

    <!-- Orbiting rune symbols (simple cubes for now) -->
    <TresMesh v-for="i in 8" :key="i" :position="getOrbitPosition(i, 8, 4)">
      <TresBoxGeometry :args="[0.3, 0.3, 0.3]" />
      <TresMeshStandardMaterial
        :color="settings.theme.accent"
        :emissive="settings.theme.accent"
        :emissiveIntensity="0.3" />
    </TresMesh>
  </TresGroup>

  <!-- Ground plane with grid -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -2, 0]">
    <TresPlaneGeometry :args="[20, 20]" />
    <TresMeshStandardMaterial :color="settings.theme.muted" :opacity="0.5" transparent />
  </TresMesh>
  <TresGridHelper :args="[20, 20]" :position="[0, -1.99, 0]" />

  <!-- HTML Overlay for login form -->
  <Html :center="true" :distance-factor="10">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">RUNE RPG</h1>
        <p class="login-subtitle">Login</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="isLoading" />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="isLoading" />
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Enter' }}
          </button>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </Html>
</template>

<script setup lang="ts">
import { Html } from '@tresjs/cientos';
import { onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthAPI from '@/api/auth.api';
import { useGameContext } from '@/composables/useGameContext';
import { useSettingsStore } from '@/stores/settings.store';

const settings = useSettingsStore();
const router = useRouter();

// Inject game context (no character needed)
const { scene$, registerCustomUpdate } = useGameContext();

// Login form state
const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Background animation state
const backgroundGroup = ref();
const rotationSpeed = 0.5;

// Helper to calculate orbit positions for runes
function getOrbitPosition(index: number, total: number, radius: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, 1, z];
}

// Custom update loop for animations
let cleanupUpdate: (() => void) | undefined;

if (registerCustomUpdate) {
  cleanupUpdate = registerCustomUpdate((delta) => {
    // Rotate background group
    if (backgroundGroup.value) {
      backgroundGroup.value.rotation.y += delta * rotationSpeed;
    }
  });
}

// Cleanup on unmount
onUnmounted(() => {
  if (cleanupUpdate) {
    cleanupUpdate();
  }
});

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
      console.log('✅ Login successful!');
      // Navigate to game
      router.push('/game/playground');
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

// HMR handling
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    scene$.reload();
  });
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid hsl(var(--primary));
  border-radius: 12px;
  padding: 2.5rem;
  min-width: 320px;
  box-shadow: 0 0 30px rgba(var(--primary-rgb), 0.3);
}

.login-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: hsl(var(--primary));
  text-align: center;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px hsl(var(--primary));
}

.login-subtitle {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.form-group input {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  color: hsl(var(--foreground));
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.2);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-button {
  padding: 0.875rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-button:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
  box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.4);
  transform: translateY(-2px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  text-align: center;
  margin-top: -0.5rem;
}
</style>
