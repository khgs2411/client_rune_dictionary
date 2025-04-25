import { E_WebsocketMessageType } from "topsyde-utils";
import useMatch from "./useMatch";
import { I_UseWSM } from "./useWSM";

const useWebsocketLogic = () => {
	const match$ = useMatch();
	
	function process(wsm$: I_UseWSM) {
		if (wsm$.is(E_WebsocketMessageType.SYSTEM)) {
			console.log(wsm$.data);
		}

		if (wsm$.is(E_WebsocketMessageType.ERROR)) {
			console.log(wsm$.data);
		}

		if (wsm$.is("match")) match$.onMatchRequest(wsm$);
	}

	return { process };
};
export default useWebsocketLogic;
