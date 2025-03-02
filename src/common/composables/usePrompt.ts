import { RxjsNamespaces, useRxjs } from "topsyde-utils";
import { AppRxjsNamespaces, Entity } from "../types/types";

export type PromptChoice = boolean | number;
export interface I_PromptPayload {
	time: number;
	message: string;
	from: Entity;
	metadata?: Record<string, string>;
	callback: (choice: PromptChoice, data: Omit<I_PromptPayload, "callback">) => void;
}

const usePrompt = () => {
	const rxjs = useRxjs<RxjsNamespaces<AppRxjsNamespaces>>("prompt");

	function next(payload: I_PromptPayload) {
		rxjs.$next("prompt", payload);
	}
	return {
		next,
	};
};
export default usePrompt;
