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
				@logout="auth$.logout()"
			/>
		</template>
		<div v-else-if="errorMessage" class="chat-error-message">{{ errorMessage }}</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, watch } from "vue";
import useAuth from "../../common/composables/useAuth";
import Chat from "./Chat.vue";

defineProps({
	containerRef: {
		type: [Object, null] as PropType<HTMLElement | null>,
		required: true,
	},
});

const auth$ = useAuth();

const errorMessage = ref("");

// Single computed property for chat readiness
const isChatReady = computed(() => auth$.authorized.value && !!auth$.client.value);

// Watch for desync: authorized but no client (chat connection failed)
watch(
	() => [auth$.authorized.value, auth$.client.value],
	([authorized, client]) => {
		if (authorized && !client) {
			errorMessage.value = "Your chat session expired or failed to connect. Please log in again.";
			auth$.logout();
		}
	},
	{ immediate: true }
);
</script>

<style lang="scss" scoped>
.chat-error-message {
	color: var(--p-red-500);
	background: var(--p-content-background);
	padding: 1rem;
	margin-bottom: 1rem;
	border-radius: 4px;
	text-align: center;
}
</style>
