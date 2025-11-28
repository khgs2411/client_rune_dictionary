<template>
	<div class="app-layout">
		<!-- Top Menu Bar -->
		<Menu></Menu>

		<main class="app-content">
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { useCacheBuster } from "./composables/useCacheBuster";
import Menu from "./layout/Menu.vue";

// Ensure URL always has current version for cache busting
const { version } = useCacheBuster();
console.log(`[App] Running version ${version}`);
</script>

<style scoped>
.app-layout {
	display: grid;
	grid-template-rows: auto 1fr;
	height: 100vh;
	overflow: hidden;
}

.app-content {
	overflow: hidden;
}
</style>
