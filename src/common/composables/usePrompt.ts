import { RxjsNamespaces, useRxjs } from "topsyde-utils";
import { AppRxjsNamespaces, Entity } from "../types/types";

export type PromptChoice = boolean | number;
export type PromptData<T extends Record<string, any>> = Omit<I_PromptPayload<T>, "callback">;
export interface I_PromptPayload<T extends Record<string, any>> {
	time: number;
	message: string;
	from: Entity;
	metadata?: T;
	callback: (choice: PromptChoice, data: PromptData<T>) => void;
}

const usePrompt = () => {
	const rxjs = useRxjs<RxjsNamespaces<AppRxjsNamespaces>>("prompt", undefined, { static_instance: true });

	function next<T extends Record<string, any>>(payload: I_PromptPayload<T>) {
		rxjs.$next("prompt", payload);
	}

	function clear() {
		rxjs.$next("clear", {});
	}

	return {
		next,
		clear,
	};
};
export default usePrompt;
