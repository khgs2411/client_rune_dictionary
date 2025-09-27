<template>
	<div class="battle-arena">
		<!-- Battle Background with Gradient -->
		<div class="battle-background">
			<div class="gradient-overlay"></div>
			<div class="atmospheric-effects">
				<div v-for="i in 15" :key="i" class="particle" :class="`particle-${i}`"></div>
			</div>
		</div>

		<!-- Turn Indicator with Timer -->
		<div class="turn-indicator" :class="{ 'player-turn': isPlayerTurn, 'enemy-turn': isEnemyTurn }">
			<div class="turn-badge">
				<i class="pi" :class="isPlayerTurn ? 'pi-user' : 'pi-android'"></i>
				<span class="turn-text">
					{{ isPlayerTurn ? "Your Turn" : `${enemyName}'s Turn` }}
				</span>
				<span class="turn-number">Turn {{ displayTurnNumber }}</span>
			</div>

			<!-- ATB Turn Timer -->
			<div class="turn-timer-container">
				<TurnTimer :time-remaining="timerRemaining" :duration="timerDuration" :is-active="timerActive" :size="isMobile ? 'sm' : 'md'" :label="timerLabel" />
			</div>
		</div>

		<!-- Battle Field -->
		<div class="battle-field">
			<!-- Player Card (Left on Desktop, Bottom on Mobile) -->
			<div class="combatant-area player-area">
				<!-- Floating damage/heal numbers -->
				<TransitionGroup name="damage-number">
					<div v-for="number in playerDamageNumbers" :key="number.id" class="damage-number" :class="{ 'heal-number': number.isHeal }">{{ number.isHeal ? "+" : "-" }}{{ Math.abs(number.value) }}</div>
				</TransitionGroup>
				<Card
					class="character-card player-card"
					:class="{ 'taking-damage': playerTakingDamage, healing: playerHealing, breathing: true }"
					:style="{ '--health-percentage': playerHpPercentage, 'animation-delay': playerBreathOffset + 's' }">
					<template #content>
						<div class="character-card-content">
							<div class="character-icon">
								<!-- ATB Progress Ring -->
								<div class="atb-progress-ring" :class="{ 'atb-ready': playerAtbProgress >= 100 }">
									<svg class="atb-svg" viewBox="0 0 120 120">
										<circle class="atb-bg" cx="60" cy="60" r="54" />
										<circle class="atb-fill" cx="60" cy="60" r="54" :style="{ '--atb-progress': playerAtbProgress }" />
									</svg>
								</div>
								<i class="pi pi-user"></i>
							</div>

							<div class="character-details">
								<div class="character-header">
									<span class="character-name">{{ playerName }}</span>
									<span class="character-level">Lv{{ playerLevel }}</span>
								</div>
								<div class="hp-container">
									<div class="hp-bar">
										<div class="hp-bar-fill" :style="{ width: playerHpPercentage + '%' }" :class="[getHpColorClass(playerHpPercentage), { healing: playerHealing }]"></div>
									</div>
									<div class="hp-text">{{ playerHealth }}/{{ playerMaxHealth }} HP</div>
								</div>
							</div>
						</div>
					</template>
				</Card>
			</div>

			<!-- Enemy Card (Right on Desktop, Top on Mobile) -->
			<div class="combatant-area enemy-area">
				<!-- Floating damage/heal numbers -->
				<TransitionGroup name="damage-number">
					<div v-for="number in enemyDamageNumbers" :key="number.id" class="damage-number" :class="{ 'heal-number': number.isHeal }">{{ number.isHeal ? "+" : "-" }}{{ Math.abs(number.value) }}</div>
				</TransitionGroup>
				<Card
					class="character-card enemy-card"
					:class="{ 'taking-damage': enemyTakingDamage, healing: enemyHealing, breathing: true }"
					:style="{ '--health-percentage': enemyHpPercentage, 'animation-delay': enemyBreathOffset + 's' }">
					<template #content>
						<div class="character-card-content">
							<div class="character-icon">
								<!-- ATB Progress Ring -->
								<div class="atb-progress-ring" :class="{ 'atb-ready': enemyAtbProgress >= 100 }">
									<svg class="atb-svg" viewBox="0 0 120 120">
										<circle class="atb-bg" cx="60" cy="60" r="54" />
										<circle class="atb-fill" cx="60" cy="60" r="54" :style="{ '--atb-progress': enemyAtbProgress }" />
									</svg>
								</div>
								<i class="pi pi-android"></i>
							</div>
							<div class="character-details">
								<div class="character-header">
									<span class="character-name">{{ enemyName }}</span>
									<span class="character-level">Lv{{ enemyLevel }}</span>
								</div>
								<div class="hp-container">
									<div class="hp-bar">
										<div class="hp-bar-fill" :style="{ width: enemyHpPercentage + '%' }" :class="[getHpColorClass(enemyHpPercentage), { healing: enemyHealing }]"></div>
									</div>
									<div class="hp-text">{{ enemyHealth }}/{{ enemyMaxHealth }} HP</div>
								</div>
							</div>
						</div>
					</template>
				</Card>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Card from "primevue/card";
import { computed, ref, watch } from "vue";
import TurnTimer from "./TurnTimer.vue";

interface Props {
	playerName?: string;
	playerHealth: number;
	playerMaxHealth: number;
	playerLevel?: number;
	enemyName: string;
	enemyHealth: number;
	enemyMaxHealth: number;
	enemyLevel?: number;
	isPlayerTurn: boolean;
	isEnemyTurn: boolean;
	isProcessingAction: boolean;
	currentTurn?: number;
	// Timer props
	timerRemaining?: number;
	timerDuration?: number;
	timerActive?: boolean;
	// ATB props
	playerAtbProgress?: number;
	enemyAtbProgress?: number;
}

const props = withDefaults(defineProps<Props>(), {
	playerName: "You",
	playerLevel: 50,
	enemyLevel: 48,
	currentTurn: 1,
	// Timer defaults
	timerRemaining: 5000,
	timerDuration: 5000,
	timerActive: false,
	// ATB defaults
	playerAtbProgress: 0,
	enemyAtbProgress: 0,
});

// No emits needed anymore - moved to GameActions component

const playerHpPercentage = computed(() => {
	return Math.max(0, Math.min(100, (props.playerHealth / props.playerMaxHealth) * 100));
});

const enemyHpPercentage = computed(() => {
	return Math.max(0, Math.min(100, (props.enemyHealth / props.enemyMaxHealth) * 100));
});

function getHpColorClass(percentage: number): string {
	if (percentage > 50) return "hp-green";
	if (percentage > 25) return "hp-yellow";
	return "hp-red";
}

// Track turn number internally
const turnNumber = ref(1);
let lastTurnState = props.isPlayerTurn;

// Watch for turn changes to increment turn number
watch(
	() => props.isPlayerTurn,
	(newVal) => {
		// If turn changed from enemy to player, increment turn number
		if (newVal && !lastTurnState) {
			turnNumber.value++;
		}
		lastTurnState = newVal;
	},
);

// Use computed to ensure reactivity
const displayTurnNumber = computed(() => turnNumber.value);

// Mobile detection
const isMobile = ref(window.innerWidth <= 768);
window.addEventListener("resize", () => {
	isMobile.value = window.innerWidth <= 768;
});

// Timer computed properties
const timerLabel = computed(() => {
	if (!props.timerActive) return "";
	if (props.timerRemaining <= 1000) return "Now!";
	if (props.isProcessingAction) return "Wait";
	return "";
});

// Damage animation states
const playerTakingDamage = ref(false);
const enemyTakingDamage = ref(false);

// Healing animation states
const playerHealing = ref(false);
const enemyHealing = ref(false);

// Damage numbers tracking
interface DamageNumber {
	id: number;
	value: number;
	isHeal: boolean;
}

const playerDamageNumbers = ref<DamageNumber[]>([]);
const enemyDamageNumbers = ref<DamageNumber[]>([]);
let damageNumberId = 0;

// Random offsets for breathing animation (between -2s and 0s)
const playerBreathOffset = Math.random() * -2;
const enemyBreathOffset = Math.random() * -2;

// Track previous health values for damage/heal detection
let previousPlayerHealth = props.playerHealth;
let previousEnemyHealth = props.enemyHealth;

// Function to show damage/heal numbers
function showDamageNumber(value: number, isPlayer: boolean) {
	const number: DamageNumber = {
		id: damageNumberId++,
		value: value,
		isHeal: value > 0,
	};

	if (isPlayer) {
		playerDamageNumbers.value.push(number);
		// Remove after animation completes
		setTimeout(() => {
			playerDamageNumbers.value = playerDamageNumbers.value.filter((n) => n.id !== number.id);
		}, 1500);
	} else {
		enemyDamageNumbers.value.push(number);
		setTimeout(() => {
			enemyDamageNumbers.value = enemyDamageNumbers.value.filter((n) => n.id !== number.id);
		}, 1500);
	}
}

// Watch for health changes to trigger damage/heal animations
watch(
	() => props.playerHealth,
	(newHealth) => {
		const healthDiff = newHealth - previousPlayerHealth;
		if (healthDiff !== 0) {
			showDamageNumber(healthDiff, true);

			if (newHealth < previousPlayerHealth) {
				// Taking damage
				playerTakingDamage.value = true;
				setTimeout(() => {
					playerTakingDamage.value = false;
				}, 600); // Animation duration
			} else if (newHealth > previousPlayerHealth) {
				// Healing
				playerHealing.value = true;
				setTimeout(() => {
					playerHealing.value = false;
				}, 600); // Animation duration
			}
		}
		previousPlayerHealth = newHealth;
	},
);

watch(
	() => props.enemyHealth,
	(newHealth) => {
		const healthDiff = newHealth - previousEnemyHealth;
		if (healthDiff !== 0) {
			showDamageNumber(healthDiff, false);

			if (newHealth < previousEnemyHealth) {
				// Taking damage
				enemyTakingDamage.value = true;
				setTimeout(() => {
					enemyTakingDamage.value = false;
				}, 600); // Animation duration
			} else if (newHealth > previousEnemyHealth) {
				// Healing
				enemyHealing.value = true;
				setTimeout(() => {
					enemyHealing.value = false;
				}, 600); // Animation duration
			}
		}
		previousEnemyHealth = newHealth;
	},
);
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/_breakpoints" as *;
@use "sass:math";

.battle-arena {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 600px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

// Background and Effects
.battle-background {
	position: absolute;
	inset: 0;
	z-index: 0;

	.gradient-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--p-primary-color) 20%, var(--p-surface-100)) 0%,
			color-mix(in srgb, var(--p-primary-color) 30%, var(--p-surface-200)) 50%,
			color-mix(in srgb, var(--p-primary-color) 40%, var(--p-surface-300)) 100%
		);
		opacity: 0.9;
	}

	.atmospheric-effects {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
}

// Particles for atmosphere
@for $i from 1 through 15 {
	.particle-#{$i} {
		position: absolute;
		width: #{math.random(4) + 2}px;
		height: #{math.random(4) + 2}px;
		background: color-mix(in srgb, var(--p-primary-color) 60%, transparent);
		border-radius: 50%;
		left: math.random(100) * 1%;
		top: math.random(100) * 1%;
		animation: float-particle #{math.random(20) + 20}s linear infinite;
		animation-delay: #{math.random(10)}s;
	}
}

@keyframes float-particle {
	from {
		transform: translateY(0) translateX(0);
		opacity: 0;
	}
	10% {
		opacity: 0.6;
	}
	90% {
		opacity: 0.6;
	}
	to {
		transform: translateY(-100vh) translateX(#{math.random(50) - 25}px);
		opacity: 0;
	}
}

// Turn Indicator
.turn-indicator {
	position: absolute;
	top: 20px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 10;
	transition: all 0.3s ease;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;

	.turn-badge {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 24px;
		background: var(--p-content-background);
		color: var(--p-text-color);
		border-radius: 9999px;
		font-size: 1rem;
		font-weight: 600;
		border: 1px solid var(--p-surface-border);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.05),
			0 4px 8px rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;

		// Icon styling
		i {
			font-size: 1.1rem;
			opacity: 0.9;
		}

		// Main turn text
		.turn-text {
			font-weight: 600;
			letter-spacing: 0.025em;
		}

		// Turn number
		.turn-number {
			font-size: 0.85rem;
			opacity: 0.7;
			font-weight: 500;
			padding-left: 12px;
			border-left: 1px solid var(--p-surface-border);
			margin-left: 4px;
		}
	}

	// Player turn styling
	&.player-turn {
		.turn-badge {
			background: var(--p-content-background);
			border-color: var(--p-primary-200);
			box-shadow:
				0 0 0 3px color-mix(in srgb, var(--p-primary-color) 10%, transparent),
				0 2px 4px rgba(0, 0, 0, 0.05),
				0 4px 8px rgba(0, 0, 0, 0.1);

			i {
				color: var(--p-primary-color);
			}

			.turn-text {
				color: var(--p-primary-700);
			}
		}
	}

	// Enemy turn styling
	&.enemy-turn {
		.turn-badge {
			background: var(--p-content-background);
			border-color: var(--p-orange-200);
			box-shadow:
				0 0 0 3px color-mix(in srgb, var(--p-orange-500) 10%, transparent),
				0 2px 4px rgba(0, 0, 0, 0.05),
				0 4px 8px rgba(0, 0, 0, 0.1);

			i {
				color: var(--p-orange-500);
			}

			.turn-text {
				color: var(--p-orange-700);
			}
		}
	}
}

// Battle Field
.battle-field {
	flex: 1;
	position: relative;
	z-index: 1;
	display: grid;
	grid-template-columns: 1fr 1fr;
	padding: 80px 40px 180px; // Increased bottom padding to account for GameActions
	gap: 20px;
	align-items: center;
	justify-items: center;

	@include breakpoint-down("lg") {
		gap: 15px;
		padding: 80px 30px 180px; // Increased bottom padding
	}

	@include breakpoint-down("md") {
		padding: 60px 20px 160px; // Increased bottom padding
		gap: 20px;
		align-items: center;
	}

	// Smaller screens with limited height
	@media (max-height: 800px) and (min-width: 576px) {
		padding-top: 60px;
		padding-bottom: 140px; // Reduced bottom padding for smaller screens
		gap: 15px;
	}
}

// Damage/Heal Numbers
.damage-number {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 2.5rem;
	font-weight: 900;
	color: var(--destructive);
	text-shadow:
		2px 2px 0 rgba(0, 0, 0, 0.5),
		-1px -1px 0 rgba(0, 0, 0, 0.5),
		1px -1px 0 rgba(0, 0, 0, 0.5),
		-1px 1px 0 rgba(0, 0, 0, 0.5);
	pointer-events: none;
	z-index: 100;

	&.heal-number {
		color: var(--primary);
	}
}

// Damage number animation transitions
.damage-number-enter-active {
	transition: all 1.5s ease-out;
}

.damage-number-leave-active {
	transition: all 0.3s ease-out;
}

.damage-number-enter-from {
	opacity: 0;
	transform: translate(-50%, -30%);
}

.damage-number-enter-to {
	opacity: 1;
	transform: translate(-50%, -100%);
}

.damage-number-leave-to {
	opacity: 0;
	transform: translate(-50%, -120%);
}

// Combatant Areas
.combatant-area {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;

	// Desktop diagonal positioning
	@include breakpoint-up("md") {
		&.player-area {
			align-self: flex-end;
			padding-bottom: 90px;
			.character-card {
				transform: translateX(-10px);
			}
		}

		&.enemy-area {
			align-self: flex-start;
			padding-top: 90px;
			.character-card {
				transform: translateX(10px);
			}
		}
	}

	// Tablet specific - ensure cards stay within viewport
	@media (min-width: 768px) and (max-width: 1024px) {
		&.player-area {
			padding-bottom: 20px; // Reduced to bring cards closer
			.character-card {
				transform: none;
			}
		}

		&.enemy-area {
			padding-top: 20px; // Reduced to bring cards closer
			.character-card {
				transform: none;
			}
		}
	}

	// Smaller screens (between mobile and desktop) - prevent cutoff
	@media (min-width: 576px) and (max-width: 1024px) and (max-height: 800px) {
		&.player-area {
			padding-bottom: 10px;
			align-self: center;
		}

		&.enemy-area {
			padding-top: 10px;
			align-self: center;
		}
	}
}

// Character Cards
.character-card {
	background: var(--p-content-background);
	border: 2px solid var(--p-surface-border);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	width: 400px;
	max-width: 100%;
	backdrop-filter: none;
	opacity: 1;

	// Tablet specific sizing
	@media (min-width: 768px) and (max-width: 1024px) {
		width: 350px;
	}

	:deep(.p-card) {
		background: transparent;
		box-shadow: none;
		border: none;
	}

	:deep(.p-card-content) {
		padding: 1.5rem;
		background: transparent;
	}

	&.player-card {
		animation: slideInLeft 0.6s ease-out;
	}

	&.enemy-card {
		animation: slideInRight 0.6s ease-out;
	}

	// Breathing/floating animation - speed based on health
	&.breathing {
		animation: breathe var(--breath-duration, 1s) ease-in-out infinite;
		// Very fast at full health (1s), current speed at 50% (2s), very slow at low health
		--breath-duration: calc(1s + (100 - var(--health-percentage)) * 0.02s);
	}

	// Damage animation
	&.taking-damage {
		animation: takeDamage 0.6s ease-out !important;

		&::before {
			content: "";
			position: absolute;
			inset: -2px;
			background: oklch(from var(--destructive) l c h / 0.4);
			border-radius: inherit;
			pointer-events: none;
			animation: damageFlash 0.6s ease-out;
			z-index: 1;
		}
	}

	// Healing animation - green glow
	&.healing {
		&::after {
			content: "";
			position: absolute;
			inset: -4px;
			background: radial-gradient(ellipse at center, oklch(from var(--primary) l c h / 0.4) 0%, transparent 70%);
			border-radius: inherit;
			pointer-events: none;
			animation: healGlow 0.8s ease-out;
			z-index: 1;
		}
	}
}

@keyframes slideInLeft {
	from {
		opacity: 0;
		transform: translateX(-50px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(50px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

// Breathing/floating animation
@keyframes breathe {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}

// Damage shake animation
@keyframes takeDamage {
	0% {
		transform: rotate(0deg) scale(1);
	}
	10% {
		transform: rotate(-5deg) scale(0.95);
	}
	20% {
		transform: rotate(5deg) scale(0.95);
	}
	30% {
		transform: rotate(-3deg) scale(0.97);
	}
	40% {
		transform: rotate(3deg) scale(0.97);
	}
	50% {
		transform: rotate(-2deg) scale(0.98);
	}
	60% {
		transform: rotate(2deg) scale(0.98);
	}
	70% {
		transform: rotate(-1deg) scale(0.99);
	}
	80% {
		transform: rotate(1deg) scale(0.99);
	}
	90%,
	100% {
		transform: rotate(0deg) scale(1);
	}
}

// Damage flash animation
@keyframes damageFlash {
	0% {
		opacity: 0;
	}
	20% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

// Healing glow animation
@keyframes healGlow {
	0% {
		opacity: 0;
		transform: scale(0.8);
	}
	50% {
		opacity: 1;
		transform: scale(1.1);
	}
	100% {
		opacity: 0;
		transform: scale(1.2);
	}
}

.character-card-content {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.character-icon {
	width: 80px;
	height: 80px;
	background: var(--p-content-background);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border: 3px solid var(--p-primary-color);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	position: relative;

	i {
		font-size: 3rem;
		color: var(--p-primary-color);
		opacity: 0.8;
		z-index: 2;
		position: relative;
	}
}

.character-details {
	flex: 1;
	min-width: 0;
}

.character-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
	gap: 1rem;
}

.character-name {
	font-weight: 700;
	font-size: 1.25rem;
	color: var(--p-text-color);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
}

.character-level {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--p-primary-700);
	background: var(--p-primary-100);
	padding: 4px 12px;
	border-radius: 6px;
	white-space: nowrap;
	border: 1px solid var(--p-primary-200);
	flex-shrink: 0;
}

.hp-container {
	width: 100%;
}

.hp-bar {
	position: relative;
	width: 100%;
	height: 24px;
	background: var(--p-surface-300);
	border-radius: 12px;
	overflow: hidden;
	border: 2px solid var(--p-surface-border);
	margin-bottom: 6px;
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

	.hp-bar-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		border-radius: 12px;
		transition:
			width 0.5s ease,
			background-color 0.3s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		position: relative;
		overflow: hidden;

		// Shimmer effect on heal
		&::after {
			content: "";
			position: absolute;
			top: -2px;
			left: -100%;
			width: 100%;
			height: calc(100% + 4px);
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4) 50%, transparent);
			transform: skewX(-20deg);
			transition: left 0.6s ease;
		}

		&.healing::after {
			left: 100%;
		}

		&.hp-green {
			background: linear-gradient(to bottom, var(--p-green-500), var(--p-green-600));
		}

		&.hp-yellow {
			background: linear-gradient(to bottom, var(--p-yellow-500), var(--p-yellow-600));
		}

		&.hp-red {
			background: linear-gradient(to bottom, var(--p-red-500), var(--p-red-600));
			// Pulse animation for critical health
			animation: criticalPulse 1.5s ease-in-out infinite;
		}
	}
}

// Critical health pulse animation
@keyframes criticalPulse {
	0%,
	100% {
		filter: brightness(1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	50% {
		filter: brightness(1.2);
		box-shadow: 0 2px 8px var(--p-red-500);
	}
}

.hp-text {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--p-text-color);
	text-align: right;
}

// Mobile Responsiveness
@include breakpoint-down("sm") {
	.battle-field {
		display: flex;
		flex-direction: column-reverse;
		padding: 60px 10px 200px; // Increased bottom padding for mobile
		gap: 20px;
	}

	.combatant-area {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.character-card {
		width: 100%;
		max-width: 400px;

		:deep(.p-card-content) {
			padding: 1rem;
		}
	}

	.character-icon {
		width: 60px;
		height: 60px;

		i {
			font-size: 2rem;
		}
	}

	.character-name {
		font-size: 1.1rem;
	}

	.character-level {
		font-size: 0.85rem;
		padding: 3px 8px;
	}

	.hp-bar {
		height: 20px;
	}

	.hp-text {
		font-size: 0.85rem;
	}

	.turn-indicator {
		top: 10px;

		.turn-badge {
			padding: 8px 16px;
			font-size: 0.9rem;
			gap: 8px;

			i {
				font-size: 1rem;
			}

			.turn-text {
				font-size: 0.9rem;
			}

			.turn-number {
				font-size: 0.8rem;
				padding-left: 8px;
				margin-left: 2px;
			}
		}
	}

	.action-panel {
		bottom: 10px;
	}
}

// ATB Turn Timer Container
.turn-timer-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	// Remove max-width since timer component now has fixed width

	@include breakpoint-down("md") {
		margin-top: 6px;
	}

	@include breakpoint-down("sm") {
		margin-top: 8px;
	}
}

// ATB Progress Ring Styles
.atb-progress-ring {
	position: absolute;
	top: -6px;
	left: -6px;
	width: calc(100% + 12px);
	height: calc(100% + 12px);
	z-index: 1;
	opacity: 0.9;
	transition: all 0.3s ease;
	pointer-events: none;

	.atb-svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg); // Start from top
	}

	.atb-bg {
		fill: none;
		stroke: color-mix(in srgb, var(--p-primary-color) 20%, transparent);
		stroke-width: 3;
		stroke-linecap: round;
	}

	.atb-fill {
		fill: none;
		stroke: var(--p-orange-400);
		stroke-width: 4;
		stroke-linecap: round;
		stroke-dasharray: 339.3; // 2 * π * 54 (circumference)
		stroke-dashoffset: calc(339.3 - (339.3 * var(--atb-progress) / 100));
		transition:
			stroke-dashoffset 0.2s ease,
			stroke 0.3s ease;
		filter: drop-shadow(0 0 6px color-mix(in srgb, var(--p-primary-color) 50%, transparent));
	}

	// Ready state with pulsing glow
	&.atb-ready {
		animation: atbReadyPulse 1.5s ease-in-out infinite;

		.atb-fill {
			stroke: var(--p-green-400);
			filter: drop-shadow(0 0 12px var(--p-green-400)) drop-shadow(0 0 6px var(--p-green-300));
			animation: atbReadyGlow 1s ease-in-out infinite alternate;
		}

		.atb-bg {
			stroke: color-mix(in srgb, var(--p-green-400) 30%, transparent);
		}
	}
}

// ATB Ready pulse animation
@keyframes atbReadyPulse {
	0%,
	100% {
		transform: scale(1);
		opacity: 0.9;
	}
	50% {
		transform: scale(1.05);
		opacity: 1;
	}
}

// ATB Ready glow animation
@keyframes atbReadyGlow {
	0% {
		filter: drop-shadow(0 0 8px var(--p-green-400)) drop-shadow(0 0 4px var(--p-green-300));
	}
	100% {
		filter: drop-shadow(0 0 16px var(--p-green-400)) drop-shadow(0 0 8px var(--p-green-300)) drop-shadow(0 0 4px var(--p-green-200));
	}
}

// Responsive ATB ring sizing
@include breakpoint-down("sm") {
	.atb-progress-ring {
		top: -4px;
		left: -4px;
		width: calc(100% + 8px);
		height: calc(100% + 8px);

		.atb-bg {
			stroke-width: 2;
		}

		.atb-fill {
			stroke-width: 3;
		}
	}
}
</style>
