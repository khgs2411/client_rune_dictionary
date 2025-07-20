import { E_WebsocketMessageType, NamespaceActions } from "topsyde-utils";
import useMatchWebsocketEventHandler from "../../components/match/useMatchWebsocketEventHandler";
import { I_UseWSM } from "./useWSM";
import { WebsocketClient } from "./useWebsocketInterface";

export interface I_WebsocketEventHandler {
	onWebsocketEvents: (wsm$: I_UseWSM) => void;
	outputEvents: (ws: WebsocketClient) => NamespaceActions;
}

const useWebsocketEventHandler = () => {
	const matchEventHandler$ = useMatchWebsocketEventHandler();


	function process(wsm$: I_UseWSM): void {
		if (wsm$.is(E_WebsocketMessageType.SYSTEM)) {
			console.log(wsm$.data);
		}

		else if (wsm$.is(E_WebsocketMessageType.ERROR)) {
			console.log(wsm$.data);
		}

		
		else if (wsm$.type.value?.startsWith("match.")) {
			// Route match game events to the game event handler
			matchEventHandler$.onWebsocketEvents(wsm$);
		}
		else {
			console.log(wsm$.data)
		}
	}

	return { process };
};
export default useWebsocketEventHandler;
