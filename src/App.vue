<template>
	<Layout />
	<ConnectionDiagnostic />
	<div class="application" ref="viewportRef">
		<RouterView />
		<WebsocketConnection :container-ref="viewportRef" />
	</div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Layout from "./components/layout/Layout.vue";
import ConnectionDiagnostic from "./components/utilities/connection/ConnectionDiagnostic.vue";
import { useTemplateRef } from "vue";
import WebsocketConnection from "./components/application/WebsocketConnection.vue";

const viewportRef = useTemplateRef("viewportRef");


</script>

<style lang="scss" scoped>
$layoutHeight: 55px;

.application {
	min-height: calc(100vh - $layoutHeight);
	height: calc(100vh - $layoutHeight);
	max-height: calc(100vh - $layoutHeight);
	overflow-y: auto;

	/* Fix for mobile viewport height issues */
	@supports (-webkit-touch-callout: none) {
		/* iOS specific fix */
		min-height: calc(100% - $layoutHeight);
		height: calc(-webkit-fill-available - $layoutHeight);
		max-height: calc(-webkit-fill-available - $layoutHeight);
	}
}
</style>
