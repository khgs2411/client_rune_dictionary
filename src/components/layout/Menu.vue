<template>
	<motion.div :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, ease: 'easeOut' }">
		<!-- Desktop Menu -->
		<Menubar class="run-dict-menu rpg-desktop-only" :model="items" aria-label="Main navigation">
			<template #start>
				<motion.div :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }" :transition="{ duration: 0.3, ease: 'easeOut', delay: 0.1 }">
					<span class="rpg-brand" @click="$router.push({ name: 'home' })">
						<i class="pi pi-shield" aria-hidden="true"></i>
						<span class="rpg-brand-text">Rune RPG</span>
					</span>
				</motion.div>
			</template>
			<template #end>
				<motion.div :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }" :transition="{ duration: 0.3, ease: 'easeOut', delay: 0.2 }" class="rpg-menu-actions">
					<Button
						@click="toggleTheme"
						:icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'"
						severity="secondary"
						text
						rounded
						:aria-label="darkMode ? 'Switch to light theme' : 'Switch to dark theme'"
						class="rpg-theme-toggle" />
					<Button @click="onSettingsBtn" icon="pi pi-cog" severity="secondary" text rounded aria-label="Open settings" class="rpg-settings-btn" />
				</motion.div>
			</template>
		</Menubar>

		<!-- Mobile Menu -->
		<div class="rpg-mobile-menu rpg-mobile-only">
			<motion.div :initial="{ opacity: 0, y: -10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.3, ease: 'easeOut' }" class="rpg-mobile-header">
				<span class="rpg-brand"  @click="$router.push({ name: 'home' })">
					<i class="pi pi-shield" aria-hidden="true"></i>
					<span class="rpg-brand-text">Rune RPG</span>
				</span>
				<div class="rpg-mobile-actions">
					<Button
						@click="toggleTheme"
						:icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'"
						severity="secondary"
						text
						rounded
						:aria-label="darkMode ? 'Switch to light theme' : 'Switch to dark theme'"
						class="rpg-theme-toggle" />
					<Button @click="toggleMobileMenu" icon="pi pi-bars" severity="secondary" text rounded aria-label="Open navigation menu" aria-expanded="false" aria-haspopup="true" class="rpg-hamburger" />
				</div>
			</motion.div>
		</div>

		<!-- Mobile Sidebar -->
		<Drawer v-model:visible="mobileMenuVisible" position="right" class="rpg-mobile-sidebar" aria-label="Mobile navigation menu">
			<template #header>
				<div class="rpg-sidebar-header">
					<i class="pi pi-shield rpg-sidebar-icon" aria-hidden="true"></i>
					<span class="rpg-sidebar-title">Navigation</span>
				</div>
			</template>
			<div class="rpg-mobile-nav-container">
				<nav class="rpg-mobile-nav" role="navigation">
					<motion.ul :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.4, ease: 'easeOut', delay: 0.1 }" class="rpg-mobile-nav-list">
						<motion.li
							v-for="(item, index) in items"
							:key="item.key"
							:initial="{ opacity: 0, x: 20 }"
							:animate="{ opacity: 1, x: 0 }"
							:transition="{ duration: 0.3, ease: 'easeOut', delay: 0.1 + index * 0.1 }"
							v-show="item.visible !== false"
							class="rpg-mobile-nav-item">
							<Button @click="handleMobileNavClick(item)" :icon="item.icon" :label="item.label?.toString()" text class="rpg-mobile-nav-button" :aria-label="`Navigate to ${item.label}`" />
						</motion.li>
					</motion.ul>
				</nav>
				<motion.div :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, ease: 'easeOut', delay: 0.3 }" class="rpg-mobile-footer">
					<Button
						@click="
							() => {
								onSettingsBtn();
								mobileMenuVisible = false;
							}
						"
						icon="pi pi-cog"
						label="Settings"
						text
						class="rpg-mobile-footer-button"
						aria-label="Open settings" />
				</motion.div>
			</div>
		</Drawer>
	</motion.div>
</template>

<script lang="ts" setup>
import { motion } from "motion-v";
import { Menubar } from "primevue";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import { MenuItem } from "primevue/menuitem";
import { computed, ComputedRef, ref } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../../common/composables/useAuth";
import { useSettingsStore } from "../../stores/settings.store";

/* interface MenuItem {
	label?: string | undefined;
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
} */

const store = useSettingsStore();
const auth = useAuth();
const router = useRouter();
const mobileMenuVisible = ref(false);

const items: ComputedRef<MenuItem[]> = computed(() => [
	{
		label: "Match",
		icon: "pi pi-fw pi-users",
		command: () => router.push("/match"),
	},
	{
		label: "Dictionary",
		icon: "pi pi-fw pi-book",
		command: () => router.push("/app"),
		visible: auth.authorized.value,
	},
	{
		label: "Animations",
		icon: "pi pi-fw pi-sparkles",
		command: () => router.push("/animations"),
	},
]);

const darkMode = computed(() => store.darkMode);

function toggleTheme() {
	store.setDarkMode(!darkMode.value);
}

function setDarkMode(value: boolean) {
	store.setDarkMode(value);
}

function onSettingsBtn() {
	store.setVisible(!store.visible);
}

function toggleMobileMenu() {
	mobileMenuVisible.value = !mobileMenuVisible.value;
}

function handleMobileNavClick(item: MenuItem) {
	if (item.command) {
		item.command({ originalEvent: new Event("click"), item });
	}
	mobileMenuVisible.value = false;
}
</script>

<style lang="scss" scoped>
@use "../../assets/css/styles/mixins/breakpoints" as *;
@use "../../assets/css/styles/mixins/utilities" as *;

// RPG Brand styling
.rpg-brand {
	@include flex-center;
	gap: 0.5rem;
	font-weight: 700;
	color: var(--p-text-color);
	transition: all 0.3s ease-in-out;
	cursor: pointer;

	.pi-shield {
		font-size: 1.25rem;
		color: var(--p-primary-color);
		transition: transform 0.3s ease-in-out;
	}

	.rpg-brand-text {
		font-size: 1.125rem;
		color: var(--p-text-color);
		transition: all 0.3s ease-in-out;
	}

	&:hover {
		.pi-shield {
			transform: scale(1.1);
		}

		.rpg-brand-text {
			color: var(--p-primary-color);
		}
	}
}

// Desktop Menu styling
.run-dict-menu {
	width: 100%;
	background: var(--p-content-background);
	border-bottom: 2px solid var(--p-primary-color);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(8px);

	&:deep() {
		.p-menubar {
			background: transparent;
			border: none;
			padding: 0.5rem 1rem;
		}

		.p-menubar-item-content {
			color: var(--p-text-color);
			border-radius: var(--p-border-radius);
			transition: all 0.3s ease-in-out;
			padding: 0.5rem 1rem;

			&:hover {
				background: var(--p-highlight-bg);
				color: var(--p-highlight-text-color);
				transform: translateY(-1px);
			}

			&:focus-visible {
				@include focus-visible;
			}
		}

		.p-menubar-item-icon {
			color: var(--p-primary-color);
		}

		.p-menubar-start {
			margin-right: auto;
		}
	}
}

// Mobile-specific responsive utilities
.rpg-mobile-only {
	@include breakpoint-up("md") {
		display: none !important;
	}
}

.rpg-desktop-only {
	@include breakpoint-down("md") {
		display: none !important;
	}
}

// Mobile Menu Header
.rpg-mobile-menu {
	width: 100%;
	background: var(--p-content-background);
	border-bottom: 2px solid var(--p-primary-color);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 1rem;

	.rpg-mobile-header {
		@include flex-between;
		width: 100%;
	}

	.rpg-mobile-actions {
		@include flex-center;
		gap: 0.5rem;
	}
}

// Theme Toggle and Action Buttons
.rpg-theme-toggle,
.rpg-settings-btn,
.rpg-hamburger {
	transition: all 0.2s ease-in-out;

	&:hover {
		background: var(--p-highlight-bg);
	}

	&:active {
		transform: scale(0.95);
	}
}

.rpg-menu-actions {
	@include flex-center;
	gap: 0.5rem;
}

// Mobile Sidebar styling
.rpg-mobile-sidebar {
	&:deep(.p-drawer) {
		background: var(--p-content-background);
		border-left: 2px solid var(--p-primary-color);
		min-width: 280px;
	}

	&:deep(.p-drawer-header) {
		background: var(--p-primary-color);
		color: var(--p-primary-contrast-color);
		padding: 1.5rem;
		border-bottom: 1px solid var(--p-surface-border);
	}

	&:deep(.p-drawer-content) {
		padding: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
}

.rpg-sidebar-header {
	@include flex-center;
	gap: 0.75rem;

	.rpg-sidebar-icon {
		font-size: 1.5rem;
	}

	.rpg-sidebar-title {
		font-size: 1.25rem;
		font-weight: 600;
	}
}

// Mobile Navigation Container
.rpg-mobile-nav-container {
	display: flex;
	flex-direction: column;
	height: 100%;
}

// Mobile Navigation
.rpg-mobile-nav {
	padding: 1rem;
	flex: 1;
	overflow-y: auto;
}

.rpg-mobile-nav-list {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.rpg-mobile-nav-item {
	width: 100%;
}

.rpg-mobile-nav-button {
	width: 100%;
	justify-content: flex-start;
	padding: 0.625rem 1rem;
	border-radius: var(--p-border-radius);
	transition: all 0.2s ease-in-out;
	background: transparent;

	&:hover {
		background: var(--p-highlight-bg);
		color: var(--p-highlight-text-color);
	}

	&:focus-visible {
		@include focus-visible;
	}

	&:deep(.p-button-icon) {
		color: var(--p-primary-color);
		margin-right: 0.75rem;
	}

	&:deep(.p-button-label) {
		color: var(--p-text-color);
		font-weight: 500;
	}
}

.rpg-mobile-footer {
	padding: 1rem;
	border-top: 1px solid var(--p-surface-border);
	margin-top: auto;
}

.rpg-mobile-footer-button {
	width: 100%;
	justify-content: flex-start;
	padding: 0.625rem 1rem;
	border-radius: var(--p-border-radius);
	transition: all 0.2s ease-in-out;
	background: transparent;
	border: 2px solid transparent;

	&:hover {
		background: var(--p-highlight-bg);
		border-color: var(--p-primary-color);
		transform: translateX(4px);
	}

	&:focus-visible {
		@include focus-visible;
	}

	&:deep(.p-button-icon) {
		color: var(--p-primary-color);
		margin-right: 0.75rem;
	}

	&:deep(.p-button-label) {
		color: var(--p-text-color);
		font-weight: 500;
	}
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
	* {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		transform: none !important;
	}
}
</style>
