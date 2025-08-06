<template>
	<div class="dictionary-view min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
		<!-- RPG Header -->
		<div class="dictionary-header relative py-12 px-4 text-center overflow-hidden">
			<!-- Background effects -->
			<div class="absolute inset-0 bg-black/30"></div>
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/20 to-transparent"></div>

			<div class="relative z-10">
				<h1 class="text-5xl md:text-6xl font-bold text-primary-200 mb-4 drop-shadow-lg">Tome of Knowledge</h1>
				<p class="text-xl text-primary-300/80">Master the ancient arts of runecraft</p>
			</div>
		</div>

		<!-- Content Container -->
		<div class="container mx-auto px-4 pb-12">
			<!-- Tab Selector with RPG Style -->
			<div class="flex justify-center mb-12">
				<SelectButton :allowEmpty="false" option-value="key" option-label="label" v-model="value" :options="options" class="rpg-select-button" />
			</div>
			<!-- Cards Grid -->
			<div class="cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
				<template v-for="(card, index) in cards[value]" :key="card.title">
					<Card v-ripple class="rpg-card group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl" v-if="!card.hidden" :class="`card-enter-${index}`">
						<template #header>
							<div class="card-header-wrapper relative overflow-hidden h-48">
								<img
									:alt="card.title"
									class="card-image w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
									:src="card.img ?? `https://placehold.co/400x200/${settings.currentTheme.value.split('#')[1]}/FFF`" />
								<div class="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
								<div class="card-icon absolute top-4 right-4 text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
									{{ getCardIcon(card.title) }}
								</div>
							</div>
						</template>
						<template #title>
							<h3 class="text-2xl font-bold text-primary-300 text-center flex items-center justify-center gap-2">
								<i :class="getIconClass(card.title)"></i>
								{{ card.title }}
							</h3>
						</template>
						<template #subtitle>
							<p class="text-primary-400/80 text-center italic">{{ card.subtitle }}</p>
						</template>
						<template #content>
							<p class="text-color text-center h-20 flex items-center justify-center">{{ card.content }}</p>
						</template>
						<template #footer>
							<Button :label="getActionLabel(card.title)" icon="pi pi-arrow-right" iconPos="right" class="w-full rpg-button" :class="getButtonClass(card.title)" />
						</template>
					</Card>
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Button, Card, SelectButton } from "primevue";
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings.store";
const settings = useSettingsStore();
const value = ref("runes");
const options = ref([
	{ key: "runes", label: "Runes" },
	{ key: "aspects", label: "Aspects" },
]);

// Icon mapping for cards
const getCardIcon = (title: string): string => {
	const icons: Record<string, string> = {
		Generate: "✨",
		View: "📖",
		Create: "🔮",
		Edit: "✏️",
		Delete: "🗑️",
	};
	return icons[title] || "📜";
};

const getIconClass = (title: string): string => {
	const icons: Record<string, string> = {
		Generate: "pi pi-sparkles",
		View: "pi pi-eye",
		Create: "pi pi-plus-circle",
		Edit: "pi pi-pencil",
		Delete: "pi pi-trash",
	};
	return icons[title] || "pi pi-book";
};

const getActionLabel = (title: string): string => {
	const labels: Record<string, string> = {
		Generate: "Forge Runeability",
		View: "Browse Collection",
		Create: "Craft New Rune",
		Edit: "Modify Rune",
		Delete: "Destroy Rune",
	};
	return labels[title] || title;
};

const getButtonClass = (title: string): string => {
	const classes: Record<string, string> = {
		Generate: "bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700",
		View: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
		Create: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
		Edit: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
		Delete: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
	};
	return classes[title] || "bg-primary-600 hover:bg-primary-700";
};

const cards = ref(<{ [key: string]: { title: string; subtitle: string; content: string; img?: string; hidden?: boolean }[] }>{
	runes: [
		{
			title: "Generate",
			subtitle: "Generate a new Runeability",
			content: "Begin the Runeability creation process by selecting the desired Runes.",
			img: `${import.meta.env.BASE_URL}rune_generation.webp`,
		},
		{
			title: "View",
			subtitle: "View Runes",
			content: "View a list of all existing Runes",
			hidden: false,
			img: `${import.meta.env.BASE_URL}rune_get.webp`,
		},
		{
			title: "Create",
			subtitle: "Create a Rune",
			content: "Create a new Rune",
			hidden: false,
			img: `${import.meta.env.BASE_URL}rune_create.webp`,
		},
		{
			title: "Edit",
			subtitle: "Edit a Rune",
			content: "Edit the properties of a Rune",
			hidden: false,
			img: `${import.meta.env.BASE_URL}edit.webp`,
		},
		{
			title: "Delete",
			subtitle: "Delete a Rune",
			content: "Delete a Rune",
			hidden: false,
			img: `${import.meta.env.BASE_URL}rune_delete.webp`,
		},
	],
	aspects: [
		{
			title: "Create",
			subtitle: "Create an Aspect",
			content: "Create an Aspect and assign it to the relevant runes.",
			img: `${import.meta.env.BASE_URL}aspect_create.webp`,
		},
		{
			title: "View",
			subtitle: "View Aspects",
			content: "View a list of all existing Aspects",
			hidden: false,
			img: `${import.meta.env.BASE_URL}aspect_get.webp`,
		},
		{
			title: "Edit",
			subtitle: "Edit an Aspect",
			content: "Edit the properties of an Aspect.",
			img: `${import.meta.env.BASE_URL}edit.webp`,
		},
		{
			title: "Delete",
			subtitle: "Delete an Aspect",
			content: "Delete an Aspect",
			hidden: false,
			img: `${import.meta.env.BASE_URL}aspect_delete.webp`,
		},
	],
});
</script>

<style lang="scss" scoped>
@use "../assets/css/variables.scss" as *;

.dictionary-view {
	min-height: 100vh;
	position: relative;

	// Add animated background particles
	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image:
			radial-gradient(circle at 20% 50%, var(--p-primary-color) 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--p-primary-color) 0%, transparent 50%),
			radial-gradient(circle at 40% 20%, var(--p-primary-color) 0%, transparent 50%);
		opacity: 0.7;
		animation: float 10s ease-in-out infinite;
		pointer-events: none;
	}
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0) rotate(0deg) scale(1);
	}
	25% {
		transform: translateY(-60px) rotate(3deg) scale(1.15);
	}
	50% {
		transform: translateY(-30px) rotate(-1deg) scale(1.2);
	}
	75% {
		transform: translateY(50px) rotate(-3deg) scale(0.85);
	}
}

.dictionary-header {
	position: relative;

	h1 {
		animation: glow 3s ease-in-out infinite alternate;
	}

	@keyframes glow {
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
}

// RPG Select Button styles
:deep(.rpg-select-button) {
	.p-selectbutton {
		background: oklch(0 0 0 / 0.3);
		backdrop-filter: blur(4px);
		border: 2px solid oklch(from var(--p-primary-color) l c h / 0.5);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.p-button {
		background: transparent;
		border: 0;
		color: var(--p-primary-200);
		font-weight: 600;
		padding: 0.75rem 1.5rem;
		transition: all 0.3s ease;

		&:hover {
			background: oklch(from var(--p-primary-color) l c h / 0.2);
			color: white;
		}

		&.p-highlight {
			background: linear-gradient(to right, var(--p-primary-600), var(--p-pink-600));
			color: white;
			box-shadow:
				0 10px 15px -3px oklch(0 0 0 / 0.1),
				0 4px 6px -2px oklch(0 0 0 / 0.05);
		}
	}
}

// RPG Card styles
.rpg-card {
	// background: rgba(17, 24, 39, 0.9);
	backdrop-filter: blur(4px);
	border: 2px solid oklch(from var(--p-primary-color) l c h / 0.3);
	overflow: hidden;

	&:hover {
		border-color: oklch(from var(--p-primary-color) l c h / 0.6);
		box-shadow: 0 0 20px oklch(from var(--p-primary-color) l c h / 0.3);

		.card-icon {
			animation: bounce 0.5s ease-in-out;
		}
	}

	:deep(.p-card-header) {
		.card-image {
			border-radius: 8px;
		}
	}

	:deep(.p-card-body) {
		box-shadow: 0 -4px 6px oklch(0 0 0 / 0.1);

		padding: 0.75rem 0 0;
	}

	:deep(.p-card-footer) {
		padding: 0 1.5rem 1.5rem;
	}
}

// Card entrance animations
@for $i from 0 through 7 {
	.card-enter-#{$i} {
		opacity: 0;
		animation: card-fade-in 0.6s ease-out forwards;
		animation-delay: #{$i * 0.1}s;
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

@keyframes bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}

// RPG Button styles
.rpg-button {
	border: 0;
	color: var(--p-text-color);
	font-weight: bold;
	padding: 0.75rem 0;
	transition: all 0.3s ease;
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05);

	&:hover {
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		transform: translateY(-2px);
	}
}
</style>
