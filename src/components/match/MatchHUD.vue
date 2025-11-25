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
        :mp="enemyMp" :max-mp="enemyMaxMp" :atb-progress="enemyAtbProgress" :is-turn-active="isTurnActive" />
    </div>

    <!-- Bottom-left: Player status panel -->
    <div class="absolute bottom-0 left-4 mb-16 pointer-events-auto">
      <StatusPanel entity-type="player" :name="playerName" :level="playerLevel" :hp="playerHp" :max-hp="playerMaxHp"
        :mp="playerMp" :max-mp="playerMaxMp" :atb-progress="playerAtbProgress" :is-turn-active="isTurnActive" />
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
import { computed, ref, watch } from 'vue';
import ActionBar from './ActionBar.vue';
import StatusPanel from './StatusPanel.vue';
import TurnTimer from './TurnTimer.vue';

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
  // Match State Data (from gameState composable)
  // ========================================

  // Player data from matchStore.gameState.player (it's a Ref<I_PlayerParticipant>)
  const playerName = computed(() => matchStore.match.player?.name ?? 'Player');
  const playerLevel = ref(1); // TODO: Add level to participant interface if needed
  const playerHp = computed(() => matchStore.match.player?.health ?? 0);
  const playerMaxHp = computed(() => matchStore.match.player?.maxHealth ?? 1);
  const playerMp = ref(10); // TODO: Add MP to participant interface if needed
  const playerMaxMp = ref(10);
  const playerAtbProgress = computed(() => matchStore.match.player?.readiness ?? 0);

  // Enemy data from matchStore.gameState.npc (it's a Ref<I_NPCParticipant>)
  const enemyName = computed(() => matchStore.match.npc?.name ?? 'Enemy');
  const enemyLevel = ref(1); // TODO: Add level to participant interface if needed
  const enemyHp = computed(() => matchStore.match.npc?.health ?? 0);
  const enemyMaxHp = computed(() => matchStore.match.npc?.maxHealth ?? 1);
  const enemyMp = ref(0); // TODO: Add MP to participant interface if needed
  const enemyMaxMp = ref(0);
  const enemyAtbProgress = computed(() => matchStore.match.npc?.readiness ?? 0);

  // Turn state - ATB should pause when ANY turn is active
  const isTurnActive = computed(() => matchStore.match.timer.active);

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
      const api = new MatchAPI();
      await api.leaveMatch({
        whoami: websocketStore.clientData,
        matchId: matchStore.currentMatchId,
      });

      // Clear match store
      matchStore.$reset();

      // Emit RxJS event to SceneStateService
      rxjs.$next('onStateChange', E_SceneState.OVERWORLD);
    } catch (error) {
      console.error('[MatchHUD] Failed to leave match:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to leave match';
      alert(`Error: ${errorMessage}`); // TODO: Replace with toast notification
    } finally {
      isLeaving.value = false;
    }
  }


  watch(() => matchStore.matchState, async (newState) => {
    console.log('[MatchHUD] Match state changed to:', newState);
    if (newState == 'FINISHED') {
      await handleLeaveMatch();
    }
  });
</script>
