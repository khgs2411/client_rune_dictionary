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
	height: calc(100vh - $layoutHeight);
	overflow-y: auto;
}
</style>
