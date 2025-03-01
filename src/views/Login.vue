<template>
	<div class="login-container flex justify-center items-center min-h-screen bg-surface-ground">
		<div class="w-full max-w-md">
			<LoginForm 
				title="Welcome Back" 
				submitLabel="Sign In" 
				:showPassword="true"
				:loading="loading"
				@submit="handleLoginSubmit" 
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import AuthAPI from "../api/auth.api";
import LoginForm from "../components/login/LoginForm.vue";
import useUtils from "../common/composables/useUtils";

const api = new AuthAPI("main");
const store = useAuthStore();
const router = useRouter();
const { loading } = storeToRefs(store);
const utils = useUtils();

async function handleLoginSubmit(credentials: { username: string, password: string }) {
	try {
		// Update store values
		store.username = credentials.username;
		store.password = credentials.password;
		
		loading.value = true;
		const res = await api.login(credentials.username, credentials.password);
		store.setAuthorized(res.authorized);
		utils.toast.success("Login successful");
		
		router.push("/app");
		setTimeout(() => {
			loading.value = false;
		}, 1001);
	} catch (e) {
		loading.value = false;
		utils.toast.error("Failed to login. Please check your credentials.");
	}
}
</script>

<style scoped lang="scss">
.login-container {
	background-image: linear-gradient(135deg, var(--surface-ground) 0%, var(--surface-section) 100%);
}
</style>
