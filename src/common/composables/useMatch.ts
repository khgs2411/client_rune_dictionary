import MatchAPI from "../../api/match.api";
import { Entity } from "../types/types";

const useMatch = () => {
	const api = new MatchAPI();

	function createMatch(whoami: Entity, target: Entity) {
		return api.createMatch(whoami, target);
	}

	return {
		createMatch,
	};
};
export default useMatch;
