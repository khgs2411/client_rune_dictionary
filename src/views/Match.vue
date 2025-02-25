<template>
	<div class="match flex column gap large" v-debug>
		<div class="viewport" v-debug>
			<Chat />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { Panel } from "primevue";
import Chat from "../components/application/Chat.vue"
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

	

	.viewport {
		background: var(--p-content-background);
		height: 90%;
		width: 90%;
		padding: 1%;
		border-radius: var(--p-border-radius-md);
	}
}
</style>
