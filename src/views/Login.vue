<template>
  <div class="min-h-svh w-full flex items-center justify-center bg-background px-4 py-8">
    <!-- User Switch Button Group - topright -->
    <div class="absolute top-20 right-4">
      <ButtonGroup>
        <Button variant="outline" @click="switchUser($event, 'tal')">Tal</Button>
        <Button variant="outline" @click="switchUser($event, 'yazin')">Yazin</Button>
      </ButtonGroup>
    </div>
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
            <Input id="username" v-model="username" type="text" placeholder="Enter username" required
              :disabled="isLoading" autocomplete="username" />
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" placeholder="Enter password" required
              :disabled="isLoading" autocomplete="current-password" />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import AuthAPI from '@/api/auth.api';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { useAuthStore } from '@/stores/auth.store';
  import ButtonGroup from '@/components/ui/button-group/ButtonGroup.vue';

  const router = useRouter();
  const authStore = useAuthStore();

  // Form state
  const username = computed(() => authStore.username);
  const password = computed(() => authStore.password);
  const isLoading = ref(false);
  const errorMessage = ref('');

  const admin_users = [
    { username: 'tal', password: 'Aa123123' },
    { username: 'yazin', password: 'r_d_0733e6dd-f421-46cf-bf8a-72a2898f91e6' }
  ]


  function switchUser(e: Event, user: string) {
    e.preventDefault();
    const selected_user = admin_users.find(u => u.username === user);
    if (selected_user) {
      authStore.username = selected_user.username;
      authStore.password = selected_user.password;
    }
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
        console.log('✅ Login successful!');

        // Set auth token with TTL
        authStore.setAuth(username.value); // Using username as token for now

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
