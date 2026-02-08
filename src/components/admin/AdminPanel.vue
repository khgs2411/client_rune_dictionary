<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="admin-backdrop" @click="handleClose" />

				<!-- Modal Container -->
				<Tabs v-model="activeTab" class="admin-frame" @wheel.stop>
					<!-- Atmospheric layers -->
					<div class="admin-glow" />
					<div class="admin-vignette" />

					<!-- Content wrapper -->
					<div class="admin-body">
						<!-- Header -->
						<div class="admin-header">
							<div class="header-left">
								<div class="header-icon-box">
									<Database class="header-icon" />
								</div>
								<div>
									<h2 class="admin-title">Admin Panel</h2>
									<p class="admin-subtitle">Manage game data: Attributes and Affixes</p>
								</div>
							</div>

							<!-- Tabs -->
							<TabsList class="admin-tabs-list">
								<TabsTrigger value="attributes" class="admin-tab">
									<Icon icon="game-icons:rune-stone" class="h-4 w-4" />
									Attributes
								</TabsTrigger>
								<TabsTrigger value="affixes" class="admin-tab">
									<Icon icon="game-icons:scroll-unfurled" class="h-4 w-4" />
									Affixes
								</TabsTrigger>
							</TabsList>

							<!-- Close Button -->
							<Button variant="ghost" size="icon" @click="handleClose" class="admin-close">
								<X class="h-4 w-4" />
							</Button>
						</div>

						<!-- Simple gradient divider (no diamond) -->
						<div class="admin-divider" />

						<!-- Content Area -->
						<div class="admin-content">
							<TabsContent value="attributes" class="mt-0 h-full">
								<div class="h-full grid grid-cols-[280px_1fr] gap-6">
									<div class="h-full overflow-hidden flex flex-col">
										<AttributeList @unsaved-warning="showUnsavedWarning = true" />
									</div>
									<div class="h-full overflow-hidden">
										<AttributeEditor />
									</div>
								</div>
							</TabsContent>

							<TabsContent value="affixes" class="mt-0 h-full">
								<AffixDesigner />
							</TabsContent>
						</div>
					</div>
				</Tabs>

				<!-- Unsaved Changes Dialog -->
				<div
					v-if="showUnsavedWarning"
					class="absolute inset-0 z-20 flex items-center justify-center"
					@click.self="showUnsavedWarning = false">
					<div class="unsaved-dialog">
						<h3 class="unsaved-title">Unsaved Changes</h3>
						<p class="unsaved-text">You have unsaved changes. Do you want to discard them?</p>
						<div class="unsaved-actions">
							<Button variant="outline" size="sm" @click="showUnsavedWarning = false" class="unsaved-btn-cancel">Cancel</Button>
							<Button variant="destructive" size="sm" @click="discardAndClose">Discard</Button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Database, X } from "lucide-vue-next";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeList, AttributeEditor } from "./attributes";
import { AffixDesigner } from "./affixes";
import { useAttributesStore } from "@/stores/attributes.store";
import { useAffixesStore } from "@/stores/affixes.store";
import { useSettingsStore } from "@/stores/settings.store";

const modelValue = defineModel<boolean>("open", { default: false });
const settingsStore = useSettingsStore();
const activeTab = ref("attributes");
const showUnsavedWarning = ref(false);
const attributesStore = useAttributesStore();
const affixesStore = useAffixesStore();

watch(modelValue, async (isOpen) => {
	settingsStore.gameControlsDisabled = isOpen;

	if (isOpen) {
		await attributesStore.loadAttributes();
	} else {
		attributesStore.discardChanges();
		attributesStore.forceSelectAttribute(null);
		affixesStore.discardChanges();
		affixesStore.forceSelectAffix(null);
	}
});

function handleClose() {
	if (attributesStore.hasUnsavedChanges || affixesStore.hasUnsavedChanges) {
		showUnsavedWarning.value = true;
		return;
	}
	modelValue.value = false;
}

function discardAndClose() {
	attributesStore.discardChanges();
	affixesStore.discardChanges();
	showUnsavedWarning.value = false;
	modelValue.value = false;
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   CSS CUSTOM PROPERTIES — admin purple palette
   ═══════════════════════════════════════════ */

.admin-frame {
	--admin: #9b7ed8;
	--admin-60: #9b7ed899;
	--admin-40: #9b7ed866;
	--admin-25: #9b7ed840;
	--admin-15: #9b7ed826;
	--admin-08: #9b7ed814;
}

/* ═══════════════════════════════════════════
   BACKDROP
   ═══════════════════════════════════════════ */

.admin-backdrop {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.85);
	backdrop-filter: blur(6px);
}

/* ═══════════════════════════════════════════
   FRAME — dark workshop container (no ornaments)
   ═══════════════════════════════════════════ */

.admin-frame {
	position: relative;
	z-index: 10;
	width: 1100px;
	height: 85vh;
	border-radius: 12px;
	overflow: hidden;
	border: 1px solid var(--admin-40);
	background: #0b0b13;
	box-shadow:
		0 0 50px var(--admin-08),
		0 0 100px rgba(0, 0, 0, 0.5),
		0 8px 40px rgba(0, 0, 0, 0.7);
}

/* ═══════════════════════════════════════════
   ATMOSPHERIC LAYERS (subtle, no shimmer)
   ═══════════════════════════════════════════ */

.admin-glow {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 1;
	background: radial-gradient(ellipse at 50% 0%, var(--admin-08), transparent 50%);
}

.admin-vignette {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 2;
	background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.35) 100%);
}

.admin-body {
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

.admin-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18px 24px 14px;
	flex-shrink: 0;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 14px;
}

.header-icon-box {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	background: linear-gradient(135deg, var(--admin-25), var(--admin-15));
	border: 1px solid var(--admin-40);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.header-icon {
	width: 20px;
	height: 20px;
	color: var(--admin);
}

.admin-title {
	font-size: 1.15rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.93);
	letter-spacing: 0.01em;
}

.admin-subtitle {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.3);
	margin-top: 2px;
}

/* ═══════════════════════════════════════════
   TABS — dark with purple accent
   ═══════════════════════════════════════════ */

.admin-tabs-list {
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 8px;
	padding: 3px;
}

.admin-tab {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	font-size: 0.8rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.4);
	border-radius: 6px;
	transition: all 0.2s ease;
}

.admin-tab:hover {
	color: rgba(255, 255, 255, 0.65);
}

.admin-tab[data-state="active"] {
	background: rgba(155, 126, 216, 0.12);
	color: var(--admin);
	box-shadow: 0 0 12px var(--admin-08);
}

/* ═══════════════════════════════════════════
   CLOSE BUTTON
   ═══════════════════════════════════════════ */

.admin-close {
	color: rgba(255, 255, 255, 0.3);
	border-radius: 6px;
}

.admin-close:hover {
	color: #f87171;
	background: rgba(248, 113, 113, 0.1);
}

/* ═══════════════════════════════════════════
   SIMPLE GRADIENT DIVIDER (no diamond)
   ═══════════════════════════════════════════ */

.admin-divider {
	height: 1px;
	margin: 0 24px 4px;
	background: linear-gradient(to right, transparent 0%, var(--admin-40) 50%, transparent 100%);
	flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   CONTENT AREA
   ═══════════════════════════════════════════ */

.admin-content {
	flex: 1;
	overflow: hidden;
	padding: 20px 24px 24px;
}

/* ═══════════════════════════════════════════
   UNSAVED CHANGES DIALOG
   ═══════════════════════════════════════════ */

.unsaved-dialog {
	background: #12121c;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	padding: 24px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
	max-width: 360px;
}

.unsaved-title {
	font-size: 0.95rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 8px;
}

.unsaved-text {
	font-size: 0.8rem;
	color: rgba(255, 255, 255, 0.4);
	margin-bottom: 20px;
	line-height: 1.5;
}

.unsaved-actions {
	display: flex;
	gap: 8px;
	justify-content: flex-end;
}

.unsaved-btn-cancel {
	border-color: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.5);
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
