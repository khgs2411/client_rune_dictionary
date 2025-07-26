<template>
	<div class="hero-section relative overflow-hidden h-[70vh] min-h-[500px] flex items-center justify-center">
		<!-- Animated background layers -->
		<div class="hero-background absolute inset-0">
			<!-- Gradient base layer -->
			<div class="hero-gradient absolute inset-0"></div>

			<!-- Animated wave layers -->
			<div class="hero-waves absolute inset-0">
				<div class="wave wave-1"></div>
				<div class="wave wave-2"></div>
			</div>

			<!-- Animated particles -->
			<div class="hero-particles absolute inset-0">
				<div v-for="i in 25" :key="i" class="particle absolute rounded-full opacity-50" :class="`particle-${i}`"></div>
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
				class="hero-subtitle text-xl md:text-2xl lg:text-3xl mb-12 drop-shadow-md">
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
						class="p-button-lg p-button-rounded p-button-outlined enter-arena-btn font-semibold px-8 py-3 hover:scale-105 transition-all duration-300"
						@click="$router.push('/match')" />
				</motion.div>
			</div>
		</div>

		<!-- Decorative elements -->
		<div class="hero-decorations">
			<!-- Top left rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: -180 }"
				:animate="{ opacity: 0.5, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1 }"
				class="rune-decoration absolute top-10 left-10 text-6xl animate-pulse">
				⚡
			</motion.div>
			<!-- Top right rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: 180 }"
				:animate="{ opacity: 0.5, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1.2 }"
				class="rune-decoration absolute top-10 right-10 text-6xl animate-pulse"
				style="animation-delay: 0.5s">
				✦
			</motion.div>
			<!-- Bottom left rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: -180 }"
				:animate="{ opacity: 0.5, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1.4 }"
				class="rune-decoration absolute bottom-10 left-10 text-6xl animate-pulse"
				style="animation-delay: 1s">
				❋
			</motion.div>
			<!-- Bottom right rune -->
			<motion.div
				:initial="{ opacity: 0, scale: 0, rotate: 180 }"
				:animate="{ opacity: 0.5, scale: 1, rotate: 0 }"
				:transition="{ type: 'spring', stiffness: 80, damping: 12, delay: 1.6 }"
				class="rune-decoration absolute bottom-10 right-10 text-6xl animate-pulse"
				style="animation-delay: 1.5s">
				✧
			</motion.div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { motion } from "motion-v";
import { Button } from "primevue";
</script>

<style lang="scss" scoped>
@use "sass:math";
@use "../../assets/css/styles/mixins/_breakpoints" as *;

.hero-section {
	position: relative;
	width: 100%;
	background: var(--p-content-background);
}

// Gradient background with primary color
.hero-gradient {
	background: linear-gradient(135deg, 
		var(--p-primary-900) 0%, 
		var(--p-primary-800) 25%, 
		var(--p-primary-700) 50%, 
		var(--p-primary-800) 75%, 
		var(--p-primary-900) 100%);
	opacity: 0.9;
}

// Animated wave layers
.hero-waves {
	position: absolute;
	inset: 0;
	overflow: hidden;
}

.wave {
	position: absolute;
	bottom: -50%;
	left: -5%;
	width: 110%;
	height: 100%;
	background: var(--p-primary-color);
	border-radius: 50% 50% 0 0;
	opacity: 0.35;
	animation: wave-motion 6s ease-in-out infinite;
}

.wave-1 {
	animation-duration: 6s;
	opacity: 0.4;
}

.wave-2 {
	animation-duration: 8s;
	animation-delay: -3s;
	opacity: 0.3;
	bottom: -55%;
}

@keyframes wave-motion {
	0%, 100% {
		transform: translateY(0) rotateZ(0deg) scaleY(1);
	}
	25% {
		transform: translateY(-40px) rotateZ(1.5deg) scaleY(1.08);
	}
	50% {
		transform: translateY(-70px) rotateZ(3deg) scaleY(1.15);
	}
	75% {
		transform: translateY(-40px) rotateZ(1.5deg) scaleY(1.08);
	}
}

// Particle animations

@for $i from 1 through 25 {
	.particle-#{$i} {
		$size: math.random(6) + 3px;
		$startX: math.random(100) + 0%;
		$endX: math.random(100) + 0%;
		$duration: math.random(10) + 10s;
		$delay: math.random(5) + 0s;

		width: $size;
		height: $size;
		left: $startX;
		top: 110%;
		background: var(--p-primary-color);
		box-shadow: 0 0 #{$size * 2} var(--p-primary-color);
		animation: float-up-#{$i} $duration infinite linear;
		animation-delay: $delay;
	}

	@keyframes float-up-#{$i} {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 0.6;
		}
		90% {
			opacity: 0.6;
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
			0 0 15px var(--p-primary-color),
			0 0 30px var(--p-primary-color),
			0 0 45px var(--p-primary-color);
	}
	to {
		text-shadow:
			0 0 25px var(--p-primary-color),
			0 0 40px var(--p-primary-color),
			0 0 60px var(--p-primary-color);
	}
}

// Subtitle styling
.hero-subtitle {
	color: var(--p-primary-200);
}

// Rune decorations
.rune-decoration {
	color: var(--p-primary-color);
	filter: drop-shadow(0 0 10px var(--p-primary-color));
}

// Enter Arena button styling
.enter-arena-btn {
	border: 2px solid rgba(255, 255, 255, 0.8);
	color: var(--p-surface-50);
	background: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(10px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	
	&:hover {
		background: rgba(0, 0, 0, 0.5);
		border-color: var(--p-surface-50);
		color: var(--p-surface-50);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
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
