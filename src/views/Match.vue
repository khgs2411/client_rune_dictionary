<template>
	<div class="match">
		<div class="viewport" :class="{ opaque: inLobby, background: inMatch }">
			<div class="content">
				<MatchLobby v-if="inLobby" :match-cards="matchCards" :image-url="IMAGE_URL"
					@match-type-selected="handleMatchType" />
				<MatchResult v-if="isFinished" :match-result="match$.store.matchResult"
					:session-stats="getSessionStats()" :is-loading="match$.loading.api || match$.loading.match"
					@rematch="handleRematch" @return-to-lobby="handleReturnToLobby" />

				<GameInterface v-if="inMatch" :match-type-label="getMatchTypeLabel()"
					:match-id="match$.store.currentMatchId" :enemy-name="getEnemyName()"
					:game-state="match$.store.gameState" :is-player-turn="isPlayerTurn" :is-enemy-turn="isEnemyTurn"
					:is-processing-action="isProcessingAction" :game-log="gameLog" @attack="performAttack"
					@test-victory="triggerMatchEnd('victory')" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Rxjs } from "topsyde-utils";
import { ref } from "vue";
import useUtils from "../common/composables/useUtils";
import { MatchCard, MatchType } from "../common/types/match.types";
import GameInterface from "../components/match/GameInterface.vue";
import MatchLobby from "../components/match/MatchLobby.vue";
import MatchResult from "../components/match/MatchResult.vue";
import useMatch from "../components/match/useMatch";

	const utils = useUtils();

	const match$ = useMatch();
	const { inLobby, inMatch, isFinished } = match$;

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

			// Update action count
			match$.store.gameState.actionsPerformed++;
			const rxjs = Rxjs.GetInstance<Rxjs<'match'>>();

			rxjs.next('match', {
				cta: 'match.action',
				data: {
					type: 'match.action',
					actionType: 'attack',
					matchId: match$.store.currentMatchId, 
					channelId: match$.store.currentChannelId
				}
			});

			// Simulate damage - player deals 15-25 damage to enemy
			const playerDamage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
			match$.store.gameState.enemyHealth -= playerDamage;
			
			if (match$.store.gameState.enemyHealth < 0) {
				match$.store.gameState.enemyHealth = 0;
			}

			// Add player action to log
			addLogEntry("player", `You attack for ${playerDamage} damage! Enemy health: ${match$.store.gameState.enemyHealth}`);

			// Check if enemy is defeated
			if (match$.store.gameState.enemyHealth <= 0) {
				triggerMatchEnd('victory');
				return;
			}

			// Switch turns
			switchToEnemyTurn();

			// Simulate enemy response (for now)
			if (currentMatchType.value === "pve") {
				setTimeout(() => {
					simulateEnemyAction();
				}, 1500); // 1.5 second delay for enemy response
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
		// Simulate damage - enemy deals 10-20 damage to player
		const enemyDamage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
		match$.store.gameState.playerHealth -= enemyDamage;
		if (match$.store.gameState.playerHealth < 0) {
			match$.store.gameState.playerHealth = 0;
		}

		addLogEntry("enemy", `${getEnemyName()} attacks for ${enemyDamage} damage! Your health: ${match$.store.gameState.playerHealth}`);

		// Check if player is defeated
		if (match$.store.gameState.playerHealth <= 0) {
			triggerMatchEnd('defeat');
			return;
		}

		// Switch back to player turn
		setTimeout(() => {
			switchToPlayerTurn();
		}, 1000);
	}

	/**
	 * Trigger match end with specified result
	 */
	function triggerMatchEnd(result: 'victory' | 'defeat' | 'draw' | 'disconnect') {
		addLogEntry("system", `Match ended: ${result.toUpperCase()}!`);

		// Use the enhanced match end handler from useMatch
		const mockData = { result };
		match$.onGameEvent({
			data: { type: 'match.end', ...mockData },
			client: { value: null },
			isValid: true
		} as any);
	}

	/**
	 * Add entry to game log
	 */
	function addLogEntry(type: string, message: string) {
		gameLog.value.unshift({
			type,
			message,
			timestamp: new Date()
		});

		// Keep log manageable (last 50 entries)
		if (gameLog.value.length > 50) {
			gameLog.value = gameLog.value.slice(-50);
		}
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


	function getSessionStats() {
		return match$.getMatchStats();
	}

	async function handleRematch() {
		try {
			await match$.startRematch();
		} catch (error) {
			console.error("Failed to start rematch:", error);
		}
	}

	function handleReturnToLobby() {
		match$.returnToLobby();
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

			box-shadow: 0 6px 12px var-to-rgba(--p-content-background, 0.5),
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
		padding: 0;
	}



	/* Match Result Screen Styles */
	.match-result-screen {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		min-height: 0;
		flex: 1;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
		padding: $spacing;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.result-container {
		background: var(--p-content-background);
		color: var(--p-text-color);
		border-radius: var(--p-border-radius-lg);
		padding: clamp($spacing, 3vw, $viewSpacing * 1.5);
		box-shadow: 0 8px 32px var-to-rgba(--p-surface-900, 0.15);
		width: 100%;
		max-width: 500px;
		text-align: center;
		animation: fadeInUp 0.6s ease-out;
		box-sizing: border-box;
		margin: $spacing 0;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.result-header {
		margin-bottom: $viewSpacing;
	}

	.result-icon {
		width: clamp(50px, 8vw, 70px);
		height: clamp(50px, 8vw, 70px);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto $spacing auto;
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		flex-shrink: 0;

		&.victory {
			background: var(--p-green-100);
			color: var(--p-green-600);
			border: 3px solid var(--p-green-200);
		}

		&.defeat {
			background: var(--p-red-100);
			color: var(--p-red-600);
			border: 3px solid var(--p-red-200);
		}

		&.draw {
			background: var(--p-orange-100);
			color: var(--p-orange-600);
			border: 3px solid var(--p-orange-200);
		}

		&.disconnect {
			background: var(--p-surface-100);
			color: var(--p-surface-600);
			border: 3px solid var(--p-surface-200);
		}
	}

	.result-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: bold;
		margin: 0 0 $spacing 0;
		word-break: break-word;

		.victory & {
			color: var(--p-green-600);
		}

		.defeat & {
			color: var(--p-red-600);
		}

		.draw & {
			color: var(--p-orange-600);
		}
	}

	.result-subtitle {
		font-size: 1.1rem;
		color: var(--p-text-muted-color);
		margin: 0;
	}

	.result-stats {
		background: var(--p-content-background);
		color: var(--p-text-color);
		border: 1px solid var(--p-surface-200);
		border-radius: var(--p-border-radius-md);
		padding: clamp($spacing * 0.75, 2vw, $viewSpacing);
		margin: $spacing 0;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: $spacing 0;
		border-bottom: 1px solid var(--p-surface-200);

		&:last-child {
			border-bottom: none;
		}
	}

	.stat-label {
		font-weight: 500;
		color: var(--p-text-color);
	}

	.stat-value {
		font-weight: bold;
		color: var(--p-primary-color);
	}

	.session-stats {
		margin: $spacing 0;

		h3 {
			margin: 0 0 $spacing 0;
			color: var(--p-text-color);
			font-size: clamp(1rem, 2.5vw, 1.2rem);
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: $spacing;
	}

	.stat-item {
		background: var(--p-content-background);
		color: var(--p-text-color);
		border-radius: var(--p-border-radius-md);
		padding: clamp($spacing, 2vw, $viewSpacing);
		text-align: center;
		border: 1px solid var(--p-surface-200);
	}

	.stat-number {
		display: block;
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--p-primary-color);
		margin-bottom: $spacing;
	}

	.stat-text {
		font-size: 0.9rem;
		color: var(--p-text-muted-color);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.result-actions {
		display: flex;
		gap: $spacing;
		justify-content: center;
		margin-top: $viewSpacing;
	}

	.rematch-button,
	.lobby-button {
		min-width: 140px;

		i {
			margin-right: $spacing;
		}
	}

	/* Responsive Design for Result Screen */
	@media screen and (max-width: 768px) {
		.match-result-screen {
			padding: $spacing;
		}

		.result-container {
			padding: $viewSpacing;
			margin: 0;
		}

		.result-header {
			margin-bottom: $viewSpacing;
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: $spacing;
		}

		.result-actions {
			flex-direction: column;
			gap: $spacing;

			.rematch-button,
			.lobby-button {
				width: 100%;
			}
		}
	}

	@media screen and (max-width: 480px) {
		.match-result-screen {
			padding: calc($spacing / 2);
		}

		.result-container {
			padding: $spacing;
		}

		.stats-grid {
			gap: calc($spacing / 2);
		}
	}
</style>
