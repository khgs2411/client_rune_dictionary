<template>
  <div v-if="isVisible" class="fixed top-20 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white shadow-2xl">
    <!-- Match Info -->
    <div class="space-y-2 mb-4">
      <div class="text-sm font-semibold text-primary">IN MATCH</div>
      <div class="text-xs text-muted-foreground">
        Match ID: <span class="font-mono">{{ matchStore.currentMatchId?.slice(0, 8) }}...</span>
      </div>
      <div v-if="matchStore.channelName" class="text-xs text-muted-foreground">
        Channel: {{ matchStore.channelName }}
      </div>
    </div>

    <!-- Leave Button -->
    <button @click="handleLeaveMatch" :disabled="isLeaving"
      class="w-full px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
      {{ isLeaving ? 'Leaving...' : 'Leave Match' }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import MatchAPI from '@/api/match.api';
import { E_SceneState } from '@/game/services/SceneStateService';
import { DataStore } from '@/stores/DataStore';
import { useRxjs } from 'topsyde-utils';
import { computed, ref } from 'vue';

  const matchAPI = new MatchAPI();
  const rxjs = useRxjs('scene:state'); // RxJS channel for scene state events

  // Reactive match state
  const matchStore = DataStore.match;
  const websocketStore = DataStore.websocket;

  // Computed visibility (show when in match states)
  const isVisible = computed(() => {
    return matchStore.currentMatchId !== null;
  });

  // Loading state for button
  const isLeaving = ref(false);

  /**
   * Handle Leave Match button click
   */
  async function handleLeaveMatch() {
    if (!matchStore.currentMatchId) {
      console.warn('[MatchHUD] No match ID, cannot leave');
      return;
    }

    if (!websocketStore.clientData) {
      console.error('[MatchHUD] No client data, cannot leave');
      return;
    }

    isLeaving.value = true;

    try {
      // Call API to leave match
      const response = await matchAPI.leaveMatch({
        whoami: websocketStore.clientData,
        matchId: matchStore.currentMatchId,
      });

      console.log('[MatchHUD] Left match successfully:', response.message);

      // Clear match store
      matchStore.$reset();

      // Emit RxJS event to SceneStateService (you'll handle listener)
      rxjs.$next('onStateChange', E_SceneState.OVERWORLD)

      console.log('[MatchHUD] Emitted match.left event via RxJS');
    } catch (error) {
      console.error('[MatchHUD] Failed to leave match:', error);

      // TODO: Show error toast notification
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave match';
      alert(`Error: ${errorMessage}`); // Temporary - replace with toast
    } finally {
      isLeaving.value = false;
    }
  }
</script>