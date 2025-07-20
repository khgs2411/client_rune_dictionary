import { useRxjs } from "topsyde-utils";
import useMatchWebsocketEventHandler from "../../components/match/useMatchWebsocketEventHandler";
import { WebsocketClient } from "./useWebsocketInterface";

const useWebsocketLogic = (ws: WebsocketClient) => {
    const matchWebsocketHandler$ = useMatchWebsocketEventHandler();
    useRxjs('match', matchWebsocketHandler$.outputEvents(ws));
}

export default useWebsocketLogic;