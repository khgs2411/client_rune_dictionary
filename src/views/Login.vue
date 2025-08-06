<template>
	<div class="login-container flex justify-center items-center min-h-screen bg-surface-ground">
		<div class="w-full max-w-md">
			<LoginForm title="Welcome Back" submitLabel="Sign In" :showPassword="true" :loading="loading" @submit="submit" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import useAuth from "../common/composables/useAuth";
import LoginForm from "../components/login/LoginForm.vue";
import { useAuthStore } from "../stores/auth.store";

const store = useAuthStore();
const { loading } = storeToRefs(store);
const auth$ = useAuth();

async function submit(credentials: { username: string; password: string }) {
	await auth$.login(credentials);
}

onMounted(()=>{
	console.log('onMounted')
})
</script>

<style scoped lang="scss">
.login-container {
	background-image: linear-gradient(135deg, var(--surface-ground) 0%, var(--surface-section) 100%);
}
</style>
