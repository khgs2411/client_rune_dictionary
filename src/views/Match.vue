<template>
	<div class="match flex column gap large" v-debug>
		<div class="viewport" v-debug>
			<div v-if="loading" class="loading-container">
				<div class="loading-spinner"></div>
				<p>Connecting to chat server...</p>
			</div>
			<Chat v-else :client="client" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import API from "../api/app.api";
import Chat from "../components/application/Chat.vue";
import { WebsocketEntityData } from "topsyde-utils";
import useUtils from "../common/composables/useUtils";
import { useAuthStore } from "../stores/auth.store";

const api = new API();
const utils = useUtils();
const loading = ref(true);
const client = ref<WebsocketEntityData>({ id: "", name: "" });
const store = useAuthStore();
async function performHandshake() {
	try {
		loading.value = true;
		console.log(store.username, store.password, import.meta.env.API_KEY);
		const username = store.username;
		const password = store.password;
		const api_key = import.meta.env.API_KEY || "";

		const response = await api.handshake(username, password, api_key);
		if (!response.status) throw new Error("Invalid handshake response");
		console.log("Handshake successful - client data:", response.data);

		client.value = {
			id: response.data.id,
			name: response.data.name,
		};

		utils.lib.Log("Handshake successful - client data:", client.value);
	} catch (error) {
		utils.lib.Warn("Handshake failed:", error);
		// Set fallback values if handshake fails
		client.value = {
			id: Math.floor(Math.random() * 10000).toString(),
			name: "Guest",
		};
		utils.lib.Log("Using fallback client data:", client.value);
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	performHandshake();
});
</script>

<style lang="scss" scoped>
.match {
	background-image: url("/match.webp");
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
		background: var(--p-content-background);
		height: 90%;
		width: 90%;
		padding: 1%;
		border-radius: var(--p-border-radius-md);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #fff;

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
		border-top-color: #fff;
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
}
</style>
