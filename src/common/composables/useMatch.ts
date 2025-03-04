import MatchAPI from "../../api/match.api";
import { Entity } from "../types/types";

const MATCH_CHANNEL = "match";
const MATCH_MESSAGE = " Would like to battle";

export { MATCH_CHANNEL, MATCH_MESSAGE };

const useMatch = () => {
	const api = new MatchAPI();

	function challenge(whoami: Entity, target: Entity) {
		return api.createMatch(whoami, target);
	}

	function accept(matchId: string) {
		return api.acceptMatch(matchId);
	}

	function decline(matchId: string) {
		return api.decline(matchId);
	}

	return {
		challenge,
		accept,
		decline,
	};
};
export default useMatch;
