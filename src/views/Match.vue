<template>
	<div class="match">
		<div class="viewport" :class="{ opaque: inLobby, background: inMatch }">
			<div class="content">
				<div class="flex gap large wrap match-card-wrapper" v-if="inLobby">
					<div v-for="card in matchCards" :key="card.type" class="match-card-wrapper-outer">
						<span v-if="card.wip" class="wip-badge">WIP</span>
						<Card v-ripple :class="['match-card', card.type, { disabled: card.disabled || card.loading, loading: card.loading }]" @click="!card.disabled && !card.loading && handleMatchType(card)">
							<template #header>
								<div class="card-header-container">
									<img :alt="`${card.type} header`" class="card-image" :src="`${IMAGE_URL}match.webp`" />
									<div v-if="card.loading" class="loading-overlay">
										<ProgressSpinner size="large" stroke-width="3" />
										<p>Starting match...</p>
									</div>
								</div>
							</template>
							<template #title>
								<span class="text-center flex">{{ card.title }}</span>
							</template>
							<template #subtitle>
								<span class="text-center flex">{{ card.subtitle }}</span>
							</template>
							<template #content>
								<p class="flex text-center">{{ card.content }}</p>
							</template>
						</Card>
					</div>
				</div>
				<!-- Game Interface - Unified for PVE and PVP -->
				<div v-if="inMatch" class="game-interface">
					<!-- Game Header -->
					<div class="game-header">
						<div class="match-info">
							<span class="match-type">{{ getMatchTypeLabel() }}</span>
							<span class="match-id">Match: {{ match$.matchStore.currentMatchId || 'Unknown' }}</span>
						</div>
					</div>

					<!-- Player vs Enemy Display -->
					<div class="battle-area">
						<!-- Player Section -->
						<div class="player-section">
							<div class="player-card">
								<div class="player-avatar">
									<i class="pi pi-user" style="font-size: 2rem; color: var(--p-primary-color);"></i>
								</div>
								<div class="player-info">
									<h3>You</h3>
									<div class="health-bar">
										<div class="health-fill" :style="{ width: '100%' }"></div>
										<span class="health-text">100 / 100</span>
									</div>
								</div>
								<div class="turn-indicator" :class="{ active: isPlayerTurn }">
									<span v-if="isPlayerTurn">Your Turn</span>
								</div>
							</div>
						</div>

						<!-- VS Divider -->
						<div class="vs-divider">
							<span class="vs-text">VS</span>
						</div>

						<!-- Enemy Section -->
						<div class="enemy-section">
							<div class="enemy-card">
								<div class="enemy-avatar">
									<i class="pi pi-android" style="font-size: 2rem; color: var(--p-orange-500);"></i>
								</div>
								<div class="enemy-info">
									<h3>{{ getEnemyName() }}</h3>
									<div class="health-bar">
										<div class="health-fill enemy" :style="{ width: '100%' }"></div>
										<span class="health-text">100 / 100</span>
									</div>
								</div>
								<div class="turn-indicator" :class="{ active: isEnemyTurn }">
									<span v-if="isEnemyTurn">{{ getEnemyName() }}'s Turn</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Game Actions -->
					<div class="game-actions">
						<div class="action-panel">
							<h4>Actions</h4>
							<div class="actions-grid">
								<Button 
									:disabled="!isPlayerTurn || isProcessingAction" 
									@click="performAttack"
									severity="danger"
									size="large"
									class="attack-button"
								>
									<i class="pi pi-bolt"></i>
									Attack
								</Button>
							</div>
						</div>
					</div>

					<!-- Game Log -->
					<div class="game-log">
						<h4>Combat Log</h4>
						<div class="log-entries">
							<div v-for="(entry, index) in gameLog" :key="index" class="log-entry" :class="entry.type">
								<span class="log-timestamp">{{ formatTime(entry.timestamp) }}</span>
								<span class="log-message">{{ entry.message }}</span>
							</div>
							<div v-if="gameLog.length === 0" class="log-entry system">
								<span class="log-message">Match started! Waiting for first turn...</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Card } from "primevue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";
import useMatch from "../common/composables/useMatch";
import useUtils from "../common/composables/useUtils";
import { MatchCard, MatchType } from "../common/types/match.types";

const utils = useUtils();

const match$ = useMatch();
const { inLobby, inMatch } = match$;

// Game state for unified interface
const isPlayerTurn = ref(true); // Start with player turn
const isEnemyTurn = ref(false);
const isProcessingAction = ref(false);
const gameLog = ref<Array<{ type: string; message: string; timestamp: Date }>>([]);
const currentMatchType = ref<MatchType | null>(null);

// Generic loading state for match initiation

const IMAGE_URL = import.meta.env.BASE_URL;
const matchCards = ref<MatchCard[]>([
	{
		type: "pvp",
		title: "Player versus Player",
		subtitle: "Challenge other players to a duel",
		content: "Test your skills against other players in real-time combat using your runeabilities.",
		wip: true,
		disabled: true,
		loading: false,
	},
	{
		type: "pve",
		title: "Player versus Environment",
		subtitle: "Challenge the environment",
		content: "Face off against AI-controlled opponents and test your strategies.",
		wip: false,
		disabled: false,
		loading: false,
	},
]);

// Set CSS variable for background image
document.documentElement.style.setProperty("--match-bg-url", `url(${IMAGE_URL}match.webp)`);

async function handleMatchType(card: MatchCard) {
	// Handle match type selection
	console.log(`Selected match type: ${card.type}`);
	if (card.type === "pve") await handlePVEMatch(card);
	else await handlePVPMatch(card);
}

async function handlePVEMatch(card: MatchCard) {
	if (card.loading) return; // Prevent multiple requests

	try {
		card.loading = true;
		setCardProperty("pvp", "disabled", true);
		if (inMatch.value) {
			utils.toast.error("You are already in a match", "center");
			return;
		}

		const response = await match$.pve();
		console.log("PVE match created:", response);
		
		// Initialize game state for PVE match
		currentMatchType.value = "pve";
		initializeGameState();
		
	} catch (e) {
		console.error("PVE match error:", e);
		utils.toast.error("Something went wrong", "top-left");
	} finally {
		setCardProperty("pvp", "disabled", true); // FIXME: When implementing PVP, this should be set to false
		card.loading = false;
	}
}

/**
 * Initialize game state for a new match
 */
function initializeGameState() {
	isPlayerTurn.value = true;
	isEnemyTurn.value = false;
	isProcessingAction.value = false;
	gameLog.value = [];
	
	// Add initial log entry
	addLogEntry("system", "Match started! It's your turn.");
}

/**
 * Get match type label for display
 */
function getMatchTypeLabel(): string {
	if (!currentMatchType.value) return "Unknown Match";
	return currentMatchType.value === "pve" ? "Player vs AI" : "Player vs Player";
}

/**
 * Get enemy name based on match type
 */
function getEnemyName(): string {
	if (!currentMatchType.value) return "Enemy";
	return currentMatchType.value === "pve" ? "AI Opponent" : "Enemy Player";
}

/**
 * Handle attack action
 */
async function performAttack() {
	if (!isPlayerTurn.value || isProcessingAction.value) return;
	
	try {
		isProcessingAction.value = true;
		
		// Add player action to log
		addLogEntry("player", "You performed an attack!");
		
		// Switch turns
		switchToEnemyTurn();
		
		// Simulate enemy response (for now)
		if (currentMatchType.value === "pve") {
			setTimeout(() => {
				simulateEnemyAction();
			}, 1000); // 1 second delay for enemy response
		}
		
	} catch (error) {
		console.error("Attack failed:", error);
		utils.toast.error("Attack failed", "top-right");
	} finally {
		isProcessingAction.value = false;
	}
}

/**
 * Switch to enemy turn
 */
function switchToEnemyTurn() {
	isPlayerTurn.value = false;
	isEnemyTurn.value = true;
	addLogEntry("system", `${getEnemyName()}'s turn...`);
}

/**
 * Switch to player turn
 */
function switchToPlayerTurn() {
	isPlayerTurn.value = true;
	isEnemyTurn.value = false;
	addLogEntry("system", "Your turn!");
}

/**
 * Simulate enemy action (for PVE matches until backend is ready)
 */
function simulateEnemyAction() {
	addLogEntry("enemy", `${getEnemyName()} performed an attack!`);
	
	// Switch back to player turn
	setTimeout(() => {
		switchToPlayerTurn();
	}, 1000);
}

/**
 * Add entry to game log
 */
function addLogEntry(type: string, message: string) {
	gameLog.value.push({
		type,
		message,
		timestamp: new Date()
	});
	
	// Keep log manageable (last 50 entries)
	if (gameLog.value.length > 50) {
		gameLog.value = gameLog.value.slice(-50);
	}
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: Date): string {
	return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function handlePVPMatch(card: MatchCard) {
	card.loading = true;
	setCardProperty("pve", "disabled", true);
	card.disabled = true;
	setCardProperty("pve", "disabled", false);
}

function setCardProperty<K extends keyof MatchCard>(type: MatchType, property: K, value: any) {
	const card: MatchCard | undefined = matchCards.value.find((c) => c.type === type);
	if (card) card[property] = value;
}
</script>

<style lang="scss" scoped>
@use "../assets/css/common.scss" as *;
@use "../assets/css/variables.scss" as *;

.match {
	background-image: var(--match-bg-url);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;

	display: flex;
	justify-content: center;
	align-items: center;
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
		height: 92%;
		width: 96%;
		padding: 1%;
		border-radius: var(--p-border-radius-lg);
		margin: 0;

		&.opaque {
			background-color: var-to-rgba(--p-content-background, 0.5);
		}

		&.background {
			background-color: var(--p-content-background);
		}

		box-shadow:
			0 6px 12px var-to-rgba(--p-content-background, 0.5),
			0 8px 24px var-to-rgba(--p-content-background, 0.5);
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
	overflow-y: auto;
}

.match-card-wrapper {
	width: 100%;
	justify-content: center;
	height: 100%;
}

.match-card-wrapper-outer {
	position: relative;
	display: inline-block;
}

.match-card {
	width: 35rem;
	height: 450px;
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

	&.disabled {
		pointer-events: none;
		opacity: 0.6;
		filter: grayscale(0.2);
		cursor: not-allowed;

		.wip-badge {
			opacity: 1 !important;
			filter: none !important;
		}
	}

	.card-header-container {
		position: relative;
	}

	&.loading {
		opacity: 0.8;
		pointer-events: none;
	}
}

.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var-to-rgba(--p-content-background, 0.9);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: var(--p-card-border-radius);
	z-index: 5;

	p {
		margin-top: 1rem;
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--p-text-color);
	}
}

/* Game Interface Styles */
.game-interface {
	display: flex;
	flex-direction: column;
	gap: $viewSpacing;
	padding: $viewSpacing;
	height: 100%;
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
}

.game-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: $viewSpacing;
	background: var(--p-content-background);
	border-radius: var(--p-border-radius-lg);
	box-shadow: 0 2px 8px var-to-rgba(--p-surface-900, 0.1);
}

.match-info {
	display: flex;
	gap: calc($viewSpacing * 2);
	align-items: center;
}

.match-type {
	font-size: 1.2rem;
	font-weight: bold;
	color: var(--p-primary-color);
}

.match-id {
	font-size: 0.9rem;
	color: var(--p-text-muted-color);
}

.battle-area {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	gap: calc($viewSpacing * 2);
	align-items: center;
	padding: calc($viewSpacing * 2);
	background: var(--p-content-background);
	border-radius: var(--p-border-radius-lg);
	box-shadow: 0 2px 8px var-to-rgba(--p-surface-900, 0.1);
}

.player-card, .enemy-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: $viewSpacing;
	padding: calc($viewSpacing * 1.5);
	border-radius: var(--p-border-radius-md);
	border: 2px solid transparent;
	transition: border-color 0.3s ease;
}

.player-card {
	border-color: var(--p-primary-color);
}

.enemy-card {
	border-color: var(--p-orange-500);
}

.player-avatar, .enemy-avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--p-surface-100);
	border: 3px solid;
}

.player-avatar {
	border-color: var(--p-primary-color);
}

.enemy-avatar {
	border-color: var(--p-orange-500);
}

.player-info, .enemy-info {
	text-align: center;
}

.player-info h3, .enemy-info h3 {
	margin: 0;
	font-size: 1.1rem;
	font-weight: bold;
}

.health-bar {
	position: relative;
	width: 120px;
	height: 20px;
	background: var(--p-surface-200);
	border-radius: var(--p-border-radius-md);
	overflow: hidden;
	margin: $spacing 0;
}

.health-fill {
	height: 100%;
	background: var(--p-green-500);
	transition: width 0.5s ease;
	border-radius: var(--p-border-radius-md);
}

.health-fill.enemy {
	background: var(--p-orange-500);
}

.health-text {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 0.8rem;
	font-weight: bold;
	color: var(--p-surface-0);
	text-shadow: 1px 1px 2px var-to-rgba(--p-surface-900, 0.7);
}

.turn-indicator {
	padding: $spacing $viewSpacing;
	border-radius: var(--p-border-radius-md);
	font-weight: bold;
	font-size: 0.9rem;
	opacity: 0.3;
	transition: opacity 0.3s ease;
}

.turn-indicator.active {
	opacity: 1;
	background: var(--p-primary-color);
	color: var(--p-primary-contrast-color);
}

.vs-divider {
	display: flex;
	align-items: center;
	justify-content: center;
}

.vs-text {
	font-size: 2rem;
	font-weight: bold;
	color: var(--p-text-muted-color);
	background: var(--p-surface-100);
	padding: $viewSpacing;
	border-radius: 50%;
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.game-actions {
	background: var(--p-content-background);
	border-radius: var(--p-border-radius-lg);
	padding: calc($viewSpacing * 1.5);
	box-shadow: 0 2px 8px var-to-rgba(--p-surface-900, 0.1);
}

.action-panel h4 {
	margin: 0 0 $viewSpacing 0;
	color: var(--p-text-color);
}

.actions-grid {
	display: flex;
	gap: $viewSpacing;
	justify-content: center;
}

.attack-button {
	min-width: 120px;
}

.game-log {
	background: var(--p-content-background);
	border-radius: var(--p-border-radius-lg);
	padding: calc($viewSpacing * 1.5);
	box-shadow: 0 2px 8px var-to-rgba(--p-surface-900, 0.1);
	max-height: 200px;
	overflow-y: auto;
}

.game-log h4 {
	margin: 0 0 $viewSpacing 0;
	color: var(--p-text-color);
}

.log-entries {
	display: flex;
	flex-direction: column;
	gap: $spacing;
}

.log-entry {
	display: flex;
	gap: $spacing;
	padding: $spacing;
	border-radius: var(--p-border-radius-sm);
	font-size: 0.9rem;
}

.log-entry.player {
	background: var(--p-primary-50);
	border-left: 3px solid var(--p-primary-color);
}

.log-entry.enemy {
	background: var(--p-orange-50);
	border-left: 3px solid var(--p-orange-500);
}

.log-entry.system {
	background: var(--p-surface-100);
	border-left: 3px solid var(--p-surface-400);
}

.log-timestamp {
	font-size: 0.8rem;
	color: var(--p-text-muted-color);
	white-space: nowrap;
}

.log-message {
	flex: 1;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
	.battle-area {
		grid-template-columns: 1fr;
		gap: $viewSpacing;
		text-align: center;
	}
	
	.vs-divider {
		order: 1;
	}
	
	.player-section {
		order: 0;
	}
	
	.enemy-section {
		order: 2;
	}
}

.wip-badge {
	position: absolute;
	top: 12px;
	right: 12px;
	background: linear-gradient(90deg, var(--p-primary-color) 0%, var(--p-primary-hover-color) 100%);
	color: var(--p-primary-contrast-color);
	font-weight: bold;
	font-size: 0.95rem;
	padding: 0.35em 1em;
	border-radius: var(--p-card-border-radius, 1em);
	box-shadow:
		0 2px 8px var(--p-content-background, #fff),
		0 2px 8px rgba(0, 0, 0, 0.12);
	z-index: 10;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	pointer-events: none;
	opacity: 1;
	filter: none;
	isolation: isolate;
}
</style>
