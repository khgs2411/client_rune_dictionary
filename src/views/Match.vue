<template>
	<div class="match">
		<div class="viewport" ref="viewportRef" :class="{ background: tryWebsocketConnection }">
			<template v-if="tryWebsocketConnection">
				<div v-if="loading" class="loading-container">
					<div class="loading-spinner"></div>
					<p>Connecting to chat server...</p>
				</div>
				<Chat :container-ref="viewportRef" v-else-if="client" :client="client" @logout="handleLogout" />
			</template>
			<LoginForm title="Start Chat" v-else @submit="handleSubmit" />

			<div class="content">
				<div class="flex gap large wrap" style="width: 100%; justify-content: center; height: 100%">
					<Card v-ripple class="match-card pvp" @click="handleMatchType('pvp')">
						<template #header>
							<img alt="pvp header" class="card-image" :src="`${baseUrl}match.webp`" />
						</template>
						<template #title>
							<span class="text-center flex">Player versus Player</span>
						</template>
						<template #subtitle>
							<span class="text-center flex">Challenge other players to a duel</span>
						</template>
						<template #content>
							<p class="flex text-center">Test your skills against other players in real-time combat using your runeabilities.</p>
						</template>
					</Card>

					<Card v-ripple class="match-card pve" @click="handleMatchType('pve')">
						<template #header>
							<img alt="pve header" class="card-image" :src="`${baseUrl}match.webp`" />
						</template>
						<template #title>
							<span class="text-center flex">Player versus Environment</span>
						</template>
						<template #subtitle>
							<span class="text-center flex">Challenge the environment</span>
						</template>
						<template #content>
							<p class="flex text-center">Face off against AI-controlled opponents and test your strategies.</p>
						</template>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { WebsocketEntityData } from "topsyde-utils";
import { computed, onMounted, ref, useTemplateRef } from "vue";
import useUtils from "../common/composables/useUtils";
import Chat from "../components/application/Chat.vue";
import LoginForm from "../components/login/LoginForm.vue";
import { useAuthStore } from "../stores/auth.store";
import AuthAPI from "../api/auth.api";
import { Card } from "primevue";

const api = new AuthAPI("api", import.meta.env.VITE_HOST);
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

function handleMatchType(type: "pvp" | "pve") {
	// Handle match type selection
	console.log(`Selected match type: ${type}`);
}

onMounted(() => {
	if (tryWebsocketConnection.value) performHandshake();
});
</script>

<style lang="scss" scoped>
.match {
	background-image: var(--match-bg-url);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;

	/* Use flexbox for proper centering */
	display: flex;
	justify-content: center;
	align-items: center;

	/* Standard viewport sizing */
	height: 100%;
	width: 100%;

	padding: 0;
	margin: 0;
	position: relative;

	/* Fix for iOS Safari */
	@supports (-webkit-touch-callout: none) {
		min-height: 100%;
		height: -webkit-fill-available;
	}

	.viewport {
		height: 90%;
		width: 90%;
		padding: 1%;
		border-radius: var(--p-border-radius-md);
		/* No need for margin with flexbox centering */
		margin: 0;

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

@media screen and (min-width: 1024px) and (min-height: 768px) and (orientation: landscape) {
	.viewport {
		min-width: 922px;
		min-height: 622px;
	}
}

@media screen and (min-width: 768px) and (min-height: 1024px) and (orientation: portrait) {
	.viewport {
		min-height: 922px;
		min-width: 622px;
	}
}

.content {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	padding: 2rem;
	overflow-y:auto;	
}

.match-card {
	width: 35rem;
	height: 75%;
	min-height: 50%;
	overflow: hidden;
	position: relative;
	cursor: pointer;
	box-shadow:
		0 4px 8px rgba(0, 0, 0, 0.1),
		0 6px 20px rgba(0, 0, 0, 0.1);
	transition:
		transform 0.3s ease,
		box-shadow 0.3s ease;
	background: var(--p-content-background);

	&:hover {
		transform: translateY(-5px);
		box-shadow:
			0 6px 12px rgba(0, 0, 0, 0.15),
			0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.card-image {
		width: 100%;
		height: 250px;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	&.pve .card-image {
		filter: hue-rotate(180deg) brightness(1.1);
		transform: scaleX(-1);
	}

	&::before {
		content: "";
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
		border-radius: var(--p-card-border-radius);
		border: 1px solid var(--p-primary-color);
		opacity: 0.3;
		pointer-events: none;
	}
}
</style>
