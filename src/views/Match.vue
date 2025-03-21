<template>
	<div class="match">
		<div class="viewport background">
			<div class="content">
				<div class="flex gap large wrap match-card-wrapper">
					<Card v-ripple v-for="card in matchCards" :key="card.type" :class="['match-card', card.type]" @click="handleMatchType(card.type)">
						<template #header>
							<img :alt="`${card.type} header`" class="card-image" :src="`${baseUrl}match.webp`" />
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
		</div>
	</div>
</template>

<script lang="ts" setup>
type MatchType = "pvp" | "pve";

interface MatchCard {
	type: MatchType;
	title: string;
	subtitle: string;
	content: string;
}

import { Card } from "primevue";
import { ref } from "vue";

const baseUrl = import.meta.env.BASE_URL;

const matchCards = ref<MatchCard[]>([
	{
		type: "pvp",
		title: "Player versus Player",
		subtitle: "Challenge other players to a duel",
		content: "Test your skills against other players in real-time combat using your runeabilities.",
	},
	{
		type: "pve",
		title: "Player versus Environment",
		subtitle: "Challenge the environment",
		content: "Face off against AI-controlled opponents and test your strategies.",
	},
]);

// Set CSS variable for background image
document.documentElement.style.setProperty("--match-bg-url", `url(${baseUrl}match.webp)`);
function handleMatchType(type: MatchType) {
	// Handle match type selection
	console.log(`Selected match type: ${type}`);
}
</script>

<style lang="scss" scoped>
@use "../assets/css/common.scss" as *;

.match {
	background-image: var(--match-bg-url);
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;

	/* Use flexbox for proper centering */
	display: flex;
	justify-content: center;
	align-items: center;

	/* Standard viewport sizing */
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
		height: 90%;
		width: 90%;
		padding: 1%;
		border-radius: var(--p-border-radius-lg);
		margin: 0;

		&.background {
			@include var-to-rgba(--p-content-background, 0.9);
		}

		box-shadow:
			0 6px 12px rgba(0, 0, 0, 0.15),
			0 8px 24px rgba(0, 0, 0, 0.15);
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
}
</style>
