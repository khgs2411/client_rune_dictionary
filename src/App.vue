<template>
	<Layout />
	<ConnectionDiagnostic />
	<div class="application" ref="viewportRef">
		<RouterView />
		<template v-if="auth$.authorized.value">
			<template v-if="auth$.tryWebsocketConnection.value">
				<div v-if="auth$.loading.value" class="loading-container">
					<div class="loading-spinner"></div>
					<p>Connecting to chat server...</p>
				</div>
				<Chat :container-ref="viewportRef" v-else-if="auth$.client.value" :client="auth$.client.value" @logout="auth$.websocketLogout()" />
			</template>
			<LoginForm title="Start Chat" v-else @submit="handleSubmit" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Layout from "./components/layout/Layout.vue";
import ConnectionDiagnostic from "./components/utilities/connection/ConnectionDiagnostic.vue";
import Chat from "./components/application/Chat.vue";
import { useTemplateRef, onMounted } from "vue";
import LoginForm from "./components/login/LoginForm.vue";
import useAuth from "./common/composables/useAuth";
const auth$ = useAuth();
const viewportRef = useTemplateRef("viewportRef");

function handleSubmit(credentials: { username: string; password: string }) {
	auth$.username.value = credentials.username;
	auth$.websocketHandshake();
}

onMounted(() => {
	if (auth$.tryWebsocketConnection.value) auth$.websocketHandshake();
});
</script>

<style lang="scss" scoped>
$layoutHeight: 55px;

.application {
	min-height: calc(100vh - $layoutHeight);
	height: calc(100vh - $layoutHeight);
	max-height: calc(100vh - $layoutHeight);
	overflow-y: auto;

	/* Fix for mobile viewport height issues */
	@supports (-webkit-touch-callout: none) {
		/* iOS specific fix */
		min-height: calc(100% - $layoutHeight);
		height: calc(-webkit-fill-available - $layoutHeight);
		max-height: calc(-webkit-fill-available - $layoutHeight);
	}
}
</style>
