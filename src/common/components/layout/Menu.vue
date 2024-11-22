<template>
	<Menubar :model="items">
		<template #end>
			<Button @click="setDarkMode(false)" icon="pi pi-moon" v-if="darkMode" text></Button>
			<Button @click="setDarkMode(true)" icon="pi pi-sun" v-else text></Button>
			<Button @click="onSettingsBtn" icon="pi pi-cog" text></Button>
		</template>
	</Menubar>
</template>

<script lang="ts" setup>
interface MenuItem {
	label?: string | ((...args: any) => string) | undefined;
	icon?: string | undefined;
	command?: (event: { originalEvent: Event; item: MenuItem; [key: string]: any }) => void;
	url?: string | undefined;
	items?: MenuItem[] | undefined;
	disabled?: boolean | ((...args: any) => boolean) | undefined;
	visible?: boolean | ((...args: any) => boolean) | undefined;
	target?: string | undefined;
	separator?: boolean | undefined;
	style?: any;
	class?: any;
	key?: string | undefined;
	[key: string]: any;
}
import { Menubar } from "primevue";
import { computed, reactive } from "vue";
import Button from "primevue/button";
import { useSettingsStore } from "../../../stores/settings.store";


const store = useSettingsStore();
const items: MenuItem[] = reactive([]);

const darkMode = computed(() => store.darkMode);

function setDarkMode(value: boolean) {
	store.setDarkMode(value);
}

function onSettingsBtn() {
	store.setVisible(!store.visible);
}
</script>

<style lang="scss" scoped></style>
