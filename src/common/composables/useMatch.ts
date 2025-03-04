import MatchAPI from "../../api/match.api";
import { Entity } from "../types/types";
import useUtils from "./useUtils";

const MATCH_CHANNEL = "match";
const MATCH_MESSAGE = " Would like to battle";

export { MATCH_CHANNEL, MATCH_MESSAGE };

const useMatch = () => {
	const api = new MatchAPI();
	const utils = useUtils();

	async function challenge(whoami: Entity, target: Entity) {
		try {
			const response = await api.createMatch(whoami, target);
		} catch (e) {
			utils.toast.error("Something went wrong", 'top-left');
		}
	}

	async function accept(matchId: string) {
		try {
			const response = await api.acceptMatch(matchId);
		} catch (e) {
			utils.toast.error("Something went wrong", 'top-left');
		}
	}

	async function decline(matchId: string) {
		try {
			const response = await api.decline(matchId);
		} catch (e) {
			utils.toast.error("Something went wrong", 'top-left');
		}
	}

	return {
		challenge,
		accept,
		decline,
	};
};
export default useMatch;
