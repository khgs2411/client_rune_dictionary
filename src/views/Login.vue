<template>
  <div class="min-h-svh w-full flex items-center justify-center bg-background px-4 py-8">
    <div class="w-full max-w-sm space-y-6">
      <!-- Logo/Title -->
      <div class="text-center space-y-1">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">RUNE RPG</h1>
        <p class="text-sm text-muted-foreground">Sign in to continue</p>
      </div>

      <!-- Login Card -->
      <div class="rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username Input -->
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter username"
              required
              :disabled="isLoading"
              autocomplete="username" />
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter password"
              required
              :disabled="isLoading"
              autocomplete="current-password" />
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <Button type="submit" class="w-full h-11" :disabled="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>
      </div>

      <!-- Footer Text -->
      <p class="text-center text-xs text-muted-foreground">Need an account? Contact admin</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthAPI from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const router = useRouter();

// Form state
const username = ref(import.meta.env.DEV ? 'tal' : '');
const password = ref(import.meta.env.DEV ? 'Aa123123' : '');
const isLoading = ref(false);
const errorMessage = ref('');

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
</script>
