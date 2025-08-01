<template>
	<Layout />
	<ConnectionDiagnostic />
	<div class="application" ref="viewportRef">
		<RouterView />
		<WebsocketConnection v-if="showWebsocketConnection" :container-ref="viewportRef" />
	</div>
</template>

<script setup lang="ts">
import { useRxjs } from "topsyde-utils";
import { computed, useTemplateRef } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import WebsocketConnection from "./components/application/WebsocketConnection.vue";
import Layout from "./components/layout/Layout.vue";
import ConnectionDiagnostic from "./components/utilities/connection/ConnectionDiagnostic.vue";

const viewportRef = useTemplateRef("viewportRef");
const route = useRoute();
const router = useRouter();
const showWebsocketConnection = computed(() => !["login", "home"].includes(route.name as string));
useRxjs("system", {
	disconnected: () => router.push({ name: "home" }),
});
</script>

<style lang="scss" scoped>
$layoutHeight: 55px;

.application {
	min-height: calc(100vh - $layoutHeight);
	height: calc(100vh - $layoutHeight);
	max-height: calc(100vh - $layoutHeight);
	overflow-y: auto;
	max-width: 100%;
	width: 100%;
	position: relative;

	/* Ensure proper scrolling on mobile */
	-webkit-overflow-scrolling: touch;
	overscroll-behavior-y: contain;

	/* Fix for mobile viewport height issues */
	@supports (-webkit-touch-callout: none) {
		/* iOS specific fix */
		min-height: calc(100% - $layoutHeight);
		height: calc(-webkit-fill-available - $layoutHeight);
		max-height: calc(-webkit-fill-available - $layoutHeight);
	}

	/* Dynamic viewport height for mobile browsers */
	@supports (height: 100dvh) {
		min-height: calc(100dvh - $layoutHeight);
		height: calc(100dvh - $layoutHeight);
		max-height: calc(100dvh - $layoutHeight);
	}
}
</style>
