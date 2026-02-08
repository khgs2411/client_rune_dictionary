<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="settings.debug.showGrimoire" class="fixed inset-0 z-50 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="grimoire-backdrop" @click="close" />

				<!-- Book Container -->
				<Tabs v-model="activeTab" class="grimoire-frame">
					<!-- Shimmer sweep -->
					<div class="grimoire-shimmer" />

					<!-- Corner ornaments -->
					<div class="corner-ornament tl" />
					<div class="corner-ornament tr" />
					<div class="corner-ornament bl" />
					<div class="corner-ornament br" />

					<!-- Atmospheric layers -->
					<div class="grimoire-glow" />
					<div class="grimoire-vignette" />

					<!-- Content wrapper (above atmosphere) -->
					<div class="grimoire-body">
						<!-- Header -->
						<div class="grimoire-header">
							<div class="header-left">
								<!-- Emblem Ring -->
								<div class="emblem-ring">
									<div class="emblem-inner">
										<Icon icon="game-icons:spell-book" class="emblem-icon" />
									</div>
								</div>
								<div>
									<h2 class="grimoire-title">Grimoire</h2>
									<p class="grimoire-subtitle">Your collection of arcane knowledge</p>
								</div>
							</div>

							<!-- Tabs -->
							<TabsList class="grimoire-tabs-list">
								<TabsTrigger value="skills" class="grimoire-tab">
									<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4" />
									Skills
								</TabsTrigger>
								<TabsTrigger value="loadout" class="grimoire-tab">
									<Icon icon="game-icons:shoulder-armor" class="h-4 w-4" />
									Loadout
								</TabsTrigger>
							</TabsList>

							<!-- Close Button -->
							<Button variant="ghost" size="icon" @click="close" class="grimoire-close">
								<Icon icon="radix-icons:cross-2" class="h-4 w-4" />
							</Button>
						</div>

						<!-- Ornate Divider -->
						<div class="main-divider">
							<span class="divider-line" />
							<span class="divider-diamond" />
							<span class="divider-line" />
						</div>

						<!-- Content Area -->
						<div class="grimoire-content">
							<TabsContent value="skills" class="mt-0 h-full">
								<GrimoireSkillsPage />
							</TabsContent>
							<TabsContent value="loadout" class="mt-0 h-full">
								<GrimoireLoadoutPage />
							</TabsContent>
						</div>
					</div>
				</Tabs>
			</div>
		</Transition>
	</Teleport>

	<!-- Rune Forge Overlay (separate modal) -->
	<RuneForgeOverlay />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useSettingsStore } from "@/stores/settings.store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GrimoireSkillsPage from "./GrimoireSkillsPage.vue";
import GrimoireLoadoutPage from "./GrimoireLoadoutPage.vue";
import RuneForgeOverlay from "@/components/forge/RuneForgeOverlay.vue";

const settings = useSettingsStore();
const activeTab = ref<"skills" | "loadout">("skills");

function close() {
	settings.debug.showGrimoire = false;
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   CSS CUSTOM PROPERTIES — grimoire gold palette
   ═══════════════════════════════════════════ */

.grimoire-frame {
	--accent: #d9aa5a;
	--accent-60: #d9aa5a99;
	--accent-40: #d9aa5a66;
	--accent-25: #d9aa5a40;
	--accent-15: #d9aa5a26;
	--accent-08: #d9aa5a14;
}

/* ═══════════════════════════════════════════
   BACKDROP
   ═══════════════════════════════════════════ */

.grimoire-backdrop {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.85);
	backdrop-filter: blur(6px);
}

/* ═══════════════════════════════════════════
   FRAME — the enchanted book container
   ═══════════════════════════════════════════ */

.grimoire-frame {
	position: relative;
	z-index: 10;
	width: 950px;
	height: 85vh;
	border-radius: 14px;
	overflow: hidden;
	border: 1px solid var(--accent-40);
	background: #0b0b13;
	box-shadow:
		0 0 60px var(--accent-08),
		0 0 120px rgba(0, 0, 0, 0.5),
		0 8px 40px rgba(0, 0, 0, 0.7);
	display: flex;
	flex-direction: column;
}

/* ═══════════════════════════════════════════
   SHIMMER — diagonal light sweep
   ═══════════════════════════════════════════ */

.grimoire-shimmer {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
	z-index: 5;
	border-radius: 14px;
}

.grimoire-shimmer::after {
	content: "";
	position: absolute;
	top: -100%;
	left: -100%;
	width: 300%;
	height: 300%;
	background: linear-gradient(
		50deg,
		transparent 35%,
		rgba(255, 255, 255, 0.012) 42%,
		rgba(255, 255, 255, 0.03) 50%,
		rgba(255, 255, 255, 0.012) 58%,
		transparent 65%
	);
	animation: shimmerSweep 6s ease-in-out infinite;
}

@keyframes shimmerSweep {
	0%,
	100% {
		transform: translateX(-40%) translateY(-40%);
	}
	50% {
		transform: translateX(20%) translateY(20%);
	}
}

/* ═══════════════════════════════════════════
   CORNER ORNAMENTS
   ═══════════════════════════════════════════ */

.corner-ornament {
	position: absolute;
	width: 20px;
	height: 20px;
	pointer-events: none;
	z-index: 6;
	opacity: 0.6;
}

.corner-ornament.tl {
	top: 10px;
	left: 10px;
	border-top: 1.5px solid var(--accent-60);
	border-left: 1.5px solid var(--accent-60);
}

.corner-ornament.tr {
	top: 10px;
	right: 10px;
	border-top: 1.5px solid var(--accent-60);
	border-right: 1.5px solid var(--accent-60);
}

.corner-ornament.bl {
	bottom: 10px;
	left: 10px;
	border-bottom: 1.5px solid var(--accent-60);
	border-left: 1.5px solid var(--accent-60);
}

.corner-ornament.br {
	bottom: 10px;
	right: 10px;
	border-bottom: 1.5px solid var(--accent-60);
	border-right: 1.5px solid var(--accent-60);
}

/* ═══════════════════════════════════════════
   ATMOSPHERIC LAYERS
   ═══════════════════════════════════════════ */

.grimoire-glow {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 1;
	background: radial-gradient(ellipse at 50% 0%, var(--accent-15), transparent 55%);
}

.grimoire-vignette {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 2;
	background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.45) 100%);
}

.grimoire-body {
	position: relative;
	z-index: 3;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

/* ═══════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════ */

.grimoire-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px 14px;
	flex-shrink: 0;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 14px;
}

/* ═══════════════════════════════════════════
   EMBLEM — grimoire icon with concentric ring
   ═══════════════════════════════════════════ */

.emblem-ring {
	width: 52px;
	height: 52px;
	border-radius: 50%;
	border: 1.5px solid var(--accent-40);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow:
		0 0 24px var(--accent-15),
		inset 0 0 16px var(--accent-08);
	animation: ringBreath 3.5s ease-in-out infinite;
	flex-shrink: 0;
}

.emblem-inner {
	width: 38px;
	height: 38px;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--accent-15), var(--accent-08));
	display: flex;
	align-items: center;
	justify-content: center;
}

.emblem-icon {
	width: 20px;
	height: 20px;
	color: var(--accent);
	filter: drop-shadow(0 0 6px var(--accent-40));
}

@keyframes ringBreath {
	0%,
	100% {
		box-shadow:
			0 0 24px var(--accent-15),
			inset 0 0 16px var(--accent-08);
	}
	50% {
		box-shadow:
			0 0 36px var(--accent-25),
			inset 0 0 20px var(--accent-15);
	}
}

/* ═══════════════════════════════════════════
   TITLE — Georgia serif with amber glow
   ═══════════════════════════════════════════ */

.grimoire-title {
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.35rem;
	font-weight: 700;
	letter-spacing: 0.03em;
	color: rgba(255, 255, 255, 0.95);
	text-shadow: 0 0 20px var(--accent-25);
	line-height: 1.2;
}

.grimoire-subtitle {
	font-size: 0.7rem;
	color: var(--accent-60);
	letter-spacing: 0.04em;
	margin-top: 2px;
}

/* ═══════════════════════════════════════════
   TABS — dark adapted with amber accents
   ═══════════════════════════════════════════ */

.grimoire-tabs-list {
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 8px;
	padding: 3px;
}

.grimoire-tab {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	font-size: 0.8rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.45);
	border-radius: 6px;
	transition: all 0.2s ease;
}

.grimoire-tab:hover {
	color: rgba(255, 255, 255, 0.7);
}

.grimoire-tab[data-state="active"] {
	background: rgba(217, 170, 90, 0.12);
	color: var(--accent);
	box-shadow: 0 0 12px var(--accent-08);
}

/* ═══════════════════════════════════════════
   CLOSE BUTTON
   ═══════════════════════════════════════════ */

.grimoire-close {
	color: rgba(255, 255, 255, 0.3);
	border-radius: 6px;
}

.grimoire-close:hover {
	color: #f87171;
	background: rgba(248, 113, 113, 0.1);
}

/* ═══════════════════════════════════════════
   ORNATE DIVIDER — matching AbilityCard
   ═══════════════════════════════════════════ */

.main-divider {
	display: flex;
	align-items: center;
	gap: 0;
	padding: 0 24px 6px;
	flex-shrink: 0;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(to right, transparent, var(--accent-40));
}

.divider-line:last-child {
	background: linear-gradient(to left, transparent, var(--accent-40));
}

.divider-diamond {
	width: 7px;
	height: 7px;
	transform: rotate(45deg);
	border: 1px solid var(--accent-40);
	background: var(--accent-08);
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   CONTENT AREA
   ═══════════════════════════════════════════ */

.grimoire-content {
	flex: 1;
	overflow: hidden;
	padding: 20px 24px 24px;
	position: relative;
}

/* ═══════════════════════════════════════════
   TRANSITION
   ═══════════════════════════════════════════ */

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
