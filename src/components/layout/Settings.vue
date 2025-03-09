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
					<h3 class="margin zero large no-margin-top">Theme</h3>
					<div class="flex wrap gap">
						<div @click="setTheme(color)" v-ripple class="color-choice" v-for="color in colorPresets" :style="{ background: color.value }"></div>
					</div>
				</div>
				<div class="flex-spacer"></div>
				<div class="log-out">
					<Button text @click="logout" label="Log Out" icon="pi pi-sign-out" severity="danger" />
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
import { useSettingsStore } from "../../stores/settings.store";
import { COLOR_PRESETS } from "../../common/consts/app.consts";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import useAuth from "../../common/composables/useAuth";

const store = useSettingsStore();
const visible = computed(() => store.visible);
const router = useRouter();
const auth = useAuth();

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

function logout() {
	closeSettings();
	auth.logout();
	router.push({ name: "login" });
}
</script>
<style lang="scss" scoped>
@use "../../assets/css/variables.scss" as *;

.settings-sidebar {
	padding: 1rem;
	height: 100%;
	width: 100%;
	overflow-x: hidden;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	gap: $spacing;

	min-height: 100%;

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

	.flex-spacer {
		flex: 1;
		min-height: $spacing;
	}

	.log-out {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		align-self: flex-end;
		margin-top: auto;
	}
}
</style>
