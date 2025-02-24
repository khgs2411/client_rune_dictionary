<template>
	<div class="match flex column gap large" v-debug>
		<div class="viewport" v-debug>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
			ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
			deserunt mollit anim id est laborum.
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { Panel } from "primevue";
</script>

<style lang="scss" scoped>
.match {
	background-image: url("/match.webp");
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;
	height: 100%;
	width: 100%;
	padding: 0;
	margin: 0;
	position: relative;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
	}

	.viewport {
		background: var(--p-content-background);
		height: 90%;
		width: 90%;
		padding: 1%;
		border-radius: var(--p-border-radius-md);
	}
}
</style>
