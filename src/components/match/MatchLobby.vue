<template>
	<div class="match-lobby">
		<div class="flex gap large wrap match-card-wrapper">
			<div v-for="card in matchCards" :key="card.type" class="match-card-wrapper-outer">
				<span v-if="card.wip" class="wip-badge">WIP</span>
				<Card v-ripple :class="['match-card', card.type, { disabled: card.disabled || card.loading, loading: card.loading }]" @click="!card.disabled && !card.loading && handleMatchType(card)">
					<template #header>
						<div class="card-header-container">
							<img :alt="`${card.type} header`" class="card-image" :src="`${imageUrl}match.webp`" />
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
	</div>
</template>

<script lang="ts" setup>
import Card from "primevue/card";
import ProgressSpinner from "primevue/progressspinner";
import { MatchCard } from "../../common/types/match.types";

interface Props {
	matchCards: MatchCard[];
	imageUrl: string;
}

interface Emits {
	(e: "matchTypeSelected", card: MatchCard): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function handleMatchType(card: MatchCard) {
	emit("matchTypeSelected", card);
}
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/breakpoints" as *;

.match-lobby {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	padding: 1rem;
	overflow-y: auto;

	@include breakpoint-up("sm") {
		padding: 1.5rem;
	}

	@include breakpoint-up("md") {
		padding: 2rem;
	}
}

.match-card-wrapper {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
	max-width: 1200px;
	margin: 0 auto;

	@include breakpoint-up("sm") {
		gap: 1.5rem;
	}

	@include breakpoint-up("md") {
		gap: 2rem;
	}
}

.match-card-wrapper-outer {
	position: relative;
	display: inline-block;

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
}

.match-card {
	width: 100%;
	max-width: 35rem;
	min-width: 280px;
	height: auto;
	min-height: 400px;
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
	display: flex;
	flex-direction: column;

	// Mobile size
	@include breakpoint-down("sm") {
		width: calc(100vw - 2rem);
		max-width: 400px;
		min-height: 350px;
	}

	// Tablet size
	@include breakpoint-between("sm", "lg") {
		width: 300px;
		min-height: 380px;
	}

	// Desktop size
	@include breakpoint-up("lg") {
		width: 35rem;
		height: 450px;
	}

	&:hover:not(.disabled):not(.loading) {
		transform: translateY(-5px);
		box-shadow:
			0 6px 12px rgba(0, 0, 0, 0.15),
			0 8px 24px rgba(0, 0, 0, 0.15);
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

	&.loading {
		opacity: 0.8;
		pointer-events: none;
	}

	.card-header-container {
		position: relative;
	}

	.card-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
		transition: transform 0.3s ease;

		@include breakpoint-up("sm") {
			height: 220px;
		}

		@include breakpoint-up("md") {
			height: 250px;
		}
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

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--p-content-background);
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
}
</style>
