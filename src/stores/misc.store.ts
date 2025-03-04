import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export type ToastPosition = "center" | "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type ToastMessage = {
	msg: string;
	title?: string;
	duration?: number;
	severity?: "error" | "secondary" | "info" | "success" | "warn" | "contrast";
	position?: ToastPosition;
};
export const useMiscStore = defineStore(
	"miscStore",
	() => {
		const toasts = ref(<ToastMessage[]>[]);
		function toast(msg: ToastMessage) {
			console.log("toast", msg);
			toasts.value.push(msg);
		}
		return {
			toasts,
			toast,
		};
	},
	{},
);

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMiscStore, import.meta.hot));
}
