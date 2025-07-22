<template>
	<motion.div
		:initial="{ opacity: 0, y: -20 }"
		:animate="{ opacity: 1, y: 0 }"
		:transition="{ duration: 0.4, ease: 'easeOut' }">
		<Menubar class="run-dict-menu" :model="items">
			<template #end>
				<motion.div
					:initial="{ opacity: 0, scale: 0.8 }"
					:animate="{ opacity: 1, scale: 1 }"
					:transition="{ duration: 0.3, ease: 'easeOut', delay: 0.2 }">
					<Button @click="setDarkMode(false)" icon="pi pi-moon" v-if="darkMode" text />
					<Button @click="setDarkMode(true)" icon="pi pi-sun" v-else text />
				</motion.div>
				<motion.div
					:initial="{ opacity: 0, scale: 0.8 }"
					:animate="{ opacity: 1, scale: 1 }"
					:transition="{ duration: 0.3, ease: 'easeOut', delay: 0.3 }">
					<Button @click="onSettingsBtn" icon="pi pi-cog" text />
				</motion.div>
			</template>
		</Menubar>
	</motion.div>
</template>

<script lang="ts" setup>
import { motion } from "motion-v";

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
import useAuth from "../../common/composables/useAuth";
import { useSettingsStore } from "../../stores/settings.store";

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

<style lang="scss" scoped>
@import "../../assets/css/styles/mixins/breakpoints";

.run-dict-menu {
	// Ensure menu is responsive
	width: 100%;

	&:deep() {
		.p-menubar-item-content,
		.p-menubar-item-icon {
			color: var(--p-primary-color);
		}

		// Mobile adjustments
		@include breakpoint-down("sm") {
			.p-menubar-root-list {
				gap: 0.5rem;
			}

			.p-menubar-item-content {
				padding: 0.5rem;
			}

			.p-menubar-item-label {
				font-size: 0.875rem;
			}
		}

		// Tablet and up
		@include breakpoint-up("md") {
			.p-menubar-item-content {
				padding: 0.75rem 1rem;
			}
		}
	}

	// End section buttons responsive
	:deep(.p-menubar-end) {
		display: flex;
		align-items: center;
		gap: 0.25rem;

		@include breakpoint-up("sm") {
			gap: 0.5rem;
		}

		.p-button {
			// Smaller buttons on mobile
			@include breakpoint-down("sm") {
				width: 2rem;
				height: 2rem;
				padding: 0;

				.p-button-icon {
					font-size: 1rem;
				}
			}
		}
	}
}
</style>
