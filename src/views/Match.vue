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

// Define WebSocket connection method type
interface ConnectionMethod {
	name: string;
	url: string;
	protocol: string | null;
}

function handleSubmit(credentials: { username: string; password: string }) {
	store.username = credentials.username;
	performHandshake();
}

async function performHandshake() {
	try {
		tryWebsocketConnection.value = true;
		loading.value = true;
		if (utils.lib.IsEmpty(username.value) || utils.lib.IsEmpty(password.value) || utils.lib.IsEmpty(api_key.value)) throw new Error("Invalid credentials");
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
		utils.toast.error("Handshake failed:");
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
	// Try multiple WebSocket connection methods
	const connectionMethods = [
		{
			name: "Direct connection",
			url: "wss://topsyde-gaming.duckdns.org:3000",
			protocol: "9991-YourUsername",
		},
		{
			name: "Alternative port",
			url: "wss://topsyde-gaming.duckdns.org:443",
			protocol: "9991-YourUsername",
		},
		{
			name: "No protocol",
			url: "wss://topsyde-gaming.duckdns.org:3000",
			protocol: null,
		},
	];

	// Try each connection method
	tryConnections(connectionMethods);

	// Actual implementation - leave commented out
	// if (tryWebsocketConnection.value) performHandshake();
});

// Function to try multiple connection methods
async function tryConnections(methods: ConnectionMethod[], index = 0) {
	if (index >= methods.length) {
		console.error("All WebSocket connection methods failed");
		utils.toast.error("Failed to connect to chat server. Please try again later.");
		return;
	}

	const method = methods[index];
	console.log(`Trying connection method ${index + 1}/${methods.length}: ${method.name}`);

	try {
		// Create WebSocket connection
		const socket = method.protocol ? new WebSocket(method.url, method.protocol) : new WebSocket(method.url);

		// Set up event handlers
		socket.onopen = (ws) => {
			console.log(`Successfully connected using method: ${method.name}`);
			utils.toast.success(`Connected to chat server`);

			// Store the successful connection method for future use
			localStorage.setItem("successful_ws_method", JSON.stringify(method));
			socket.close(1000, "Success");
		};

		socket.onclose = (event) => {
			console.log(`WebSocket closed (${method.name}):`, event.code, event.reason);

			// If connection was closed abnormally, try next method
			if (event.code !== 1000 && event.code !== 1001) {
				console.log(`Connection method ${method.name} failed with code ${event.code}. Trying next method...`);
				setTimeout(() => tryConnections(methods, index + 1), 1000);
			}
		};

		socket.onerror = (error) => {
			console.error(`WebSocket error (${method.name}):`, error);
		};

		socket.onmessage = (event) => {
			console.log(`WebSocket message received:`, event.data);
		};
	} catch (error) {
		console.error(`Failed to create WebSocket using method ${method.name}:`, error);

		// Try next method
		setTimeout(() => tryConnections(methods, index + 1), 1000);
	}
}
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
