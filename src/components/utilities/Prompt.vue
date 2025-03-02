<template>
	<div v-if="activePrompt" class="prompt-container">
		<div class="prompt-window">
			<div class="prompt-header">
				<div class="prompt-timer">{{ formatTime(timeRemaining) }}</div>
				<div v-if="promptQueue.length > 0" class="prompt-queue-indicator">+{{ promptQueue.length }} more</div>
			</div>
			<ProgressBar :value="(timeRemaining / initialTime) * 100" :showValue="false" class="prompt-progress" />
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
import { onMounted, onUnmounted, ref, defineProps } from "vue";
import useUtils from "../../common/composables/useUtils";
import { useRxjs } from "topsyde-utils";
import { Button } from "primevue";
import ProgressBar from "primevue/progressbar";
import usePrompt, { I_PromptPayload } from "../../common/composables/usePrompt";

export type PromptChoice = boolean | number;

const props = defineProps({
	maxQueueSize: {
		type: Number,
		default: 2,
	},
});

const utils = useUtils();

// Queue system
const promptQueue = ref<I_PromptPayload[]>([]);
const activePrompt = ref<I_PromptPayload | null>(null);
const timeRemaining = ref(0);
let timerInterval: number | null = null;
let initialTime = 0;

useRxjs("prompt", {
	prompt: (payload: I_PromptPayload) => {
		addToQueue(payload);
	},
});

// Add prompt to queue and process if needed
const addToQueue = (payload: I_PromptPayload) => {
	// If queue is full, ignore new prompts
	if (promptQueue.value.length >= props.maxQueueSize) {
		utils.lib.Log("Prompt queue is full, ignoring new prompt");
		//TODO: Send websocket/event back to sender
		return;
	}

	// Add to queue
	promptQueue.value.push(payload);

	// If no active prompt, process next
	if (!activePrompt.value) {
		processNextPrompt();
	}
};

// Process next prompt in queue
const processNextPrompt = () => {
	if (promptQueue.value.length === 0) return;

	const nextPrompt = promptQueue.value.shift();
	if (nextPrompt) {
		activePrompt.value = nextPrompt;
		initialTime = nextPrompt.time;
		startTimer(nextPrompt.time);
	}
};

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

	const { callback, ...rest } = activePrompt.value;
	// Call callback with choice
	callback(choice, rest);

	// Clear active prompt
	activePrompt.value = null;

	// Process next prompt if available
	processNextPrompt();
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

function test() {
	utils.lib.Log("Prompt component mounted");
	const prompt$ = usePrompt();
	prompt$.next({
		time: 5,
		message: "Admin would love to battle you",
		from: {
			id: "1",
			name: "admin",
		},
		metadata: {
			type: "battle",
		},
		callback: (choice: PromptChoice, data: any) => {
			utils.lib.Log("Prompt choice 1", choice, data);
		},
	});
}

onMounted(() => {
	test();
});


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
	background-color: var(--p-content-background);
	border-radius: var(--p-content-border-radius);
	width: 400px;
	max-width: 90%;
	box-shadow: var(--p-overlay-navigation-shadow);
	overflow: hidden;
}

.prompt-header {
	padding: 12px 16px;
	background-color: var(--p-navigation-item-active-background);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.prompt-queue-indicator {
	font-size: 0.8rem;
	background-color: var(--p-primary-color);
	color: var(--p-primary-contrast-color);
	padding: 2px 8px;
	border-radius: 12px;
	font-weight: bold;
}

.prompt-progress {
	border-radius: 0;
	height: 4px;
}

.prompt-timer {
	font-family: monospace;
	font-size: 1.2rem;
	color: var(--p-content-color);
}

.prompt-content {
	padding: 20px 16px;
	color: var(--p-content-color);
}

.prompt-actions {
	display: flex;
	padding: 16px;
	gap: 12px;
	justify-content: flex-end;
	border-top: 1px solid var(--p-content-border-color);
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
