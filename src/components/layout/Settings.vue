<template>
	<Drawer position="right" :visible="visible" @update:visible="closeSettings">
		<template #container>
			<motion.div :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }" :transition="{ duration: 0.3, ease: 'easeOut' }" class="settings-sidebar">
				<!-- Header -->
				<div class="settings-header">
					<div class="settings-title-section">
						<Icon icon="lucide:settings" class="settings-icon" />
						<h2 class="settings-title">Settings</h2>
					</div>
					<Button severity="secondary" text @click="closeSettings" class="close-button" aria-label="Close settings">
						<Icon icon="lucide:x" />
					</Button>
				</div>

				<!-- Theme Section -->
				<Panel class="theme-section">
					<template #header>
						<div class="flex items-center gap-2">
							<Icon icon="lucide:palette" class="section-icon" />
							<span class="panel-title">Theme</span>
						</div>
					</template>
					<div class="panel-content space-y-4">
						<p class="panel-description">Customize your appearance</p>
						<!-- Dark/Light Toggle -->
						<div class="theme-toggle-section">
							<label class="theme-toggle-label">Appearance</label>
							<motion.div :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.3, delay: 0.1 }" class="theme-toggle-container">
								<!-- Toggle Switch Background -->
								<div class="theme-toggle-wrapper">
									<motion.div :animate="{ x: darkMode ? '100%' : '0%' }" :transition="{ type: 'spring', stiffness: 300, damping: 30 }" class="theme-toggle-slider" />

									<!-- Light Option -->
									<motion.button
										@click="setDarkMode(false)"
										:whileHover="{ scale: 1.05 }"
										:whileTap="{ scale: 0.98 }"
										:class="{ active: !darkMode }"
										class="theme-option theme-option-light"
										:aria-pressed="!darkMode"
										aria-label="Switch to light mode">
										<motion.div
											:animate="{
												rotate: darkMode ? 0 : 360,
												scale: darkMode ? 0.8 : 1,
											}"
											:transition="{ duration: 0.4, ease: 'easeOut' }">
											<Icon icon="lucide:sun" class="theme-icon" />
										</motion.div>
										<span class="theme-label">Light</span>
									</motion.button>

									<!-- Dark Option -->
									<motion.button
										@click="setDarkMode(true)"
										:whileHover="{ scale: 1.05 }"
										:whileTap="{ scale: 0.98 }"
										:class="{ active: darkMode }"
										class="theme-option theme-option-dark"
										:aria-pressed="darkMode"
										aria-label="Switch to dark mode">
										<motion.div
											:animate="{
												rotate: darkMode ? 360 : 0,
												scale: darkMode ? 1 : 0.8,
											}"
											:transition="{ duration: 0.4, ease: 'easeOut' }">
											<Icon icon="lucide:moon" class="theme-icon" />
										</motion.div>
										<span class="theme-label">Dark</span>
									</motion.button>
								</div>

								<!-- Current Theme Indicator -->
								<motion.div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ delay: 0.3 }" class="theme-indicator">
									<div class="theme-indicator-dot" />
									<span class="theme-indicator-text">
										{{ darkMode ? "Dark mode active" : "Light mode active" }}
									</span>
								</motion.div>
							</motion.div>
						</div>

						<!-- Color Presets -->
						<div class="color-presets-section">
							<label class="color-presets-label">Primary Color</label>
							<div class="color-presets-grid">
								<motion.div
									v-for="(color, index) in colorPresets"
									:key="color.name"
									:initial="{ opacity: 0, scale: 0.8 }"
									:animate="{ opacity: 1, scale: 1 }"
									:transition="{ duration: 0.2, delay: index * 0.05 }"
									@click="setTheme(color)"
									:style="{ background: color.value }"
									:class="{ 'ring-2 ring-offset-2 ring-primary': isCurrentTheme(color) }"
									class="color-choice"
									:aria-label="`Select ${color.name} theme`"
									role="button"
									tabindex="0"
									@keydown.enter="setTheme(color)"
									@keydown.space.prevent="setTheme(color)" />
							</div>
						</div>
					</div>
				</Panel>

				<!-- Spacer -->
				<div class="flex-1" />

				<!-- Footer -->
				<motion.div :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.3, delay: 0.2 }" class="settings-footer">
					<Button severity="danger" @click="logout" class="logout-button" aria-label="Sign out of your account">
						<Icon icon="lucide:log-out" class="mr-2 h-4 w-4" />
						Log Out
					</Button>
				</motion.div>
			</motion.div>
		</template>
	</Drawer>
</template>
<script lang="ts" setup>
import Button from "primevue/button";
import Panel from "primevue/panel";
import { Icon } from "@iconify/vue";
import { $dt } from "@primevue/themes";
import { motion } from "motion-v";
import Drawer from "primevue/drawer";
import { computed } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../../common/composables/useAuth";
import { COLOR_PRESETS } from "../../common/consts/app.consts";
import { useSettingsStore } from "../../stores/settings.store";

const store = useSettingsStore();
const visible = computed(() => store.visible);
const router = useRouter();
const auth = useAuth();
const darkMode = computed(() => store.darkMode);

function setTheme(color: { name: string; variable: string; value: any }) {
	store.setTheme(color);
}

function setDarkMode(value: boolean) {
	store.setDarkMode(value);
}

const colorPresets = computed(() => {
	return COLOR_PRESETS.map((color) => ({
		...$dt(`${color}.500`),
	}));
});

function isCurrentTheme(color: { name: string }) {
	return store.currentTheme?.name === color.name;
}

function closeSettings() {
	store.setVisible(false);
}

function logout() {
	closeSettings();
	auth.logout();
	router.push({ name: "login" });
}
</script>
<style lang="scss" scoped>
.settings-sidebar {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100%;
	background: var(--p-content-background);
	color: var(--p-text-color);
	overflow: hidden;
}

.settings-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.5rem;
	border-bottom: 1px solid var(--p-content-border-color);
	background: var(--p-content-background);
	position: relative;

	&::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 1.5rem;
		right: 1.5rem;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--p-primary-color), transparent);
	}
}

.settings-title-section {
	display: flex;
	align-items: center;
	gap: 0.75rem;

	.settings-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--p-primary-color);
	}

	.settings-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--p-text-color);
		margin: 0;
	}
}

.close-button {
	transition: all 0.2s ease;

	&:hover {
		background: var(--p-highlight-bg);
		transform: scale(1.05);
	}

	&:deep(.lucide-x) {
		width: 1rem;
		height: 1rem;
	}
}

.theme-section {
	margin: 1.5rem;
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 0.5rem;
	overflow: hidden;

	.panel-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--p-text-color);
	}

	.panel-description {
		font-size: 0.875rem;
		color: var(--p-text-muted-color);
		margin-bottom: 1rem;
	}

	.panel-content {
		padding: 1.5rem;
	}

	&:deep(.p-panel-header) {
		background: var(--p-content-background);
		border-bottom: 1px solid var(--p-content-border-color);
		padding: 1rem 1.5rem;
	}

	&:deep(.p-panel-content) {
		padding: 0;
	}

	.section-icon {
		width: 1rem;
		height: 1rem;
		color: var(--p-primary-color);
	}
}

.theme-toggle-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;

	.theme-toggle-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--p-text-color);
		margin-bottom: 0.25rem;
		display: block;
	}

	.theme-toggle-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.theme-toggle-wrapper {
		position: relative;
		display: flex;
		background: var(--p-content-border-color);
		border-radius: 0.75rem;
		padding: 0.25rem;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--p-content-border-color);
	}

	.theme-toggle-slider {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		width: calc(50% - 0.25rem);
		height: calc(100% - 0.5rem);
		background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-600));
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 1;
	}

	.theme-option {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 2;
		color: var(--p-text-color);
		font-weight: 500;
		font-size: 0.875rem;

		&.active {
			color: white;

			.theme-icon {
				color: white;
			}

			.theme-label {
				color: white;
			}
		}

		&:not(.active) {
			&:hover {
				background: var(--p-highlight-bg);
				color: var(--p-primary-color);

				.theme-icon {
					color: var(--p-primary-color);
				}
			}
		}

		.theme-icon {
			width: 1rem;
			height: 1rem;
			transition: all 0.2s ease;
		}

		.theme-label {
			font-size: 0.875rem;
			font-weight: 500;
			transition: all 0.2s ease;
		}
	}

	.theme-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--p-highlight-bg);
		border-radius: 0.5rem;
		border: 1px solid var(--p-content-border-color);

		.theme-indicator-dot {
			width: 0.5rem;
			height: 0.5rem;
			border-radius: 50%;
			background: var(--p-primary-color);
			flex-shrink: 0;
		}

		.theme-indicator-text {
			font-size: 0.75rem;
			color: var(--p-text-color);
			opacity: 0.8;
			font-weight: 500;
		}
	}
}

.color-presets-section {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;

	.color-presets-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--p-text-color);
		display: block;
		margin-bottom: 0.5rem;
	}

	.color-presets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(2.5rem, 1fr));
		gap: 0.75rem;
		max-width: 100%;

		.color-choice {
			aspect-ratio: 1;
			border-radius: 50%;
			cursor: pointer;
			transition: all 0.2s ease;
			position: relative;
			min-height: 2.5rem;
			border: 2px solid transparent;

			&:hover {
				transform: scale(1.1);
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
			}

			&:focus {
				outline: none;
				ring-width: 2px;
				ring-color: var(--p-primary-color);
				ring-offset-width: 2px;
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}
}

.settings-footer {
	margin-top: auto;
	padding: 1.5rem;
	border-top: 1px solid var(--p-content-border-color);
	background: var(--p-content-background);

	.logout-button {
		width: 100%;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s ease;

		&:hover {
			transform: translateY(-1px);
			box-shadow: 0 4px 8px rgba(220, 38, 127, 0.3);
		}
	}
}

// Responsive adjustments
@media (max-width: 768px) {
	.settings-header {
		padding: 1rem;

		.settings-title {
			font-size: 1.125rem;
		}
	}

	.theme-section {
		margin: 1rem;
	}

	.settings-footer {
		padding: 1rem;
	}

	.color-presets-grid {
		grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
		gap: 0.5rem;

		.color-choice {
			min-height: 2rem;
		}
	}
}

// Dark mode specific adjustments
:deep(.dark) {
	.settings-sidebar {
		background: var(--p-content-background);
	}
}

// PrimeVue Drawer overrides to maintain compatibility
:deep(.p-drawer) {
	background: var(--p-content-background) !important;

	.p-drawer-content {
		background: var(--p-content-background) !important;
		padding: 0 !important;
	}
}
</style>
