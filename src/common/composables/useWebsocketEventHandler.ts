import { E_WebsocketMessageType, Lib, NamespaceActions } from "topsyde-utils";
import useMatchWebsocketEventHandler from "../../components/match/useMatchWebsocketEventHandler";
import { I_UseWSM } from "./useWSM";
import { WebsocketClient } from "./useWebsocketInterface";

export interface I_WebsocketEventHandler {
	onWebsocketEvents: (wsm$: I_UseWSM) => void;
	outputEvents: (ws: WebsocketClient) => NamespaceActions;
}

export interface I_WebsocketEventHandlerInterface {
	process: (wsm$: I_UseWSM) => void;
}

const useWebsocketEventHandler = (): I_WebsocketEventHandlerInterface => {
	const matchEventHandler$ = useMatchWebsocketEventHandler();

	function process(wsm$: I_UseWSM): void {
		if (wsm$.is(E_WebsocketMessageType.SYSTEM)) {
			Lib.Log("useWebsocketEventHandler->process->wsm.isSystem ", wsm$.data);
		} else if (wsm$.is(E_WebsocketMessageType.ERROR)) {
			Lib.$Log("useWebsocketEventHandler->process->wsm.isError ", wsm$.data);
		} else if (wsm$.type.value?.startsWith("match")) {
			// Route match game events to the game event handler
			matchEventHandler$.onWebsocketEvents(wsm$);
		} else {
			Lib.$Log(wsm$.data);
		}
	}

	return { process };
};
export default useWebsocketEventHandler;
