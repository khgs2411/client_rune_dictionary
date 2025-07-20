import { E_WebsocketMessageType } from "topsyde-utils";
import useMatch from "../../components/match/useMatch";
import { I_UseWSM } from "./useWSM";

const useWebsocketEventHandler = () => {
	const match$ = useMatch();


	function process(wsm$: I_UseWSM): void {
		if (wsm$.is(E_WebsocketMessageType.SYSTEM)) {
			console.log(wsm$.data);
		}

		else if (wsm$.is(E_WebsocketMessageType.ERROR)) {
			console.log(wsm$.data);
		}

		else if (wsm$.is("match")) match$.onMatchRequest(wsm$);
		else if (wsm$.type.value?.startsWith("match.")) {
			// Route match game events to the game event handler
			match$.onGameEvent(wsm$);
		}
		else {
			console.log(wsm$.data)
		}
	}

	return { process };
};
export default useWebsocketEventHandler;
