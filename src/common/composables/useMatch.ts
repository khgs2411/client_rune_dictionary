import { computed, ref } from "vue";
import MatchAPI from "../../api/match.api";
import { Entity } from "../types/types";
import useAuth from "./useAuth";
import useUtils from "./useUtils";
import usePrompt, { PromptChoice, PromptData } from "./usePrompt";
import { WebsocketStructuredMessage } from "topsyde-utils";
import { I_UseWSM } from "./useWSM";

const MATCH_CHANNEL = "match";
const MATCH_MESSAGE = " Would like to battle";

export enum E_MatchState {
	LOBBY = "LOBBY",
	IN_PROGRESS = "IN_PROGRESS",
	FINISHED = "FINISHED",
}

export { MATCH_CHANNEL, MATCH_MESSAGE };

const useMatch = () => {
	const api = new MatchAPI();
	const state = ref<E_MatchState>(E_MatchState.LOBBY);
	const utils = useUtils();
	const auth$ = useAuth();
	const prompt$ = usePrompt();

	async function pve() {
		const response = await api.pve(auth$.client.value);
		state.value = E_MatchState.IN_PROGRESS;
		return response.data;
	}

	const inMatch = computed(() => state.value === E_MatchState.IN_PROGRESS);
	const inLobby = computed(() => state.value === E_MatchState.LOBBY);

	/**
	 * Challenge a player to a match
	 * @param whoami - The entity of the player who is challenging
	 * @param target - The entity of the player who is being challenged
	 * @returns The response from the API
	 */
	async function challenge(whoami: Entity, target: Entity) {
		try {
			const response = await api.createMatch(whoami, target);
			return response;
		} catch (e) {
			utils.toast.error("Something went wrong", "top-left");
		}
	}

	/**
	 * Accept an incoming match request
	 * @param matchId - The ID of the match to accept
	 * @returns The response from the API
	 */
	async function accept(matchId: string) {
		try {
			const response = await api.acceptMatch(matchId, { id: "", name: "" }, { id: "", name: "" });
			return response;
		} catch (e) {
			utils.toast.error("Something went wrong", "top-left");
		}
	}

	/**
	 * Decline an incoming match request
	 * @param matchId - The ID of the match to decline
	 * @returns The response from the API
	 */
	async function decline(matchId: string) {
		try {
			const response = await api.decline(matchId, { id: "", name: "" }, { id: "", name: "" });
			return response;
		} catch (e) {
			utils.toast.error("Something went wrong", "top-left");
		}
	}

	/**
	 * Handle a match request
	 * @param wsm$ - The websocket structured message
	 */
	function onMatchRequest(wsm$: I_UseWSM) {
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

	

	return {
		state,
		inMatch,
		inLobby,
		challenge,
		accept,
		decline,
		pve,
		onMatchRequest,
	};
};
export default useMatch;
