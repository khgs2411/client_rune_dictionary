<template>
	<div class="dictionary-view min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
		<!-- RPG Header -->
		<div class="dictionary-header relative py-12 px-4 text-center overflow-hidden">
			<!-- Background effects -->
			<div class="absolute inset-0 bg-black/30"></div>
			<div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"></div>

			<div class="relative z-10">
				<h1 class="text-5xl md:text-6xl font-bold text-purple-200 mb-4 drop-shadow-lg">Tome of Knowledge</h1>
				<p class="text-xl text-purple-300/80">Master the ancient arts of runecraft</p>
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
							<h3 class="text-2xl font-bold text-purple-300 text-center flex items-center justify-center gap-2">
								<i :class="getIconClass(card.title)"></i>
								{{ card.title }}
							</h3>
						</template>
						<template #subtitle>
							<p class="text-purple-400/80 text-center italic">{{ card.subtitle }}</p>
						</template>
						<template #content>
							<p class="text-gray-300 text-center h-20 flex items-center justify-center">{{ card.content }}</p>
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
import { Card, SelectButton, Button } from "primevue";
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
		Generate: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
		View: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
		Create: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
		Edit: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
		Delete: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
	};
	return classes[title] || "bg-purple-600 hover:bg-purple-700";
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
			radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 40% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%);
		animation: float 20s ease-in-out infinite;
		pointer-events: none;
	}
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0) rotate(0deg);
	}
	33% {
		transform: translateY(-20px) rotate(1deg);
	}
	66% {
		transform: translateY(20px) rotate(-1deg);
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
}

// RPG Select Button styles
:deep(.rpg-select-button) {
	.p-selectbutton {
		@apply bg-black/30 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg overflow-hidden;
	}

	.p-button {
		@apply bg-transparent border-0 text-purple-200 font-semibold px-6 py-3 transition-all duration-300;

		&:hover {
			@apply bg-purple-500/20 text-white;
		}

		&.p-highlight {
			@apply bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg;
		}
	}
}

// RPG Card styles
.rpg-card {
	@apply bg-gray-900/90 backdrop-blur-sm border-2 border-purple-500/30 overflow-hidden;

	&:hover {
		@apply border-purple-400/60 shadow-purple-500/30;

		.card-icon {
			animation: bounce 0.5s ease-in-out;
		}
	}

	:deep(.p-card-body) {
		@apply p-0;
	}

	:deep(.p-card-content) {
		@apply px-6 py-4;
	}

	:deep(.p-card-footer) {
		@apply px-6 pb-6;
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
	@apply border-0 text-white font-bold py-3 transition-all duration-300 shadow-lg;

	&:hover {
		@apply shadow-xl transform -translate-y-0.5;
	}
}
</style>
