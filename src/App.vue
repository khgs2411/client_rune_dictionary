<template>
	<Layout />
	<ConnectionDiagnostic />
	<div class="application">
		<RouterView />
	</div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Layout from "./components/layout/Layout.vue";
import ConnectionDiagnostic from "./components/utilities/connection/ConnectionDiagnostic.vue";
</script>
#
<style lang="scss" scoped>
$layoutHeight: 55px;

.application {
	height: calc(100vh - $layoutHeight - env(safe-area-inset-bottom));
	overflow-y: auto;
	-webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Mobile adjustments */
@media (max-width: 1024px) {
	.application {
		height: calc(100vh - $layoutHeight - env(safe-area-inset-bottom) - env(safe-area-inset-top));
		padding-bottom: env(safe-area-inset-bottom);
	}
}
</style>
