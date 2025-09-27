<template>
	<div class="login-container min-h-screen flex items-center justify-center p-4">
		<!-- Background Pattern -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<motion.div
				:initial="{ opacity: 0, scale: 0.8 }"
				:animate="{ opacity: 0.08, scale: 1 }"
				:transition="{ duration: 2, ease: 'easeOut' }"
				class="login-orb login-orb-1 absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
			/>
			<motion.div
				:initial="{ opacity: 0, scale: 0.8 }"
				:animate="{ opacity: 0.08, scale: 1 }"
				:transition="{ duration: 2, delay: 0.5, ease: 'easeOut' }"
				class="login-orb login-orb-2 absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
			/>
		</div>

		<!-- Login Card -->
		<motion.div
			:initial="{ opacity: 0, y: 50, scale: 0.95 }"
			:animate="{ opacity: 1, y: 0, scale: 1 }"
			:transition="{ 
				type: 'spring', 
				stiffness: 100, 
				damping: 15, 
				mass: 1,
				delay: 0.2 
			}"
			class="w-full max-w-md relative z-10"
		>
			<Panel class="login-card backdrop-blur-xl shadow-2xl">
				<template #header>
					<div class="login-header text-center space-y-2 pb-8">
					<motion.div
						:initial="{ opacity: 0, scale: 0.8 }"
						:animate="{ opacity: 1, scale: 1 }"
						:transition="{ 
							type: 'spring', 
							stiffness: 150, 
							damping: 12,
							delay: 0.4 
						}"
						class="login-avatar w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
					>
						<i class="pi pi-user text-2xl login-avatar-icon"></i>
					</motion.div>
						<h2 class="login-title text-2xl font-bold">Welcome Back</h2>
						<p class="login-subtitle">
							Enter your credentials to access Rune RPG
						</p>
					</div>
				</template>

				<div class="login-content space-y-6">
					<motion.div
						:initial="{ opacity: 0, x: -30 }"
						:animate="{ opacity: 1, x: 0 }"
						:transition="{ delay: 0.6, duration: 0.5 }"
						class="space-y-2"
					>
						<label for="username" class="login-label text-sm font-medium">
							Username
						</label>
						<div class="relative">
							<InputText
								id="username"
								v-model="username"
								placeholder="Enter your username"
								class="login-input pl-10"
								:class="{ 'login-input-error': submitted && !username }"
								@keyup.enter="handleSubmit"
							/>
							<i class="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 login-input-icon"></i>
						</div>
						<motion.p
							v-if="submitted && !username"
							:initial="{ opacity: 0, y: -10 }"
							:animate="{ opacity: 1, y: 0 }"
							:transition="{ duration: 0.3 }"
							class="login-error text-sm"
						>
							Username is required
						</motion.p>
					</motion.div>

					<motion.div
						v-if="showPassword"
						:initial="{ opacity: 0, x: -30 }"
						:animate="{ opacity: 1, x: 0 }"
						:transition="{ delay: 0.7, duration: 0.5 }"
						class="space-y-2"
					>
						<label for="password" class="login-label text-sm font-medium">
							API Key
						</label>
						<div class="relative">
							<InputText
								id="password"
								v-model="password"
								:type="showPasswordText ? 'text' : 'password'"
								placeholder="Enter your API key"
								class="login-input pl-10 pr-10"
								:class="{ 'login-input-error': submitted && !password }"
								@keyup.enter="handleSubmit"
							/>
							<i class="pi pi-key absolute left-3 top-1/2 -translate-y-1/2 login-input-icon"></i>
							<button
								type="button"
								@click="showPasswordText = !showPasswordText"
								class="absolute right-3 top-1/2 -translate-y-1/2 login-input-icon hover:opacity-100 transition-opacity"
							>
								<i :class="showPasswordText ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
							</button>
						</div>
						<motion.p
							v-if="submitted && !password"
							:initial="{ opacity: 0, y: -10 }"
							:animate="{ opacity: 1, y: 0 }"
							:transition="{ duration: 0.3 }"
							class="login-error text-sm"
						>
							API Key is required
						</motion.p>
					</motion.div>

					<motion.div
						:initial="{ opacity: 0, y: 20 }"
						:animate="{ opacity: 1, y: 0 }"
						:transition="{ delay: 0.8, duration: 0.5 }"
					>
						<Button
							@click="handleSubmit"
							:disabled="loading"
							class="login-button w-full font-semibold py-6 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							<motion.div
								v-if="loading"
								:animate="{ rotate: 360 }"
								:transition="{ duration: 1, repeat: Infinity, ease: 'linear' }"
								class="login-spinner w-5 h-5 border-2 border-t-transparent rounded-full mr-2"
							/>
							<span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
						</Button>
					</motion.div>
				</div>
			</Panel>
		</motion.div>
	</div>
</template>

<script setup lang="ts">
import { motion } from "motion-v";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import useAuth from "../common/composables/useAuth";
import { useAuthStore } from "../stores/auth.store";
import Button from "primevue/button";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";

const store = useAuthStore();
const { loading } = storeToRefs(store);
const auth$ = useAuth();

// Form data
const username = ref("tal");
const password = ref("Aa123123");
const submitted = ref(false);
const showPassword = ref(true);
const showPasswordText = ref(false);

async function handleSubmit() {
	submitted.value = true;

	if (!username.value || (showPassword.value && !password.value)) {
		return;
	}

	await auth$.login({
		username: username.value,
		password: password.value,
	});
}
</script>

<style scoped lang="scss">
// Login page theming using CSS variables from the color system
.login-container {
	background: var(--background);
	position: relative;
	
	// Dynamic gradient background based on current theme
	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, 
			color-mix(in oklch, var(--background) 90%, var(--primary) 10%) 0%,
			color-mix(in oklch, var(--background) 85%, var(--primary) 15%) 50%,
			color-mix(in oklch, var(--background) 90%, var(--accent) 10%) 100%
		);
		z-index: -1;
	}
}

// Background orbs using theme primary color
.login-orb-1 {
	background: var(--primary);
	opacity: 0.08;
}

.login-orb-2 {
	background: var(--accent);
	opacity: 0.08;
}

// Login card styling
.login-card {
	background: color-mix(in oklch, var(--p-content-background) 90%, transparent 10%);
	border: 1px solid color-mix(in oklch, var(--p-content-border-color) 60%, transparent 40%);
	color: var(--p-text-color);

	&:deep(.p-panel-header) {
		background: transparent;
		border-bottom: none;
		padding: 2rem 2rem 0 2rem;
	}

	&:deep(.p-panel-content) {
		padding: 0 2rem 2rem 2rem;
	}

	.login-header {
		padding-bottom: 2rem;
	}

	.login-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
}

// Avatar with primary gradient
.login-avatar {
	background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.login-avatar-icon {
	color: var(--primary-foreground);
}

// Typography
.login-title {
	color: var(--p-text-color);
	margin: 0;
}

.login-subtitle {
	color: var(--p-text-muted-color);
	margin: 0.5rem 0 0 0;
}

.login-label {
	color: var(--p-text-color);
	display: block;
	margin-bottom: 0.5rem;
}

// Input styling with theme variables
.login-input {
	background: color-mix(in oklch, var(--p-content-background) 80%, transparent 20%);
	border-color: color-mix(in oklch, var(--p-content-border-color) 70%, transparent 30%);
	color: var(--p-text-color);
	width: 100%;

	&::placeholder {
		color: var(--p-text-muted-color);
		opacity: 0.8;
	}

	&:focus {
		border-color: var(--p-primary-color);
		box-shadow: 0 0 0 2px color-mix(in oklch, var(--p-primary-color) 20%, transparent 80%);
	}

	&.login-input-error {
		border-color: var(--p-red-500);
	}
}

.login-input-icon {
	color: var(--p-text-muted-color);
	opacity: 0.8;

	&:hover {
		color: var(--p-text-color);
		opacity: 1;
	}
}

// Error styling
.login-error {
	color: var(--p-red-500);
}

// Button with primary gradient
.login-button {
	background: linear-gradient(135deg, var(--p-primary-color) 0%, var(--p-primary-600) 100%);
	color: white;
	border: none;
	width: 100%;

	&:hover {
		background: linear-gradient(135deg,
			color-mix(in oklch, var(--p-primary-color) 85%, black 15%) 0%,
			color-mix(in oklch, var(--p-primary-600) 85%, black 15%) 100%
		);
		box-shadow: 0 10px 25px color-mix(in oklch, var(--p-primary-color) 25%, transparent 75%);
	}

	&:disabled {
		background: var(--p-surface-300);
		color: var(--p-text-muted-color);

		&:hover {
			background: var(--p-surface-300);
			color: var(--p-text-muted-color);
			transform: none;
			box-shadow: none;
		}
	}
}

// Loading spinner
.login-spinner {
	border-color: white;
	border-top-color: transparent;
}

// Dark mode specific adjustments
:global(.dark) .login-card {
	background: color-mix(in oklch, var(--p-content-background) 85%, transparent 15%);
}

:global(.dark) .login-input {
	background: color-mix(in oklch, var(--p-content-background) 90%, var(--p-content-border-color) 10%);
}
</style>
