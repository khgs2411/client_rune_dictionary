<template>
	<div class="websocket-connection-interface">
		<template v-if="isChatReady">
			<div v-if="auth$.loading.value" class="loading-container">
				<div class="loading-spinner"></div>
				<p>Connecting to chat server...</p>
			</div>
			<Chat
				:container-ref="containerRef"
				v-else-if="auth$.client.value"
				:client="auth$.client.value!"
				@logout="auth$.websocketLogout()"
			/>
		</template>
		<LoginForm title="Start Chat" v-else @submit="handleSubmit" :loading="auth$.loading.value" />
	</div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import useAuth from "../../common/composables/useAuth";
import LoginForm from "../login/LoginForm.vue";
import Chat from "./Chat.vue";

defineProps({
	containerRef: {
		type: [Object, null] as PropType<HTMLElement | null>,
		required: true,
	},
});

const auth$ = useAuth();

// 2. Single computed property for chat readiness
const isChatReady = computed(() => auth$.authorized.value && !!auth$.client.value);

async function handleSubmit(credentials: { username: string; password: string }) {
	await auth$.login(credentials);
}

// 7. SECURITY: Do not persist sensitive data like passwords. Ensure password is cleared on logout.
</script>

<style lang="scss" scoped></style>
