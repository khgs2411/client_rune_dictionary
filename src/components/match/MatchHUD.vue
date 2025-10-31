<template>
  <!-- Pokemon-inspired Match HUD - Three-corner layout -->
  <div v-if="isVisible" class="fixed inset-0 pointer-events-none">
    <!-- Top-center: Turn Timer (shared element for active turn) -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 mt-16 pointer-events-auto">
      <TurnTimer />
    </div>

    <!-- Top-right: Enemy status panel -->
    <div class="absolute top-0 right-4 mt-16 pointer-events-auto">
      <StatusPanel entity-type="enemy" :name="enemyName" :level="enemyLevel" :hp="enemyHp" :max-hp="enemyMaxHp"
        :mp="enemyMp" :max-mp="enemyMaxMp" :atb-progress="enemyAtbProgress" />
    </div>

    <!-- Bottom-left: Player status panel -->
    <div class="absolute bottom-0 left-4 mb-16 pointer-events-auto">
      <StatusPanel entity-type="player" :name="playerName" :level="playerLevel" :hp="playerHp" :max-hp="playerMaxHp"
        :mp="playerMp" :max-mp="playerMaxMp" :atb-progress="playerAtbProgress" />
    </div>

    <!-- Action bar (8 slots + Run/Pass) - Draggable, positioned by component -->
    <ActionBar @leave-match="handleLeaveMatch" :is-leaving="isLeaving" />
  </div>
</template>

<script setup lang="ts">
  import MatchAPI from '@/api/match.api';
import { E_SceneState } from '@/game/services/SceneStateService';
import { DataStore } from '@/stores/DataStore';
import { useRxjs } from 'topsyde-utils';
import { computed, ref } from 'vue';
import ActionBar from './ActionBar.vue';
import StatusPanel from './StatusPanel.vue';
import TurnTimer from './TurnTimer.vue';

  const api = new MatchAPI();
  const rxjs = useRxjs('scene:state');

  // Reactive stores
  const matchStore = DataStore.match;
  const websocketStore = DataStore.websocket;

  // Computed visibility (show when in match)
  const isVisible = computed(() => {
    return matchStore.currentMatchId !== null;
  });

  // Loading state for leave match
  const isLeaving = ref(false);

  // ========================================
  // PLACEHOLDER DATA
  // ========================================
  // TODO: Replace with real match data from matchStore

  // Player data (hardcoded placeholder)
  const playerName = ref('Player');
  const playerLevel = ref(1);
  const playerHp = ref(23);
  const playerMaxHp = ref(23);
  const playerMp = ref(10);
  const playerMaxMp = ref(10);
  const playerAtbProgress = ref(0); // 0-100%

  // Enemy data (hardcoded placeholder)
  const enemyName = ref('Training Dummy');
  const enemyLevel = ref(1);
  const enemyHp = ref(15);
  const enemyMaxHp = ref(15);
  const enemyMp = ref(0);
  const enemyMaxMp = ref(0);
  const enemyAtbProgress = ref(0); // 0-100%

  /**
   * Handle Leave Match button click
   * Called from ActionBar component
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
      const response = await api.leaveMatch({
        whoami: websocketStore.clientData,
        matchId: matchStore.currentMatchId,
      });

      console.log('[MatchHUD] Left match successfully:', response.message);

      // Clear match store
      matchStore.$reset();

      // Emit RxJS event to SceneStateService
      rxjs.$next('onStateChange', E_SceneState.OVERWORLD);

      console.log('[MatchHUD] Emitted state change to OVERWORLD via RxJS');
    } catch (error) {
      console.error('[MatchHUD] Failed to leave match:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to leave match';
      alert(`Error: ${errorMessage}`); // TODO: Replace with toast notification
    } finally {
      isLeaving.value = false;
    }
  }
</script>
