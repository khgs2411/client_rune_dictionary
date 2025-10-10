<template>
	<div class="app-layout">
		<Menu />
		<main class="app-content">
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Menu from "./layout/Menu.vue";
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
