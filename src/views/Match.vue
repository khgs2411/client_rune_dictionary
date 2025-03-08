<template>
	<div class="match flex column gap large">
		<div class="viewport" ref="viewportRef" :class="{ background: tryWebsocketConnection }">
			<template v-if="tryWebsocketConnection">
				<div v-if="loading" class="loading-container">
					<div class="loading-spinner"></div>
					<p>Connecting to chat server...</p>
				</div>
				<Chat :container-ref="viewportRef" v-else-if="client" :client="client" @logout="handleLogout" />
			</template>
			<LoginForm title="Start Chat" v-else @submit="handleSubmit" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { WebsocketEntityData } from "topsyde-utils";
import { computed, onMounted, ref, useTemplateRef } from "vue";
import API from "../api/app.api";
import useUtils from "../common/composables/useUtils";
import Chat from "../components/application/Chat.vue";
import LoginForm from "../components/login/LoginForm.vue";
import { useAuthStore } from "../stores/auth.store";

const api = new API();
const utils = useUtils();
const viewportRef = useTemplateRef("viewportRef");
const loading = ref(true);
const client = ref<WebsocketEntityData | null>(null);
const store = useAuthStore();
const username = computed(() => store.username);
const password = computed(() => store.password);
const api_key = computed(() => import.meta.env.VITE_API_KEY);
const tryWebsocketConnection = ref(!utils.lib.IsEmpty(username.value));
const baseUrl = import.meta.env.BASE_URL;

// Set CSS variable for background image
document.documentElement.style.setProperty("--match-bg-url", `url(${baseUrl}match.webp)`);

function handleSubmit(credentials: { username: string; password: string }) {
	store.username = credentials.username;
	performHandshake();
}

async function performHandshake() {
	try {
		tryWebsocketConnection.value = true;
		loading.value = true;
		const response = await api.handshake(username.value, password.value, api_key.value);
		if (!response.status) throw new Error("Invalid handshake response");

		client.value = {
			id: response.data.id,
			name: response.data.name,
		};

		utils.lib.Log("Handshake successful - client data:", client.value);
		loading.value = false;
	} catch (error) {
		tryWebsocketConnection.value = false;
		utils.lib.Warn("Handshake failed:", error);
	}
}

function handleLogout() {
	// Reset client data
	client.value = null;
	store.username = "";

	// Reset connection state
	tryWebsocketConnection.value = false;

	// Log the logout action
	utils.lib.Log("User logged out, returning to login screen");
}

onMounted(() => {
	// if (tryWebsocketConnection.value) performHandshake();
	const socket2 = new WebSocket(`wss://topsyde-gaming.duckdns.org:3000`, "9991-YourUsername");
	const socket = new WebSocket(`ws://localhost:8080/ws`, "999-YourUsername");
	socket2.onopen = () => {
		console.log("Connected to WebSocket");
	};
	socket2.onerror = (error) => {
		console.error("WebSocket error:", error);
	};
	// Add event listeners
	socket.onopen = () => {
		console.log("Connected to WebSocket");
	};

	socket.onerror = (error) => {
		console.error("WebSocket error:", error);
	};
});
</script>

<style lang="scss" scoped>
.match {
	background-image: var(--match-bg-url);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;
	height: 100%;
	width: 100%;
	padding: 0;
	margin: 0;
	position: relative;

	.viewport {
		height: 90%;
		width: 90%;
		padding: 1%;
		border-radius: var(--p-border-radius-md);

		&.background {
			background: var(--p-content-background);
		}
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--p-text-color);

		p {
			margin-top: 1rem;
			font-size: 1.2rem;
		}
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 5px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: var(--p-primary-color);
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
}
</style>
