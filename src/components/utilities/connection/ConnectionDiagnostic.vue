<template>
	<div class="connection-diagnostic">
		<Dialog v-model:visible="dialogVisible" :closable="canClose" :closeOnEscape="canClose" :dismissableMask="canClose" modal header="Connection Diagnostics" :style="{ width: '600px' }">
			<div v-if="loading" class="diagnostic-loading">
				<ProgressBar mode="indeterminate" />
				<p>Running connection diagnostics...</p>
			</div>

			<div v-else class="diagnostic-results">
				<div v-if="results.popupBlocker" class="diagnostic-item" :class="{ error: results.popupBlocker.blocked }">
					<div class="diagnostic-icon">
						<i v-if="!results.popupBlocker.blocked" class="pi pi-check-circle" />
						<i v-else class="pi pi-times-circle" />
					</div>
					<div class="diagnostic-message"><strong>Popup Blocker:</strong> {{ results.popupBlocker.message }}</div>
				</div>

				<div class="diagnostic-item" :class="{ error: !results.webSocket.success }">
					<div class="diagnostic-icon">
						<i v-if="results.webSocket.success" class="pi pi-check-circle" />
						<i v-else class="pi pi-times-circle" />
					</div>
					<div class="diagnostic-message"><strong>WebSocket Connection:</strong> {{ results.webSocket.message }}</div>
				</div>

				<Message v-if="(results.popupBlocker && results.popupBlocker.blocked) || !results.webSocket.success" severity="warn" :sticky="true" class="troubleshooting">
					<h4>Troubleshooting Tips</h4>
					<ul>
						<li v-if="results.popupBlocker && results.popupBlocker.blocked">Disable popup blockers for this site in your browser settings</li>
						<li v-if="!results.webSocket.success">
							Check for browser extensions that might block WebSocket connections
							<ul>
								<li>Ad blockers (uBlock Origin, AdBlock Plus, etc.)</li>
								<li>Privacy extensions (Privacy Badger, Ghostery, etc.)</li>
								<li>Security extensions (NoScript, HTTPS Everywhere, etc.)</li>
							</ul>
						</li>
						<li>Try using a different browser</li>
						<li>Check if your firewall is blocking WebSocket connections</li>
					</ul>
				</Message>

				<div v-if="!canClose" class="countdown-message">
					<i class="pi pi-lock mr-2"></i>
					<span>You can close this dialog in {{ remainingTime }} seconds</span>
				</div>

				<div class="button-container">
					<Button @click="runDiagnostics" label="Run Diagnostics Again" icon="pi pi-refresh" severity="primary" />
					<Button v-if="canClose" @click="closeDialog" label="Close" icon="pi pi-times" severity="secondary" class="ml-2" />
				</div>
			</div>
		</Dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { runConnectionDiagnostics } from "./connectionDiagnostics";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressBar from "primevue/progressbar";

interface Props {
	testPopups?: boolean;
	websocketUrl?: string;
	/**
	 * Whether to show the dialog even when all tests pass
	 * @default false
	 */
	alwaysShow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	testPopups: false,
	websocketUrl: undefined,
	alwaysShow: false,
});

const emit = defineEmits<{
	/**
	 * Emitted when diagnostics are complete
	 */
	(
		e: "diagnosticsComplete",
		results: {
			popupBlocker?: { blocked: boolean; message: string };
			webSocket: { success: boolean; message: string };
		},
	): void;
}>();

const loading = ref(true);
const dialogVisible = ref(false);
const canClose = ref(false);
const remainingTime = ref(10);
const results = ref<{
	popupBlocker?: { blocked: boolean; message: string };
	webSocket: { success: boolean; message: string };
}>({
	webSocket: { success: false, message: "" },
});

/**
 * Determines if there are any issues with the connection
 */
const hasIssues = (): boolean => {
	const hasWebSocketIssue = !results.value.webSocket.success;
	const hasPopupBlockerIssue = results.value.popupBlocker?.blocked === true;

	return hasWebSocketIssue || hasPopupBlockerIssue || false;
};

const runDiagnostics = async () => {
	loading.value = true;
	canClose.value = false;
	remainingTime.value = 10;

	// If dialog is already visible, keep it visible during the test
	const wasVisible = dialogVisible.value;
	if (wasVisible) {
		dialogVisible.value = true;
	}

	results.value = await runConnectionDiagnostics({
		wsUrl: props.websocketUrl,
		testPopups: props.testPopups,
	});

	// Emit the results
	emit("diagnosticsComplete", results.value);

	// Show dialog only if there are issues or if alwaysShow is true
	dialogVisible.value = props.alwaysShow || hasIssues();

	loading.value = false;

	// Only start countdown if dialog is visible
	if (dialogVisible.value) {
		startCountdown();
	}
};

const startCountdown = () => {
	const timer = setInterval(() => {
		remainingTime.value--;
		if (remainingTime.value <= 0) {
			clearInterval(timer);
			canClose.value = true;
		}
	}, 1000);
};

const closeDialog = () => {
	dialogVisible.value = false;
};

onMounted(() => {
	runDiagnostics();
});
</script>

<style scoped>
.connection-diagnostic {
	color: var(--p-text-color);
}

.diagnostic-loading {
	text-align: center;
	padding: 1rem 0;
}

.diagnostic-loading p {
	margin-top: 1rem;
	font-style: italic;
	color: var(--p-text-muted-color);
}

.diagnostic-results {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.diagnostic-item {
	display: flex;
	padding: 1rem;
	border-radius: var(--p-content-border-radius);
	border: 1px solid var(--p-content-border-color);
	border-left: 4px solid var(--p-green-500);
}

.diagnostic-item.error {
	border-left-color: var(--p-red-500);
}

.diagnostic-icon {
	margin-right: 1rem;
	font-size: 1.2rem;
}

.diagnostic-icon .pi-check-circle {
	color: var(--p-green-500);
}

.diagnostic-icon .pi-times-circle {
	color: var(--p-red-500);
}

.diagnostic-message {
	flex: 1;
}

.troubleshooting {
	margin-top: 0.5rem;
}

.troubleshooting ul {
	margin-bottom: 0;
	padding-left: 1.5rem;
}

.troubleshooting li {
	margin-bottom: 0.5rem;
}

.troubleshooting li:last-child {
	margin-bottom: 0;
}

.countdown-message {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem;
	background-color: var(--p-content-background);
	border-radius: var(--p-content-border-radius);
	border: 1px solid var(--p-content-border-color);
	color: var(--p-text-muted-color);
	font-style: italic;
}

.button-container {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}
</style>
