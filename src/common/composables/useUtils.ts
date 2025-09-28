import { Guards, Lib } from "topsyde-utils";
import { ToastPosition, useMiscStore } from "../../stores/misc.store";
import useDevice from "./useDevice";

const useUtils = () => {
	const miscStore = useMiscStore();
	const device = useDevice();

	// Toast wrapper functions with mobile detection
	const toast = {
		/**
		 * Display an error toast notification
		 * @param message The message to display
		 * @param position Toast position (default: 'center')
		 * @param duration Duration in ms (default: 3000)
		 * @param forceShow Force show toast even on mobile (default: false)
		 */
		error: (message: string, position: ToastPosition | undefined = undefined, duration: number = 3000, forceShow: boolean = false) => {
			// Skip toast on mobile unless explicitly forced
			if (device.isMobile.value && !forceShow) {
				Lib.Warn(`[Toast Skipped - Mobile] Error: ${message}`);
				return;
			}

			miscStore.toast({
				msg: message,
				position,
				severity: "error",
				duration,
			});
		},

		/**
		 * Display a success toast notification
		 * @param message The message to display
		 * @param position Toast position (default: 'center')
		 * @param duration Duration in ms (default: 3000)
		 * @param forceShow Force show toast even on mobile (default: false)
		 */
		success: (message: string, position: ToastPosition | undefined = undefined, duration: number = 3000, forceShow: boolean = false) => {
			// Skip toast on mobile unless explicitly forced
			if (device.isMobile.value && !forceShow) {
				Lib.Log(`[Toast Skipped - Mobile] Success: ${message}`);
				return;
			}

			miscStore.toast({
				msg: message,
				position,
				severity: "success",
				duration,
			});
		},

		/**
		 * Display an information toast notification
		 * @param message The message to display
		 * @param position Toast position (default: 'center')
		 * @param duration Duration in ms (default: 3000)
		 * @param forceShow Force show toast even on mobile (default: false)
		 */
		info: (message: string, position: ToastPosition | undefined = undefined, duration: number = 3000, forceShow: boolean = false) => {
			// Skip toast on mobile unless explicitly forced
			if (device.isMobile.value && !forceShow) {
				Lib.Log(`[Toast Skipped - Mobile] Info: ${message}`);
				return;
			}

			miscStore.toast({
				msg: message,
				position,
				severity: "info",
				duration,
			});
		},
	};

	return {
		lib: Lib,
		guards: Guards,
		toast,
		device, // Expose device detection for other uses
	};
};

export default useUtils;
