<template>
	<Drawer position="right" :visible="visible" @update:visible="closeSettings">
		<template #container>
			<div class="settings-sidebar flex column start gap large">
				<div class="close flex end w-100">
					<div class="flex close-btn" v-ripple @click="closeSettings">
						<Icon width="1.2rem" height="1.2rem" icon="prime:times"></Icon>
					</div>
				</div>
				<div class="theme">
					<h3>Theme</h3>
					<div class="flex wrap gap">
						<div @click="setTheme(color)" v-ripple class="color-choice" v-for="color in colorPresets" :style="{ background: color.value }"></div>
					</div>
				</div>
			</div>
		</template>
	</Drawer>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { $dt } from "@primevue/themes";
import { Drawer } from "primevue";
import { computed } from "vue";
import { useSettingsStore } from "../../../stores/settings.store";
import { COLOR_PRESETS } from "../../consts/app.consts";

const store = useSettingsStore();
const visible = computed(() => store.visible);

function setTheme(color: { name: string; variable: string; value: any }) {
	store.setTheme(color);
}

const colorPresets = computed(() => {
	return COLOR_PRESETS.map((color) => ({
		...$dt(`${color}.500`),
	}));
});

function closeSettings() {
	store.setVisible(false);
}
</script>
<style lang="scss" scoped>
@use "../../../assets/css/variables.scss" as *;

.settings-sidebar {
	padding: 1rem;
	height: 100%;
	width: 100%;
	overflow-x: hidden;
	overflow-y: auto;

	.close {
		.close-btn {
			cursor: pointer;
			width: 1.2rem;
			height: 1.2rem;
		}
	}
	.color-choice {
		height: 2rem;
		width: 2rem;
		border-radius: 50%;
		cursor: pointer;
	}
}
</style>
