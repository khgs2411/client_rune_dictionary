<template>
	<div class="animation-showcase rpg-container">
		<motion.h1 :initial="{ opacity: 0, y: -30 }" :animate="{ opacity: 1, y: 0 }" :transition="headerAnimation" class="showcase-title"> Animation System Showcase </motion.h1>

		<div class="showcase-controls mb-8">
			<div class="control-group">
				<label class="control-label">
					<input type="checkbox" :checked="forcedReducedMotion" @change="toggleReducedMotion" />
					Force Reduced Motion (Testing)
				</label>
				<span class="motion-status" :class="motionClasses">
					{{ isReducedMotion ? "Reduced Motion Active" : "Full Motion Active" }}
				</span>
			</div>
			<div class="performance-stats">
				<div class="stat">
					<span class="stat-label">FPS:</span>
					<span class="stat-value" :class="{ 'stat-warning': currentFps < 30 }">
						{{ currentFps }}
					</span>
				</div>
				<div class="stat">
					<span class="stat-label">Animations:</span>
					<span class="stat-value">{{ performanceStats.totalAnimations }}</span>
				</div>
				<div class="stat">
					<span class="stat-label">Budget Violations:</span>
					<span class="stat-value" :class="{ 'stat-error': performanceStats.budgetViolations > 0 }">
						{{ performanceStats.budgetViolations }}
					</span>
				</div>
			</div>
		</div>

		<div class="showcase-grid">
			<!-- Entrance Animations -->
			<section class="showcase-section">
				<h2 class="section-title">Entrance Animations</h2>
				<div class="demo-grid">
					<motion.div ref="entranceUp.element" :initial="entranceUpPlain.initial" :animate="entranceUpPlain.animate" :transition="(entranceUpPlain.transition as any)" class="demo-card">
						<i class="pi pi-arrow-up demo-icon"></i>
						<span>Slide Up</span>
					</motion.div>

					<motion.div ref="entranceLeft.element" :initial="entranceLeftPlain.initial" :animate="entranceLeftPlain.animate" :transition="(entranceLeftPlain.transition as any)" class="demo-card">
						<i class="pi pi-arrow-left demo-icon"></i>
						<span>Slide Left</span>
					</motion.div>

					<motion.div ref="entranceScale.element" :initial="entranceScalePlain.initial" :animate="entranceScalePlain.animate" :transition="(entranceScalePlain.transition as any)" class="demo-card">
						<i class="pi pi-expand demo-icon"></i>
						<span>Scale</span>
					</motion.div>

					<motion.div ref="entranceFade.element" :initial="entranceFadePlain.initial" :animate="entranceFadePlain.animate" :transition="(entranceFadePlain.transition as any)" class="demo-card">
						<i class="pi pi-eye demo-icon"></i>
						<span>Fade In</span>
					</motion.div>
				</div>
				<Button @click="resetEntranceAnimations" label="Replay Entrance" outlined />
			</section>

			<!-- Hover Animations -->
			<section class="showcase-section">
				<h2 class="section-title">Hover Animations</h2>
				<div class="demo-grid">
					<motion.div
						:initial="{ opacity: 1, scale: 1, y: 0, rotateY: 0 }"
						:animate="toValue(hoverScale.animate)"
						:transition="toValue(hoverScale.transition) as any"
						v-on="hoverScale.handlers"
						class="demo-card interactive">
						<i class="pi pi-expand demo-icon"></i>
						<span>Hover Scale</span>
					</motion.div>

					<motion.div
						:initial="{ opacity: 1, scale: 1, y: 0, rotateY: 0 }"
						:animate="toValue(hoverLift.animate)"
						:transition="toValue(hoverLift.transition) as any"
						v-on="hoverLift.handlers"
						class="demo-card interactive">
						<i class="pi pi-arrow-up demo-icon"></i>
						<span>Hover Lift</span>
					</motion.div>

					<motion.div
						:initial="{ opacity: 1, scale: 1, y: 0, rotateY: 0 }"
						:animate="toValue(hoverRotate.animate)"
						:transition="toValue(hoverRotate.transition) as any"
						v-on="hoverRotate.handlers"
						class="demo-card interactive">
						<i class="pi pi-refresh demo-icon"></i>
						<span>Hover Rotate</span>
					</motion.div>
				</div>
			</section>

			<!-- Stagger Animations -->
			<section class="showcase-section">
				<h2 class="section-title">Stagger Animations</h2>
				<div class="stagger-demo">
					<motion.div
						v-for="(item, index) in staggerItems.items.value || []"
						:key="index"
						:initial="item?.initial || { opacity: 0 }"
						:animate="item?.animate || { opacity: 1 }"
						:transition="(item?.transition || { duration: 0.3 }) as any"
						class="stagger-item">
						{{ index + 1 }}
					</motion.div>
				</div>
				<div class="stagger-controls">
					<Button @click="triggerStagger" label="Trigger Stagger" outlined />
					<Button @click="resetStagger" label="Reset Stagger" text />
				</div>
			</section>

			<!-- Loading Animations -->
			<section class="showcase-section">
				<h2 class="section-title">Loading Animations</h2>
				<div class="loading-demo">
					<motion.div
						:initial="{ scale: 1, opacity: 1 }"
						:animate="toValue(loadingAnimation.animate)"
						:transition="toValue(loadingAnimation.transition) as any"
						class="loading-indicator"
						:class="{ active: loadingAnimation.isLoading }">
						<i class="pi pi-spin pi-spinner demo-icon"></i>
						<span>Loading...</span>
					</motion.div>
				</div>
				<div class="loading-controls">
					<Button @click="toggleLoading" :label="loadingAnimation.isLoading ? 'Stop Loading' : 'Start Loading'" outlined />
				</div>
			</section>

			<!-- Performance Budget Demo -->
			<section class="showcase-section">
				<h2 class="section-title">Performance Budget Demo</h2>
				<div class="budget-demo">
					<div class="budget-categories">
						<div class="budget-item" v-for="(budget, category) in BUDGETS" :key="category">
							<span class="budget-label">{{ category }}:</span>
							<span class="budget-value">{{ budget }}ms</span>
							<motion.div :animate="{ x: [0, 20, 0] }" :transition="createAnimationConfig(category as AnimationCategory)" class="budget-demo-item" @click="testBudget(category as AnimationCategory)">
								Test {{ category }}
							</motion.div>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { motion } from "motion-v";
import Button from "primevue/button";
import { computed, onMounted, ref, toValue } from "vue";
import { useAnimationPerformance, type AnimationCategory } from "../../composables/useAnimationPerformance";
import { useEntranceAnimation, useHoverAnimation, useLoadingAnimation, useStaggerAnimation } from "../../composables/useAnimations";
import { useReducedMotion } from "../../composables/useReducedMotion";

// Performance and motion state
const { currentFps, createAnimationConfig, getPerformanceStats: performanceStats, BUDGETS } = useAnimationPerformance();

const { isReducedMotion, motionClasses, setForcedReducedMotion } = useReducedMotion();

const forcedReducedMotion = ref(false);

// Header animation
const headerAnimation = createAnimationConfig("DECORATIVE", 500);

// Entrance animations
const entranceUp = useEntranceAnimation("DECORATIVE", { direction: "up", delay: 100 });
const entranceLeft = useEntranceAnimation("DECORATIVE", { direction: "left", delay: 200 });
const entranceScale = useEntranceAnimation("DECORATIVE", { direction: "scale", delay: 300 });
const entranceFade = useEntranceAnimation("DECORATIVE", { delay: 400 });

// Plain animation values for motion-v (extract from computed)
const entranceUpPlain = computed(() => ({
	initial: toValue(entranceUp.initial),
	animate: toValue(entranceUp.animate),
	transition: toValue(entranceUp.transition),
}));
const entranceLeftPlain = computed(() => ({
	initial: toValue(entranceLeft.initial),
	animate: toValue(entranceLeft.animate),
	transition: toValue(entranceLeft.transition),
}));
const entranceScalePlain = computed(() => ({
	initial: toValue(entranceScale.initial),
	animate: toValue(entranceScale.animate),
	transition: toValue(entranceScale.transition),
}));
const entranceFadePlain = computed(() => ({
	initial: toValue(entranceFade.initial),
	animate: toValue(entranceFade.animate),
	transition: toValue(entranceFade.transition),
}));

// Hover animations
const hoverScale = useHoverAnimation("CRITICAL", { scale: 1.1, translateY: -4 });
const hoverLift = useHoverAnimation("CRITICAL", { scale: 1.02, translateY: -8 });
const hoverRotate = useHoverAnimation("CRITICAL", { rotateY: 10, scale: 1.05 });

// Stagger animations
const staggerItems = useStaggerAnimation(8, "DECORATIVE", { staggerDelay: 100 });

// Loading animation
const loadingAnimation = useLoadingAnimation("CRITICAL");

// Methods
const toggleReducedMotion = () => {
	forcedReducedMotion.value = !forcedReducedMotion.value;
	setForcedReducedMotion(forcedReducedMotion.value);
};

const resetEntranceAnimations = () => {
	// Reset visibility states to replay animations
	entranceUp.isVisible.value = false;
	entranceLeft.isVisible.value = false;
	entranceScale.isVisible.value = false;
	entranceFade.isVisible.value = false;

	setTimeout(() => {
		entranceUp.isVisible.value = true;
		entranceLeft.isVisible.value = true;
		entranceScale.isVisible.value = true;
		entranceFade.isVisible.value = true;
	}, 100);
};

const triggerStagger = () => {
	staggerItems.trigger();
};

const resetStagger = () => {
	staggerItems.reset();
};

const toggleLoading = () => {
	if (loadingAnimation.isLoading.value) {
		loadingAnimation.stop();
	} else {
		loadingAnimation.start();
	}
};

const testBudget = (category: AnimationCategory) => {
	console.log(`Testing ${category} animation within ${BUDGETS[category]}ms budget`);
};

onMounted(() => {
	// Trigger initial stagger after mount
	setTimeout(() => {
		staggerItems.trigger();
	}, 1000);
});
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/breakpoints" as *;
@use "../../assets/css/styles/mixins/utilities" as *;

.animation-showcase {
	padding: 2rem 0;
	min-height: 100vh;
}

.showcase-title {
	font-size: 2.5rem;
	font-weight: bold;
	text-align: center;
	margin-bottom: 2rem;
	color: var(--p-text-color);
	background: linear-gradient(135deg, var(--p-primary-color), var(--p-highlight-text-color));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.showcase-controls {
	@include flex-between;
	padding: 1.5rem;
	background: var(--p-content-background);
	border: 2px solid var(--p-surface-border);
	border-radius: var(--p-border-radius);
	margin-bottom: 2rem;
	gap: 2rem;

	@include breakpoint-down("md") {
		flex-direction: column;
		gap: 1rem;
	}
}

.control-group {
	@include flex-center;
	gap: 1rem;
}

.control-label {
	@include flex-center;
	gap: 0.5rem;
	font-weight: 500;
	cursor: pointer;

	input[type="checkbox"] {
		transform: scale(1.2);
	}
}

.motion-status {
	padding: 0.5rem 1rem;
	border-radius: var(--p-border-radius);
	font-weight: 600;

	&.motion-reduce {
		background: var(--p-orange-100);
		color: var(--p-orange-700);
	}

	&.motion-safe {
		background: var(--p-green-100);
		color: var(--p-green-700);
	}
}

.performance-stats {
	@include flex-center;
	gap: 1.5rem;
}

.stat {
	@include flex-center;
	gap: 0.5rem;
}

.stat-label {
	font-weight: 500;
	color: var(--p-text-muted-color);
}

.stat-value {
	font-weight: bold;
	padding: 0.25rem 0.5rem;
	border-radius: var(--p-border-radius);
	background: var(--p-content-background);
	color: var(--p-text-color);

	&.stat-warning {
		background: var(--p-orange-100);
		color: var(--p-orange-700);
	}

	&.stat-error {
		background: var(--p-red-100);
		color: var(--p-red-700);
	}
}

.showcase-grid {
	display: grid;
	gap: 3rem;
}

.showcase-section {
	padding: 2rem;
	background: var(--p-content-background);
	border: 2px solid var(--p-surface-border);
	border-radius: var(--p-border-radius);
}

.section-title {
	font-size: 1.5rem;
	font-weight: 600;
	margin-bottom: 1.5rem;
	color: var(--p-primary-color);
}

.demo-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.demo-card {
	@include flex-center;
	flex-direction: column;
	gap: 0.5rem;
	padding: 2rem;
	background: var(--p-content-background);
	color: var(--p-text-color);
	border: 2px solid var(--p-surface-border);
	border-radius: var(--p-border-radius);
	text-align: center;

	&.interactive {
		cursor: pointer;
		transition: var(--p-transition-duration);

		&:hover {
			border-color: var(--p-primary-color);
		}
	}
}

.demo-icon {
	font-size: 2rem;
	color: var(--p-primary-color);
}

.stagger-demo {
	display: grid;
	grid-template-columns: repeat(8, 1fr);
	gap: 0.5rem;
	margin-bottom: 1.5rem;
}

.stagger-item {
	@include flex-center;
	aspect-ratio: 1;
	background: var(--p-primary-color);
	color: var(--p-primary-contrast-color);
	border-radius: var(--p-border-radius);
	font-weight: bold;
	font-size: 1.25rem;
}

.stagger-controls {
	@include flex-center;
	gap: 1rem;
}

.loading-demo {
	@include flex-center;
	padding: 3rem;
}

.loading-indicator {
	@include flex-center;
	gap: 1rem;
	font-size: 1.25rem;
	color: var(--p-text-muted-color);

	&.active .demo-icon {
		color: var(--p-primary-color);
	}
}

.loading-controls {
	@include flex-center;
	margin-top: 1.5rem;
}

.budget-demo {
	display: grid;
	gap: 1rem;
}

.budget-categories {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 1rem;
}

.budget-item {
	padding: 1rem;
	background: var(--p-surface-100);
	border-radius: var(--p-border-radius);
	border: 2px solid var(--p-surface-border);
}

.budget-label {
	font-weight: 600;
	color: var(--p-text-color);
}

.budget-value {
	font-weight: bold;
	color: var(--p-primary-color);
}

.budget-demo-item {
	margin-top: 0.5rem;
	padding: 0.5rem;
	background: var(--p-primary-color);
	color: var(--p-primary-contrast-color);
	border-radius: var(--p-border-radius);
	text-align: center;
	cursor: pointer;
	font-size: 0.875rem;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
	* {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		transform: none !important;
	}
}
</style>
