<template>
	<div class="match flex column gap large">
		<Panel header="Header">
			<p style="height:50vh">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
				aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
				officia deserunt mollit anim id est laborum.
			</p>
		</Panel>
	</div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { Panel } from "primevue";
</script>

<style lang="scss" scoped>
.match {
	background-image: url("/match.webp");
	background-size: contain;
	background-position: center;
	// background-repeat: no-repeat;
	height: 100%;
	width: 100%;
	padding: 0 10%;
}
</style>
