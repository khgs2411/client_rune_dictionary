import { E_WebsocketMessageType, WebsocketStructuredMessage } from "topsyde-utils";
import { I_UseWSM } from "./useWSM";
import usePrompt, { PromptChoice, PromptData } from "./usePrompt";
import { MATCH_MESSAGE } from "./useMatch";
import useMatch from "./useMatch";
const useWebsocketLogic = (wsm$: I_UseWSM) => {
	const prompt$ = usePrompt();
	const match$ = useMatch();

	if (wsm$.is(E_WebsocketMessageType.SYSTEM)) {
		console.log(wsm$.data);
	}

	if (wsm$.is(E_WebsocketMessageType.ERROR)) {
		console.log(wsm$.data);
	}

	if (wsm$.is("match")) {
		prompt$.next({
			message: MATCH_MESSAGE,
			from: wsm$.client.value,
			time: 10,
			metadata: wsm$.data,
			callback: (choice: PromptChoice, data: PromptData<WebsocketStructuredMessage>) => {
				if (!data.metadata) return;
				console.log(choice, data.metadata);
			},
		});
	}
};
export default useWebsocketLogic;
