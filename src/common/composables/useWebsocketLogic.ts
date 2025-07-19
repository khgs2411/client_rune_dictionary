import { useRxjs } from "topsyde-utils";
import useMatch from "../../components/match/useMatch";
import { WebsocketClient } from "./useWebsocketInterface";

const useWebsocketLogic = (ws: WebsocketClient) => {
    const match$ = useMatch();
    useRxjs('match', match$.onWebsocketEvents(ws));

   

}

export default useWebsocketLogic;