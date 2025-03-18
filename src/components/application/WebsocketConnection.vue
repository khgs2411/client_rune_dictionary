<template>
	<div class="websocket-connection-interface" v-if="auth$.authorized.value">
		<template v-if="auth$.tryWebsocketConnection.value">
			<div v-if="auth$.loading.value" class="loading-container">
				<div class="loading-spinner"></div>
				<p>Connecting to chat server...</p>
			</div>
			<Chat :container-ref="containerRef" v-else-if="auth$.client.value" :client="auth$.client.value" @logout="auth$.websocketLogout()" />
		</template>
		<LoginForm title="Start Chat" v-else @submit="handleSubmit" />
	</div>
</template>

<script lang="ts" setup>
import { onMounted, PropType } from "vue";
import useAuth from "../../common/composables/useAuth";
import LoginForm from "../login/LoginForm.vue";
import Chat from "./Chat.vue";
defineProps({
	containerRef: {
		type: Object as PropType<HTMLElement | null>,
		required: true,
	},
});

const auth$ = useAuth();

async function handleSubmit(credentials: { username: string; password: string }) {
	auth$.username.value = credentials.username;
	await auth$.websocketHandshake();
}

onMounted(() => {
	if (auth$.tryWebsocketConnection.value) auth$.websocketHandshake();
});
</script>

<style lang="scss" scoped></style>
