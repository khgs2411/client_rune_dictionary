import type { I_SceneContext } from '@/game/common/scenes.types';
import { useEventListener } from '@vueuse/core';
import { I_SpawnConfig, SpawnComponent } from './SpawnComponent';

/**
 * Configuration for hotkey-triggered spawning
 */
export interface I_HotkeySpawnConfig extends I_SpawnConfig {
  key: string; // Keyboard key to trigger spawn (e.g., '1', 'Space', 'q')
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}

/**
 * HotkeySpawnComponent - Spawn objects via keyboard input
 *
 * Extends SpawnComponent with keyboard event listening.
 *
 * Usage:
 * ```typescript
 * player.addComponent(new HotkeySpawnComponent({
 *   key: '1',
 *   spawnType: 'fireball',
 *   cooldown: 1000, // 1 second
 *   getSpawnData: (owner) => ({
 *     position: owner.getComponent(TransformComponent).position.toArray(),
 *     direction: owner.getComponent(TransformComponent).forward,
 *     velocity: 10
 *   })
 * }));
 * ```
 */
export class HotkeySpawnComponent extends SpawnComponent {
  private hotkeyConfig: I_HotkeySpawnConfig;

  constructor(config: I_HotkeySpawnConfig) {
    super(config);
    this.hotkeyConfig = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    await super.init(context);

    // Register keyboard event listener with cleanup registry
    const stopListener = useEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    // Register cleanup with CleanupRegistry
    this.cleanup.registerWatcher(stopListener);

    console.log(
      `⌨️  [HotkeySpawnComponent] Registered hotkey "${this.hotkeyConfig.key}" for "${this.config.spawnType}"`,
    );
  }

  /**
   * Handle keyboard input
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Check if correct key
    if (event.key !== this.hotkeyConfig.key) return;

    // Check modifiers (if specified)
    const mods = this.hotkeyConfig.modifiers;
    if (mods) {
      if (mods.ctrl && !event.ctrlKey) return;
      if (mods.shift && !event.shiftKey) return;
      if (mods.alt && !event.altKey) return;
      if (mods.meta && !event.metaKey) return;
    }

    // Prevent default browser behavior
    event.preventDefault();

    // Attempt spawn
    this.trySpawn();
  }

  destroy(): void {
    super.destroy();
    // Cleanup handled by CleanupRegistry
    console.log(`⌨️  [HotkeySpawnComponent] Unregistered hotkey "${this.hotkeyConfig.key}"`);
  }
}
