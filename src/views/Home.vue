<template>
	<div class="home-view">
		<HeroSection />

		<!-- Feature cards section -->
		<section class="features-section py-20 px-4 bg-gradient-to-b from-black/50 to-transparent">
			<div class="container mx-auto">
				<motion.h2
					:initial="{ opacity: 0, y: -20 }"
					:whileInView="{ opacity: 1, y: 0 }"
					:transition="{ duration: 0.6, ease: 'easeOut' }"
					:viewport="{ once: true }"
					class="text-4xl font-bold text-center text-white mb-12">
					Choose Your Path
				</motion.h2>

				<div class="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
					<!-- Rune Dictionary Card -->
					<motion.div
						:initial="{ opacity: 0, y: 40, scale: 0.9 }"
						:whileInView="{ opacity: 1, y: 0, scale: 1 }"
						:transition="{ type: 'spring', stiffness: 60, damping: 12, mass: 1, delay: 0.1 }"
						:viewport="{ once: true }">
						<Card class="feature-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-surface-800/90 backdrop-blur border border-purple-500/30">
						<template #header>
							<div class="card-header-wrapper relative overflow-hidden h-48">
								<img :src="`${baseUrl}rune_generation.webp`" alt="Rune Dictionary" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
								<div class="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
							</div>
						</template>
						<template #title>
							<h3 class="text-2xl font-bold text-purple-300 flex items-center gap-2">
								<i class="pi pi-book text-purple-400"></i>
								Rune Dictionary
							</h3>
						</template>
						<template #content>
							<p class="text-gray-300">Master the ancient knowledge of runes. Create, edit, and combine powerful runic abilities.</p>
						</template>
						<template #footer>
							<Button label="Explore Runes" icon="pi pi-arrow-right" class="w-full bg-purple-600/80 hover:bg-purple-600 border-0 transition-colors" @click="$router.push('/dictionary')" />
						</template>
					</Card>
					</motion.div>

					<!-- Battle Arena Card -->
					<motion.div
						:initial="{ opacity: 0, y: 40, scale: 0.9 }"
						:whileInView="{ opacity: 1, y: 0, scale: 1 }"
						:transition="{ type: 'spring', stiffness: 60, damping: 12, mass: 1, delay: 0.25 }"
						:viewport="{ once: true }">
						<Card class="feature-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-surface-800/90 backdrop-blur border border-red-500/30">
						<template #header>
							<div class="card-header-wrapper relative overflow-hidden h-48">
								<img :src="`${baseUrl}match.webp`" alt="Battle Arena" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
								<div class="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
							</div>
						</template>
						<template #title>
							<h3 class="text-2xl font-bold text-red-300 flex items-center gap-2">
								<i class="pi pi-bolt text-red-400"></i>
								Battle Arena
							</h3>
						</template>
						<template #content>
							<p class="text-gray-300">Test your skills in epic turn-based combat. Challenge opponents and rise through the ranks.</p>
						</template>
						<template #footer>
							<Button label="Enter Battle" icon="pi pi-arrow-right" class="w-full bg-red-600/80 hover:bg-red-600 border-0 transition-colors" @click="$router.push('/match')" />
						</template>
					</Card>
					</motion.div>

					<!-- Profile Card -->
					<motion.div
						:initial="{ opacity: 0, y: 40, scale: 0.9 }"
						:whileInView="{ opacity: 1, y: 0, scale: 1 }"
						:transition="{ type: 'spring', stiffness: 60, damping: 12, mass: 1, delay: 0.4 }"
						:viewport="{ once: true }">
						<Card class="feature-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-surface-800/90 backdrop-blur border border-blue-500/30">
						<template #header>
							<div class="card-header-wrapper relative overflow-hidden h-48">
								<img :src="`${baseUrl}logo.webp`" alt="Profile" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
								<div class="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
							</div>
						</template>
						<template #title>
							<h3 class="text-2xl font-bold text-blue-300 flex items-center gap-2">
								<i class="pi pi-user text-blue-400"></i>
								Your Journey
							</h3>
						</template>
						<template #content>
							<p class="text-gray-300">Track your progress, achievements, and battle statistics. Become a legendary runemaster.</p>
						</template>
						<template #footer>
							<Button label="View Profile" icon="pi pi-arrow-right" class="w-full bg-blue-600/80 hover:bg-blue-600 border-0 transition-colors" @click="$router.push('/profile')" />
						</template>
					</Card>
					</motion.div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { Card, Button } from "primevue";
import HeroSection from "@/components/hero/HeroSection.vue";
import { computed } from "vue";
import { motion } from "motion-v";

const baseUrl = computed(() => import.meta.env.BASE_URL);
</script>

<style lang="scss" scoped>
.home-view {
	min-height: 100vh;
	background: var(--p-content-background);
	color: var(--p-text-color);
}

.features-section {
	position: relative;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(to right, transparent, rgba(147, 51, 234, 0.5), transparent);
	}
}

.feature-card {
	:deep(.p-card-body) {
		padding: 0;
	}

	:deep(.p-card-content) {
		padding: 1.5rem;
		min-height: 100px;
	}

	:deep(.p-card-footer) {
		padding: 1.5rem;
		padding-top: 0;
	}

	:deep(.p-card-title) {
		margin-bottom: 0.5rem;
	}
}

// Add stagger animation for cards
.features-grid {
	.feature-card {
		opacity: 0;
		animation: card-fade-in 0.6s ease-out forwards;

		@for $i from 1 through 3 {
			&:nth-child(#{$i}) {
				animation-delay: #{$i * 0.15}s;
			}
		}
	}
}

@keyframes card-fade-in {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
