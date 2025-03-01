import { Guards, Lib } from "topsyde-utils";
import { ToastPosition, useMiscStore } from "../../stores/misc.store";

const useUtils = () => {
	const miscStore = useMiscStore();

	// Toast wrapper functions
	const toast = {
		/**
		 * Display an error toast notification
		 * @param message The message to display
		 * @param position Toast position (default: 'center')
		 * @param duration Duration in ms (default: 3000)
		 */
		error: (message: string, position: ToastPosition|undefined = undefined, duration: number = 3000) => {
			miscStore.toast({
				msg: message,
				position,
				severity: 'error',
				duration
			});
		},

		/**
		 * Display a success toast notification
		 * @param message The message to display
		 * @param position Toast position (default: 'center')
		 * @param duration Duration in ms (default: 3000)
		 */
		success: (message: string, position: ToastPosition|undefined = undefined, duration: number = 3000) => {
			miscStore.toast({
				msg: message,
				position,
				severity: 'success',
				duration
			});
		},

		/**
		 * Display an information toast notification
		 * @param message The message to display
		 * @param position Toast position (default: 'center')
		 * @param duration Duration in ms (default: 3000)
		 */
		info: (message: string, position: ToastPosition|undefined = undefined, duration: number = 3000) => {
			miscStore.toast({
				msg: message,
				position,
				severity: 'info',
				duration
			});
		}
	};

	return {
		lib: Lib,
		guards: Guards,
		toast
	};
};

export default useUtils;
