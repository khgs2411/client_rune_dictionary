import { useAuthStore } from './auth.store';
import { useGameConfigStore } from './config.store';
import { useMatchStore } from './match.store';
import { useSceneStore } from './scene.store';
import { useSettingsStore } from './settings.store';
import { useWebSocketStore } from './websocket.store';

/**
 * DataStore - Centralized facade for all Pinia stores
 *
 * Simple utility that groups store accessors for convenient access.
 * Not a singleton - just a convenient namespace that respects Pinia's lifecycle.
 *
 * Usage:
 * ```typescript
 * import { DataStore } from '@/stores/DataStore';
 *
 * const clientData = DataStore.websocket.clientData;
 * DataStore.match.initializeMatch({ ... });
 * ```
 */
export const DataStore = {
  get match() {
    return useMatchStore();
  },
  get websocket() {
    return useWebSocketStore();
  },
  get auth() {
    return useAuthStore();
  },
  get config() {
    return useGameConfigStore();
  },
  get settings() {
    return useSettingsStore();
  },
  get scene() {
    return useSceneStore();
  },

  /**
   * Reset all stores (useful for logout, scene transitions)
   */
  resetAll() {
    this.match.$reset();
    this.auth.$reset();
    this.scene.$reset();
    // Note: Don't reset websocket (connection state) or config (app settings)
  },
} as const;
