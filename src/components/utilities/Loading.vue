<template>
	<div class="loading flex" v-if="loading" :style="loadingStyleObject">
		<h1>Loading...</h1>
	</div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { useSettingsStore } from "../../stores/settings.store";
defineProps({
	loading: { type: Boolean, required: true },
});
const store = useSettingsStore();
const loadingStyleObject = computed(()=>({ 'background-color': `var(--p-${store.currentTheme.group}-950)` }))
</script>

<style lang="scss" scoped>
.loading {
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	position: absolute;
	z-index: 1;
}
</style>
