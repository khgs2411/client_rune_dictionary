<template>
	<div class="toast">
		<PrimeToast position="top-right" group="top-right"></PrimeToast>
		<PrimeToast position="top-center" group="top-center"></PrimeToast>
		<PrimeToast position="top-left" group="top-left"></PrimeToast>
		<PrimeToast position="center" group="center"></PrimeToast>
		<PrimeToast position="bottom-right" group="bottom-right"></PrimeToast>
		<PrimeToast position="bottom-center" group="bottom-center"></PrimeToast>
		<PrimeToast position="bottom-left" group="bottom-left"></PrimeToast>
	</div>
</template>

<script lang="ts" setup>
import PrimeToast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { computed, watch } from "vue";
import { ToastMessage, ToastPosition, useMiscStore } from "../../stores/misc.store";

const store = useMiscStore();
const toasts = computed(() => store.toasts);

const toast = useToast();
const defaultPosition: ToastPosition = "top-right";
const defaultTitle = {
	info: "Information",
	success: "Success",
	warn: "Warning",
	error: "Error",
	secondary: "Information",
	contrast: "Information",
};
function show(obj: ToastMessage) {
	toast.add({ severity: obj.severity || "info", summary: obj.title || defaultTitle[obj.severity || "info"], detail: obj.msg, life: obj.duration || 3000, group: obj.position || defaultPosition });
}

watch(
	toasts,
	(value) => {
		if (value && value.length > 0) {
			value.forEach((t) => {
				console.log("toast", t);
				show(t);
			});
			store.toasts = [];
		}
	},
	{
		immediate: true,
		deep: true,
	},
);
</script>

<style lang="scss" scoped>
.toast {
}
</style>
