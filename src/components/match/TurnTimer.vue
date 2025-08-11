<template>
	<div class="atb-timer" :class="{ 'timer-warning': isWarning, 'timer-critical': isCritical, 'timer-expired': isExpired }">
		<!-- ATB Timer Bar Container -->
		<div class="atb-timer-container">
			<!-- Timer Label -->
			<div class="atb-timer-label">
				<span class="timer-text">{{ displayLabel }}</span>
				<span class="timer-seconds">{{ displaySeconds }}s</span>
			</div>
			
			<!-- ATB Timer Bar -->
			<div class="atb-timer-bar">
				<!-- Background Bar -->
				<div class="atb-timer-background"></div>
				
				<!-- Progress Fill -->
				<div 
					class="atb-timer-fill"
					:style="{ 
						width: fillPercentage + '%',
						backgroundColor: progressColor,
						transition: isAnimating ? 'width 0.333s ease-out, background-color 0.333s ease' : 'none'
					}"
				>
					<!-- Inner Glow Effect -->
					<div class="atb-timer-glow"></div>
					
					<!-- Segmented Lines (ATB Style) -->
					<div class="atb-timer-segments">
						<div v-for="i in 4" :key="i" class="segment-line" :style="{ left: (i * 25) + '%' }"></div>
					</div>
				</div>
				
				<!-- Timer Icon -->
				<div class="atb-timer-icon">
					<i class="pi" :class="timerIcon"></i>
				</div>
				
				<!-- Critical Flash Overlay -->
				<div v-if="isCritical" class="atb-timer-flash"></div>
			</div>
		</div>
		
		<!-- Warning Pulse Background -->
		<div v-if="isWarning || isCritical" class="atb-timer-pulse"></div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { motion } from 'motion-v';
import { colorSystem } from '../../utils/color-system';
import { getCSSVariable, rpgTokens } from '../../utils/theme-utils';

interface Props {
	/** Current time remaining in milliseconds */
	timeRemaining: number;
	/** Total duration in milliseconds (default: 5000) */
	duration?: number;
	/** Show as warning when this percentage is reached (default: 80) */
	warningThreshold?: number;
	/** Show as critical when this percentage is reached (default: 95) */
	criticalThreshold?: number;
	/** Whether timer is actively counting down */
	isActive: boolean;
	/** Timer size variant */
	size?: 'sm' | 'md' | 'lg';
	/** Custom label override */
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	duration: 5000,
	warningThreshold: 80,
	criticalThreshold: 95,
	size: 'md',
});

// Refs
const timerElement = ref<HTMLElement>();

// Computed values for ATB-style depleting bar
const remainingPercentage = computed(() => {
	if (props.duration === 0) return 0;
	return Math.min(100, Math.max(0, (props.timeRemaining / props.duration) * 100));
});

const fillPercentage = computed(() => {
	// Bar depletes from full (100%) to empty (0%) as time runs out
	return remainingPercentage.value;
});

const displaySeconds = computed(() => {
	return Math.ceil(props.timeRemaining / 1000);
});

const displayLabel = computed(() => {
	if (props.label) return props.label;
	if (props.timeRemaining <= 0) return 'ACTION!';
	if (isCritical.value) return 'READY!';
	if (isWarning.value) return 'CHARGING';
	return 'ATB';
});

const isWarning = computed(() => {
	// Warning when 80% of time has elapsed (20% remaining)
	return remainingPercentage.value <= (100 - props.warningThreshold) && !isCritical.value;
});

const isCritical = computed(() => {
	// Critical when 95% of time has elapsed (5% remaining)
	return remainingPercentage.value <= (100 - props.criticalThreshold);
});

const isExpired = computed(() => {
	return props.timeRemaining <= 0;
});

const isAnimating = computed(() => {
	return props.isActive && !isExpired.value;
});

const barHeight = computed(() => {
	switch (props.size) {
		case 'sm': return 12;
		case 'lg': return 20;
		default: return 16;
	}
});

// Dynamic colors based on timer state
const progressColor = computed(() => {
	if (isExpired.value) return colorSystem.getColor('destructive');
	if (isCritical.value) return colorSystem.getColor('destructive');
	if (isWarning.value) return 'oklch(0.769 0.188 70.08)'; // amber
	return colorSystem.getColor('primary');
});

const timerIcon = computed(() => {
	if (isExpired.value) return 'pi-exclamation-triangle';
	if (isCritical.value) return 'pi-clock';
	return 'pi-hourglass';
});

// Animation and effects
watch(isCritical, (newValue) => {
	if (newValue && timerElement.value) {
		// Trigger critical animation
		motion(timerElement.value, {
			scale: [1, 1.05, 1],
			transition: { duration: 0.333, ease: 'easeOut' } // Match WebSocket timing
		});
	}
});

watch(isExpired, (newValue) => {
	if (newValue && timerElement.value) {
		// Trigger completion animation
		motion(timerElement.value, {
			scale: [1, 1.1, 0.95, 1],
			transition: { duration: 0.666, ease: 'backOut' } // 2x 333ms for completion
		});
	}
});

// Pulse effect for critical state
const pulseAnimation = ref<any>();

watch(isCritical, (newValue) => {
	if (newValue && timerElement.value) {
		pulseAnimation.value = motion(timerElement.value, {
			boxShadow: [
				`0 0 0 0 ${colorSystem.getColor('destructive')}40`,
				`0 0 0 20px ${colorSystem.getColor('destructive')}00`,
			],
			transition: {
				duration: 0.999, // 3x 333ms
				repeat: Infinity,
				ease: 'easeOut'
			}
		});
	} else if (pulseAnimation.value) {
		pulseAnimation.value.stop();
	}
});

onMounted(() => {
	// Initial entrance animation
	if (timerElement.value) {
		motion(timerElement.value, {
			scale: [0.8, 1],
			opacity: [0, 1],
			transition: { duration: 0.333, ease: 'backOut' } // Perfect WebSocket sync
		});
	}
});

onUnmounted(() => {
	if (pulseAnimation.value) {
		pulseAnimation.value.stop();
	}
});
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/_breakpoints" as *;

// ATB Timer Container - Fixed width for consistency
.atb-timer {
	position: relative;
	display: block;
	// Fixed width for all screen sizes
	width: 280px; // Default desktop width
	
	// Size variants are now ignored for width, only affect height/font
	&.timer-sm {
		.atb-timer-bar {
			height: 12px;
		}
		.timer-seconds {
			font-size: 0.75rem;
		}
		.timer-text {
			font-size: 0.65rem;
		}
	}
	
	&.timer-lg {
		.atb-timer-bar {
			height: 20px;
		}
		.timer-seconds {
			font-size: 0.9rem;
		}
		.timer-text {
			font-size: 0.8rem;
		}
	}
}

.atb-timer-container {
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center; // Center the fixed-width timer
}

// ATB Timer Label (above bar)
.atb-timer-label {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 4px;
	padding: 0 4px;
}

.timer-text {
	font-size: 0.7rem;
	font-weight: 600;
	color: var(--p-text-color);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	
	.timer-warning & {
		color: oklch(0.769 0.188 70.08); // amber
	}
	
	.timer-critical & {
		color: var(--destructive);
		animation: text-pulse 0.666s ease-in-out infinite; // 2x 333ms
	}
}

.timer-seconds {
	font-size: 0.8rem;
	font-weight: 700;
	color: var(--p-text-muted-color);
	font-variant-numeric: tabular-nums;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	
	.timer-warning & {
		color: oklch(0.769 0.188 70.08); // amber
	}
	
	.timer-critical & {
		color: var(--destructive);
	}
}

// ATB Timer Bar (Main Element)
.atb-timer-bar {
	position: relative;
	width: 100%;
	height: 16px;
	border-radius: 8px;
	overflow: hidden;
	background: linear-gradient(
		to bottom,
		rgba(0, 0, 0, 0.3),
		rgba(0, 0, 0, 0.1)
	);
	border: 2px solid var(--p-content-border-color);
	box-shadow: 
		inset 0 2px 4px rgba(0, 0, 0, 0.3),
		0 2px 4px rgba(0, 0, 0, 0.1);
}

// Background pattern (classic RPG style)
.atb-timer-background {
	position: absolute;
	inset: 0;
	background: 
		linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 50%, transparent 50%, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
		linear-gradient(to bottom, var(--p-surface-300), var(--p-surface-400));
	background-size: 8px 8px, 100% 100%;
	opacity: 0.3;
}

// Progress Fill (Depleting)
.atb-timer-fill {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	background: linear-gradient(
		to bottom,
		var(--p-primary-color),
		oklch(from var(--p-primary-color) calc(l - 0.1) c h)
	);
	border-radius: 6px;
	box-shadow: 
		inset 0 1px 0 rgba(255, 255, 255, 0.3),
		0 0 8px oklch(from var(--p-primary-color) l c h / 0.5);
	overflow: hidden;
	
	// Color transitions
	.timer-warning & {
		background: linear-gradient(
			to bottom,
			oklch(0.769 0.188 70.08),
			oklch(0.669 0.188 70.08)
		);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 0 8px oklch(0.769 0.188 70.08 / 0.6);
	}
	
	.timer-critical & {
		background: linear-gradient(
			to bottom,
			var(--destructive),
			oklch(from var(--destructive) calc(l - 0.1) c h)
		);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 0 12px var(--destructive),
			0 0 24px oklch(from var(--destructive) l c h / 0.3);
		animation: critical-glow 0.999s ease-in-out infinite; // 3x 333ms
	}
}

// Inner glow effect
.atb-timer-glow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(
		to bottom,
		rgba(255, 255, 255, 0.4),
		transparent
	);
	border-radius: 6px 6px 0 0;
}

// Segmented lines (like FF/Chrono Trigger)
.atb-timer-segments {
	position: absolute;
	inset: 0;
	pointer-events: none;
}

.segment-line {
	position: absolute;
	top: 0;
	width: 1px;
	height: 100%;
	background: rgba(0, 0, 0, 0.3);
	box-shadow: 1px 0 0 rgba(255, 255, 255, 0.1);
}

// Timer Icon (right side)
.atb-timer-icon {
	position: absolute;
	right: -2px;
	top: 50%;
	transform: translateY(-50%);
	width: 20px;
	height: 20px;
	background: var(--p-content-background);
	border: 2px solid var(--p-content-border-color);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	
	i {
		font-size: 0.7rem;
		color: var(--p-text-color);
	}
	
	.timer-warning & {
		border-color: oklch(0.769 0.188 70.08);
		box-shadow: 0 0 8px oklch(0.769 0.188 70.08 / 0.5);
		
		i {
			color: oklch(0.769 0.188 70.08);
		}
	}
	
	.timer-critical & {
		border-color: var(--destructive);
		background: var(--destructive);
		box-shadow: 0 0 12px var(--destructive);
		animation: icon-pulse 0.666s ease-in-out infinite; // 2x 333ms
		
		i {
			color: var(--destructive-foreground);
		}
	}
}

// Critical flash overlay
.atb-timer-flash {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		90deg,
		transparent,
		rgba(255, 255, 255, 0.3),
		transparent
	);
	animation: flash-sweep 1.332s ease-in-out infinite; // 4x 333ms
}

// Warning/Critical pulse background
.atb-timer-pulse {
	position: absolute;
	inset: -4px;
	border-radius: 12px;
	background: radial-gradient(
		ellipse,
		var(--p-primary-color) 0%,
		transparent 70%
	);
	opacity: 0.2;
	animation: atb-pulse 1.998s ease-in-out infinite; // 6x 333ms
	z-index: -1;
	
	.timer-warning & {
		background: radial-gradient(
			ellipse,
			oklch(0.769 0.188 70.08) 0%,
			transparent 70%
		);
	}
	
	.timer-critical & {
		background: radial-gradient(
			ellipse,
			var(--destructive) 0%,
			transparent 70%
		);
		animation: atb-pulse 0.999s ease-in-out infinite; // 3x 333ms
	}
}

// Animations
@keyframes critical-glow {
	0%, 100% {
		filter: brightness(1);
	}
	50% {
		filter: brightness(1.2);
	}
}

@keyframes text-pulse {
	0%, 100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.8;
		transform: scale(1.05);
	}
}

@keyframes icon-pulse {
	0%, 100% {
		transform: translateY(-50%) scale(1);
	}
	50% {
		transform: translateY(-50%) scale(1.1);
	}
}

@keyframes flash-sweep {
	0% {
		transform: translateX(-100%);
		opacity: 0;
	}
	50% {
		opacity: 1;
	}
	100% {
		transform: translateX(100%);
		opacity: 0;
	}
}

@keyframes atb-pulse {
	0%, 100% {
		transform: scale(1);
		opacity: 0.2;
	}
	50% {
		transform: scale(1.05);
		opacity: 0.4;
	}
}

// Tablet optimizations (768px - 1023px)
@include breakpoint-between("md", "lg") {
	.atb-timer {
		width: 260px; // Slightly smaller for tablets
	}
}

// Mobile optimizations (below 768px)
@include breakpoint-down("md") {
	.atb-timer {
		width: 240px; // Compact width for mobile
	}
	
	.timer-text,
	.timer-seconds {
		font-size: 0.65rem;
	}
	
	.atb-timer-bar {
		height: 14px;
	}
	
	.atb-timer-icon {
		width: 18px;
		height: 18px;
		
		i {
			font-size: 0.6rem;
		}
	}
}

// Small mobile (below 640px)
@include breakpoint-down("sm") {
	.atb-timer {
		width: 220px; // Even more compact for small phones
	}
	
	.timer-text,
	.timer-seconds {
		font-size: 0.6rem;
	}
	
	.atb-timer-bar {
		height: 12px;
	}
}

// Dark mode enhancements
@media (prefers-color-scheme: dark) {
	.atb-timer-bar {
		border-color: oklch(from var(--p-content-border-color) l c h / 0.5);
		box-shadow: 
			inset 0 2px 4px rgba(0, 0, 0, 0.5),
			0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	.atb-timer-background {
		opacity: 0.2;
	}
	
	.timer-text,
	.timer-seconds {
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
	}
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
	.atb-timer-fill {
		transition: width 0.333s linear !important; // Still sync with WebSocket, but linear
	}
	
	.timer-critical .atb-timer-fill,
	.atb-timer-icon,
	.timer-text,
	.atb-timer-pulse,
	.atb-timer-flash {
		animation: none !important;
	}
}
</style>