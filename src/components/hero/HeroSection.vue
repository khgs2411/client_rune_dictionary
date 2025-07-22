<template>
	<div class="hero-section relative overflow-hidden h-[70vh] min-h-[500px] flex items-center justify-center">
		<!-- Animated background layers -->
		<div class="hero-background absolute inset-0">
			<!-- Gradient base layer -->
			<div class="hero-gradient absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-90"></div>

			<!-- Animated particles -->
			<div class="hero-particles absolute inset-0">
				<div v-for="i in 20" :key="i" class="particle absolute rounded-full bg-white opacity-20" :class="`particle-${i}`"></div>
			</div>

			<!-- Mystical fog effect -->
			<div class="hero-fog absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
		</div>

		<!-- Hero content -->
		<div class="hero-content relative z-10 text-center px-4 max-w-6xl mx-auto">
			<motion.h1
				:initial="{ opacity: 0, scale: 0.8, y: 50 }"
				:animate="{ opacity: 1, scale: 1, y: 0 }"
				:transition="{ type: 'spring', stiffness: 100, damping: 15, mass: 1, delay: 0.1 }"
				class="hero-title text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-lg">
				Rune RPG
			</motion.h1>
			<motion.p
				:initial="{ opacity: 0, y: 30 }"
				:animate="{ opacity: 1, y: 0 }"
				:transition="{ duration: 0.8, ease: 'easeOut', delay: 0.4 }"
				class="hero-subtitle text-xl md:text-2xl lg:text-3xl text-purple-200 mb-12 drop-shadow-md">
				Master the Ancient Arts of Runecraft
			</motion.p>

			<!-- Call to action -->
			<div class="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
				<motion.div
					:initial="{ opacity: 0, x: -30 }"
					:animate="{ opacity: 1, x: 0 }"
					:transition="{ duration: 0.6, ease: 'easeOut', delay: 0.7 }">
					<Button
						label="Begin Adventure"
						icon="pi pi-play"
						class="p-button-lg p-button-rounded bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white font-semibold px-8 py-3 hover:scale-105 transition-transform duration-300 shadow-xl"
						@click="$router.push('/dictionary')" />
				</motion.div>
				<motion.div
					:initial="{ opacity: 0, x: 30 }"
					:animate="{ opacity: 1, x: 0 }"
					:transition="{ duration: 0.6, ease: 'easeOut', delay: 0.8 }">
					<Button
						label="Enter Arena"
						icon="pi pi-bolt"
						class="p-button-lg p-button-rounded p-button-outlined border-2 border-purple-400 text-purple-200 font-semibold px-8 py-3 hover:bg-purple-400/20 hover:scale-105 transition-all duration-300"
						@click="$router.push('/match')" />
				</motion.div>
			</div>
		</div>

		<!-- Decorative elements -->
		<div class="hero-decorations">
			<!-- Top left rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: -180 }"
				:animate="{ opacity: 0.3, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1 }"
				class="rune-decoration absolute top-10 left-10 text-6xl text-purple-300 animate-pulse">
				⚡
			</motion.div>
			<!-- Top right rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: 180 }"
				:animate="{ opacity: 0.3, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1.2 }"
				class="rune-decoration absolute top-10 right-10 text-6xl text-blue-300 animate-pulse"
				style="animation-delay: 0.5s">
				✦
			</motion.div>
			<!-- Bottom left rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: -180 }"
				:animate="{ opacity: 0.3, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1.4 }"
				class="rune-decoration absolute bottom-10 left-10 text-6xl text-indigo-300 animate-pulse"
				style="animation-delay: 1s">
				❋
			</motion.div>
			<!-- Bottom right rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: 180 }"
				:animate="{ opacity: 0.3, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1.6 }"
				class="rune-decoration absolute bottom-10 right-10 text-6xl text-purple-300 animate-pulse"
				style="animation-delay: 1.5s">
				✧
			</motion.div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Button } from "primevue";
import { motion } from "motion-v";
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "../../assets/css/styles/mixins/breakpoints";

.hero-section {
	position: relative;
	width: 100%;
	background: var(--p-content-background);
}

// Particle animations

@for $i from 1 through 20 {
	.particle-#{$i} {
		$size: math.random(4) + 2px;
		$startX: math.random(100) + 0%;
		$endX: math.random(100) + 0%;
		$duration: math.random(20) + 20s;
		$delay: math.random(10) + 0s;

		width: $size;
		height: $size;
		left: $startX;
		top: 110%;
		animation: float-up-#{$i} $duration infinite linear;
		animation-delay: $delay;
	}

	@keyframes float-up-#{$i} {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 0.2;
		}
		90% {
			opacity: 0.2;
		}
		100% {
			transform: translateY(-120vh) translateX(#{math.random(100) - 50}px);
			opacity: 0;
		}
	}
}

// Hero content entrance animation
.hero-enter {
	animation: hero-fade-in 1s ease-out forwards;
}

@keyframes hero-fade-in {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

// Title animation
.hero-title {
	animation: title-glow 3s ease-in-out infinite alternate;
}

@keyframes title-glow {
	from {
		text-shadow:
			0 0 10px rgba(147, 51, 234, 0.5),
			0 0 20px rgba(147, 51, 234, 0.3),
			0 0 30px rgba(147, 51, 234, 0.2);
	}
	to {
		text-shadow:
			0 0 20px rgba(147, 51, 234, 0.8),
			0 0 30px rgba(147, 51, 234, 0.6),
			0 0 40px rgba(147, 51, 234, 0.4);
	}
}

// Responsive adjustments
@include breakpoint-down("sm") {
	.hero-section {
		min-height: 400px;
		height: 60vh;
	}

	.hero-title {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}

	.rune-decoration {
		font-size: 2.5rem;

		&.absolute {
			&.top-10 {
				top: 1rem;
			}
			&.bottom-10 {
				bottom: 1rem;
			}
			&.left-10 {
				left: 1rem;
			}
			&.right-10 {
				right: 1rem;
			}
		}
	}

	// Reduce particles on mobile for performance
	.particle {
		&:nth-child(n + 11) {
			display: none;
		}
	}
}

// Tablet adjustments
@include breakpoint-between("sm", "lg") {
	.hero-title {
		font-size: 4rem;
	}

	.hero-subtitle {
		font-size: 1.5rem;
	}

	.rune-decoration {
		font-size: 4rem;
	}
}

// Large desktop
@include breakpoint-up("2xl") {
	.hero-section {
		height: 80vh;
		max-height: 1000px;
	}
}
</style>
