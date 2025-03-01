<template>
	<div v-if="activePrompt" class="prompt-container">
		<div class="prompt-window">
			<div class="prompt-header">
				<div class="prompt-timer">{{ formatTime(timeRemaining) }}</div>
			</div>
			<div class="prompt-content">
				<p>{{ activePrompt.message }}</p>
			</div>
			<div class="prompt-actions">
				<Button primary @click="handleChoice(true)">Confirm</Button>
				<Button text @click="handleChoice(false)">Decline</Button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import useUtils from "../../common/composables/useUtils";
import { useRxjs } from "topsyde-utils";
import { Button } from "primevue";
export type PromptChoice = boolean | number;
export interface I_PromptPayload {
	time: number;
	message: string;
	callback: (choice: PromptChoice, data: any) => void;
}

const utils = useUtils();

const rxjs = useRxjs("prompt", {
	prompt: (payload: I_PromptPayload) => {
		console.log("here", payload);
		activePrompt.value = payload;
		startTimer(payload.time);
	},
});

const activePrompt = ref<I_PromptPayload | null>(null);
const timeRemaining = ref(0);
let timerInterval: number | null = null;

// Format time as MM:SS
const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Handle user choice
const handleChoice = (choice: PromptChoice) => {
	if (!activePrompt.value) return;

	// Clear timer
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}

	// Call callback with choice
	activePrompt.value.callback(choice, activePrompt.value);
	activePrompt.value = null;
};

// Start timer
const startTimer = (seconds: number) => {
	timeRemaining.value = seconds;

	if (timerInterval) {
		clearInterval(timerInterval);
	}

	timerInterval = window.setInterval(() => {
		if (timeRemaining.value <= 0) {
			// Time's up, auto-decline
			handleChoice(false);
			return;
		}
		timeRemaining.value--;
	}, 1000);
};

// Handle prompt request

onMounted(() => {
	utils.lib.Log("Prompt component mounted");
	//call self
	rxjs.$next("prompt", {
		time: 10,
		message: "Test prompt",
		callback: (choice: PromptChoice, data: any) => {
			utils.lib.Log("Prompt choice", choice, data);
		},
	});
});

// Clean up on unmount
onUnmounted(() => {
	if (timerInterval) {
		clearInterval(timerInterval);
	}
});
</script>

<style scoped>
.prompt-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	background-color: rgba(0, 0, 0, 0.5);
}

.prompt-window {
	background-color: #1e1e1e;
	border-radius: 8px;
	width: 400px;
	max-width: 90%;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	overflow: hidden;
}

.prompt-header {
	padding: 12px 16px;
	background-color: #2a2a2a;
	display: flex;
	justify-content: flex-end;
}

.prompt-timer {
	font-family: monospace;
	font-size: 1.2rem;
	color: #f0f0f0;
}

.prompt-content {
	padding: 20px 16px;
	color: #f0f0f0;
}

.prompt-actions {
	display: flex;
	padding: 16px;
	gap: 12px;
	justify-content: flex-end;
	border-top: 1px solid #3a3a3a;
}

.prompt-button {
	padding: 8px 16px;
	border-radius: 4px;
	border: none;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;
}

.prompt-button.confirm {
	background-color: #4caf50;
	color: white;
}

.prompt-button.confirm:hover {
	background-color: #3d8b40;
}

.prompt-button.decline {
	background-color: #f44336;
	color: white;
}

.prompt-button.decline:hover {
	background-color: #d32f2f;
}

@media (max-width: 430px) {
	.prompt-window {
		width: 100%;
		max-width: 100%;
		border-radius: 0;
		position: fixed;
		bottom: 0;
		top: auto;
	}
}
</style>
