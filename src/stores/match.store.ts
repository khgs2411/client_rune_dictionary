import { defineStore } from "pinia";
import { ref } from "vue";
import { E_MatchState } from "../common/composables/useMatch";

export const useMatchStore = defineStore('match', () => {
    const currentMatchId = ref(<string | null>null);
    const currentChannelId = ref(<string | null>null);
    const matchState = ref(E_MatchState.LOBBY);
    const isConnectedToMatch = ref(false);



    return {
        currentMatchId,
        currentChannelId,
        matchState,
        isConnectedToMatch
    }
}, {
    persist: true
});