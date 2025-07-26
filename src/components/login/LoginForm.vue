<template>
	<div class="login-form-component">
		<Card class="max-w-md mx-auto border-l-4 border-primary hover:border-primary-600 transition-all duration-300 login-card">
			<template #title>
				<h2 class="text-center text-xl font-semibold text-primary">{{ title }}</h2>
			</template>

			<template #content>
				<div class="space-y-4">
					<div class="mb-4">
						<label for="username" class="block mb-2 font-medium text-surface-700">Username</label>
						<span class="p-input-icon-right w-full">
							<InputGroup>
								<InputGroupAddon>
									<i :class="'pi pi-user'"></i>
								</InputGroupAddon>
								<InputText id="username" v-model="username" placeholder="Enter username" class="w-full" :class="{ 'p-invalid': submitted && !username }" @keyup.enter="handleSubmit" />
							</InputGroup>
						</span>
						<small v-if="submitted && !username" class="text-red-500 block mt-1">Username is required</small>
					</div>

					<div v-if="showPassword" class="mb-4">
						<label for="password" class="block mb-2 font-medium text-surface-700">Password</label>
						<Password
							id="password"
							v-model="password"
							placeholder="Enter API Key"
							:feedback="false"
							:toggleMask="true"
							class="w-full"
							:class="{ 'p-invalid': submitted && !password }"
							@keyup.enter="handleSubmit" />
						<small v-if="submitted && !password" class="text-red-500 block mt-1">Password is required</small>
					</div>

					<div class="mt-6">
						<Button :label="submitLabel" @click="handleSubmit" :disabled="loading" :loading="loading" class="w-full" severity="primary" raised />
					</div>
				</div>
			</template>
		</Card>
	</div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { ref } from "vue";

const props = defineProps({
	title: {
		type: String,
		default: "Login",
	},
	submitLabel: {
		type: String,
		default: "Connect",
	},
	showPassword: {
		type: Boolean,
		default: false,
	},
	loading: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits<{
	(e: "submit", credentials: { username: string; password: string }): void;
}>();

const username = ref("tal");
const password = ref("Aa123123");
const submitted = ref(false);

function handleSubmit() {
	submitted.value = true;

	if (!username.value || (props.showPassword && !password.value)) {
		return;
	}

	emit("submit", {
		username: username.value,
		password: password.value,
	});
}
</script>

<style lang="scss" scoped>
@use "../../assets/css/common.scss" as *;

.login-form-component {
	background-color: var-to-rgba(--p-content-background, 0.9);
	width: 100%;
	height: 100%;
	position: absolute;
	z-index: 1;
	top: 0;
	left: 0;

	.login-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 400px;
		padding: 2rem 0;

		&:deep() {
			.p-password {
				display: inline-grid;
			}
		}
	}
}
</style>
