<template>
	<div class="match">
		<div class="viewport" :class="{ opaque: inLobby, background: inMatch }">
			<div class="content">
				<MatchLobby v-if="inLobby" :match-cards="matchCards" :image-url="IMAGE_URL" @match-type-selected="handleMatchType" />
				<MatchResult
					v-if="isFinished"
					:match-result="match$.store.matchResult"
					:session-stats="getSessionStats()"
					:is-loading="match$.loading.api || match$.loading.match"
					@rematch="handleRematch"
					@return-to-lobby="handleReturnToLobby" />

				<GameInterface
					v-if="inMatch"
					:match-type-label="getMatchTypeLabel()"
					:match-id="match$.store.currentMatchId"
					:player-name="'You'"
					:enemy-name="getEnemyName()"
					:game-state="match$.store.gameState"
					:is-player-turn="isPlayerTurn"
					:is-enemy-turn="isEnemyTurn"
					:is-processing-action="isProcessingAction"
					:game-log="gameLog"
					@leave-match="handleReturnToLobby"
					@attack="perfornAction('attack')"
					@open-settings="handleOpenSettings"
					@toggle-log="handleToggleLog" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Guards, Rxjs, useRxjs } from "topsyde-utils";
import { onMounted, ref } from "vue";
import useUtils from "../common/composables/useUtils";
import { MatchCard, MatchType } from "../common/types/match.types";
import GameInterface from "../components/match/GameInterface.vue";
import MatchLobby from "../components/match/MatchLobby.vue";
import MatchResult from "../components/match/MatchResult.vue";
import useMatch from "../components/match/useMatch";

// Set CSS variable for background image
const IMAGE_URL = import.meta.env.BASE_URL;
document.documentElement.style.setProperty("--match-bg-url", `url(${IMAGE_URL}match.webp)`);

const utils = useUtils();
const match$ = useMatch();
const { inLobby, inMatch, isFinished } = match$;

// Game state for unified interface
const isPlayerTurn = ref(true); // Start with player turn
const isEnemyTurn = ref(false);
const isProcessingAction = ref(false);
const gameLog = ref<Array<{ type: string; message: string; timestamp: Date }>>([]);
const currentMatchType = ref<MatchType | null>(null);

useRxjs("match", {
	onPlayerTurn: switchToPlayerTurn,
	onEnemyTurn: switchToEnemyTurn,
	onLogEntry: addLogEntry,
});

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

		// Initialize game state and callbacks BEFORE creating the match
		// This ensures callbacks are ready for immediate server events
		currentMatchType.value = "pve";
		initializeGameState();

		const response = await match$.pve();
		console.log("PVE match created:", response);
	} catch (e) {
		console.error("PVE match error:", e);
		utils.toast.error("Something went wrong", "center");
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

	// Set up callbacks for server event integration
	console.log("Set up callbacks for server event integration");

	// Add initial log entry
	addLogEntry({ type: "system", message: "Match started! It's your turn." });
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
 * Handle attack action - Now server authoritative
 */
async function perfornAction(type: string) {
	if (!isPlayerTurn.value || isProcessingAction.value) return;

	try {
		isProcessingAction.value = true;

		// Send attack action to server - server will handle all combat logic
		Rxjs.Next("match", {
			cta: "match.action",
			data: {
				type: "match.action",
				actionType: type,
				matchId: match$.store.currentMatchId,
				channelId: match$.store.currentChannelId,
			},
		});

		/**
		 * Server will respond with:
		 - match.damage.dealt event with damage information
		 - match.health.update event with updated health
		 - match.turn.start/end events for turn management
		 - match.victory event if match ends
		 Frontend just waits for server response
		 */
	} catch (error) {
		console.error("Attack failed:", error);
		utils.toast.error("Attack failed", "center");
		isProcessingAction.value = false;
	}
	// Note: isProcessingAction.value will be set to false when server responds with turn events
}

/**
 * Switch to enemy turn - Now controlled by server events
 */
function switchToEnemyTurn() {
	isPlayerTurn.value = false;
	isEnemyTurn.value = true;
	addLogEntry({ type: "system", message: `${getEnemyName()}'s turn...` });
}

/**
 * Switch to player turn - Now controlled by server events
 */
function switchToPlayerTurn() {
	isPlayerTurn.value = true;
	isEnemyTurn.value = false;
	isProcessingAction.value = false; // Reset processing state when it's player's turn
	addLogEntry({ type: "system", message: "Your turn!" });
}

// Note: Match end is now handled exclusively by server authority
// Victory conditions are determined server-side and broadcast to clients

/**
 * Add entry to game log
 */
function addLogEntry(data: { type: string; message: string }) {
	gameLog.value.unshift({
		type: data.type,
		message: data.message,
		timestamp: new Date(),
	});

	// Keep log manageable (last 50 entries)
	if (gameLog.value.length > 50) {
		gameLog.value = gameLog.value.slice(-50);
	}
}

/**
 *
 * @param card
 */
async function handlePVPMatch(card: MatchCard) {
	card.loading = true;
	setCardProperty("pve", "disabled", true);
	card.disabled = true;
	setCardProperty("pve", "disabled", false);
}

/**
 *
 * @param type
 * @param property
 * @param value
 */
function setCardProperty<K extends keyof MatchCard>(type: MatchType, property: K, value: any) {
	const card: MatchCard | undefined = matchCards.value.find((c) => c.type === type);
	if (card) card[property] = value;
}

/**
 *
 */
function getSessionStats() {
	return match$.getMatchStats();
}

/**
 *
 */
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

function handleOpenSettings() {
	// TODO: Implement settings modal
	console.log("Open settings");
}

function handleToggleLog() {
	// TODO: Implement combat log toggle
	console.log("Toggle combat log");
}

onMounted(() => {
	if (Guards.IsNil(currentMatchType.value)) {
		match$.returnToLobby();
	}
});
</script>

<style lang="scss" scoped>
@use "../assets/css/common.scss" as *;
@use "../assets/css/variables.scss" as *;
@use "../assets/css/styles/mixins/_breakpoints" as *;

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
		height: 100%;
		width: 100%;
		padding: 0;
		border-radius: 0;
		margin: 0 auto;
		box-shadow: none;

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

</style>
