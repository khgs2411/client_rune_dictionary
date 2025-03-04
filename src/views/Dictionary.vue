<template>
	<div class="dictionary flex start column gap large">
		<SelectButton :allowEmpty="false" option-value="key" option-label="label" v-model="value" :options="options" />
		<div class="flex gap large wrap" style="width: 80%">
			<template v-for="card in cards[value]" :key="card.title">
				<Card v-ripple class="card" v-if="!card.hidden">
					<template #header>
						<img alt="user header" class="card-image" :src="card.img ?? `https://placehold.co/400x200/${settings.currentTheme.value.split('#')[1]}/FFF`" />
					</template>
					<template #title
						><span class="text-center flex"> {{ card.title }} </span>
					</template>
					<template #subtitle
						><span class="text-center flex"> {{ card.subtitle }} </span>
					</template>
					<template #content>
						<p style="height: 80px" class="flex text-center">{{ card.content }}</p>
					</template>
				</Card>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Card, SelectButton } from "primevue";
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings.store";
const settings = useSettingsStore();
const value = ref("runes");
const options = ref([
	{ key: "runes", label: "Runes" },
	{ key: "aspects", label: "Aspects" },
]);

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

.dictionary {
	width: 100%;
	height: 100%;
	padding: $viewSpacing;

	.card {
		width: 25rem;
		overflow: hidden;
		position: relative;
		cursor: pointer;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.1),
			0 6px 20px rgba(0, 0, 0, 0.1);
		.card-image {
			width: 400px;
			height: 200px;
			object-fit: cover;
		}
	}
	.card::before {
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
