<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="showModal" class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
				<div class="w-full max-w-2xl animate-in zoom-in-95 duration-200">
					<div class="rounded-lg border border-border bg-card p-6 shadow-2xl space-y-4">
						<!-- Header -->
						<div class="text-center space-y-2">
							<div class="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<h2 class="text-2xl font-bold tracking-tight text-foreground">Connection Blocked</h2>
							<p class="text-sm text-muted-foreground">Unable to connect to the game server. Please check your browser settings.</p>
						</div>

						<!-- Diagnostic Results -->
						<div v-if="!loading" class="space-y-3">
							<!-- WebSocket Test Result -->
							<div class="flex items-start gap-3 p-3 rounded-md border" :class="results.webSocket.success ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'">
								<div class="flex-shrink-0 mt-0.5">
									<svg v-if="results.webSocket.success" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd" />
									</svg>
									<svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd" />
									</svg>
								</div>
								<div class="flex-1">
									<strong class="text-sm font-semibold">WebSocket Connection:</strong>
									<p class="text-sm text-muted-foreground mt-1">{{ results.webSocket.message }}</p>
								</div>
							</div>

							<!-- Troubleshooting Tips -->
							<div v-if="!results.webSocket.success" class="rounded-md bg-yellow-500/10 border border-yellow-500/50 p-4">
								<h4 class="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Troubleshooting Tips
								</h4>
								<ul class="text-sm text-muted-foreground space-y-1.5 ml-6 list-disc">
									<li>
										<strong>Browser Extensions:</strong> Disable ad blockers and privacy extensions
										<ul class="ml-4 mt-1 list-circle space-y-1">
											<li>uBlock Origin, AdBlock Plus, AdGuard</li>
											<li>Privacy Badger, Ghostery, DuckDuckGo Privacy Essentials</li>
											<li>NoScript, HTTPS Everywhere</li>
										</ul>
									</li>
									<li><strong>Popup Blockers:</strong> Allow popups for this site in browser settings</li>
									<li><strong>Firewall:</strong> Check if your firewall is blocking WebSocket connections</li>
									<li><strong>VPN/Proxy:</strong> Try disabling VPN or proxy if active</li>
									<li><strong>Try:</strong> Use incognito mode or a different browser (Chrome, Firefox, Edge)</li>
								</ul>
							</div>

							<!-- Countdown Message -->
							<div v-if="!canClose" class="flex items-center justify-center gap-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
								<span>You can retry in {{ remainingTime }} seconds</span>
							</div>
						</div>

						<!-- Loading State -->
						<div v-else class="text-center py-8">
							<svg class="animate-spin h-8 w-8 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<p class="text-sm text-muted-foreground mt-3">Running diagnostics...</p>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 justify-center pt-2">
							<Button @click="handleRetry" :disabled="!canClose || loading" variant="default">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Retry Connection
							</Button>
							<Button v-if="canClose" @click="handleClose" variant="outline"> Close </Button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useConnectionDiagnostics } from "@/composables/character/useConnectionDiagnostics";
import { onMounted, ref } from "vue";

interface Props {
	wsUrl?: string;
	protocol?: string;
}

const props = withDefaults(defineProps<Props>(), {
	wsUrl: undefined,
	protocol: undefined,
});

const emit = defineEmits<{
	connectionSuccess: [];
	connectionFailed: [];
}>();

const diagnostics = useConnectionDiagnostics();
const showModal = ref(false);
const canClose = ref(false);
const remainingTime = ref(10);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const loading = diagnostics.loading;
const results = diagnostics.results;

async function runDiagnostics() {
	canClose.value = false;
	remainingTime.value = 10;

	const result = await diagnostics.runDiagnostics({
		wsUrl: props.wsUrl,
		protocol: props.protocol,
	});

	// If connection succeeded, emit success and don't show modal
	if (result.webSocket.success) {
		console.log("[ConnectionDiagnostic] Connection successful, emitting success");
		emit("connectionSuccess");
		showModal.value = false;
	} else {
		// Connection failed, show modal with diagnostics
		console.log("[ConnectionDiagnostic] Connection failed, showing diagnostic modal");
		emit("connectionFailed");
		showModal.value = true;
		startCountdown();
	}
}

function startCountdown() {
	if (countdownTimer) {
		clearInterval(countdownTimer);
	}

	countdownTimer = setInterval(() => {
		remainingTime.value--;
		if (remainingTime.value <= 0) {
			if (countdownTimer) {
				clearInterval(countdownTimer);
			}
			canClose.value = true;
		}
	}, 1000);
}

function handleRetry() {
	console.log("[ConnectionDiagnostic] Retrying connection...");
	showModal.value = false; // Hide modal temporarily
	runDiagnostics();
}

function handleClose() {
	if (countdownTimer) {
		clearInterval(countdownTimer);
	}
	showModal.value = false;
}

// Auto-run diagnostics on mount
onMounted(() => {
	console.log("[ConnectionDiagnostic] Component mounted, running diagnostics...");
	console.log(props.wsUrl);
	runDiagnostics();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.animate-in {
	animation: zoom-in 0.2s ease-out;
}

@keyframes zoom-in {
	from {
		opacity: 0;
		transform: scale(0.95);
	}

	to {
		opacity: 1;
		transform: scale(1);
	}
}
</style>
