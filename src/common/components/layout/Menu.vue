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
import Button from "primevue/button";
import { computed, ComputedRef } from "vue";
import { useRouter } from "vue-router";
import { useSettingsStore } from "../../../stores/settings.store";
import useAuth from "../../composables/useAuth";

const store = useSettingsStore();
const auth = useAuth();
const router = useRouter();
const items: ComputedRef<MenuItem[]> = computed(() => [
	{ label: "Match", icon: "pi pi-fw pi-users", command: () => router.push("/match") },
	{ label: "Dictionary", icon: "pi pi-fw pi-book", command: () => router.push("/app"), visible: auth.authorized.value },
]);

const darkMode = computed(() => store.darkMode);

function setDarkMode(value: boolean) {
	store.setDarkMode(value);
}

function onSettingsBtn() {
	store.setVisible(!store.visible);
}
</script>

<style lang="scss" scoped></style>
