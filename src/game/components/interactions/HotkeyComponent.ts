import type { I_SceneContext } from '@/game/common/scenes.types';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';

export interface I_HotkeyConfig {
  key: string; // Key to listen for (e.g., '1', 'a', 'Escape')
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }; // Optional modifier keys
  onPress: (event: KeyboardEvent) => void; // Callback when key is pressed
}

/**
 * HotkeyComponent - Generic keyboard input component
 *
 * Registers a keyboard callback with InteractionService.
 * The callback can do anything - spawn objects, toggle settings, etc.
 *
 * This replaces HotkeySpawnComponent with a more generic, reusable component.
 *
 * Usage:
 * ```typescript
 * // For spawning
 * player.addComponent(new HotkeyComponent({
 *   key: '1',
 *   onPress: () => {
 *     const spawner = context.getService('spawner');
 *     spawner.spawn('fireball', player.id, { ... });
 *   }
 * }));
 *
 * // For toggling debug
 * gameObject.addComponent(new HotkeyComponent({
 *   key: 'F3',
 *   onPress: () => {
 *     const settings = useSettingsStore();
 *     settings.debug.showPhysicsDebug = !settings.debug.showPhysicsDebug;
 *   }
 * }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after physics/rendering
 */
export class HotkeyComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  private config: I_HotkeyConfig;
  private unregister?: () => void;

  constructor(config: I_HotkeyConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    const interaction = context.getService('interaction');

    // Register keyboard callback with InteractionService
    this.unregister = interaction.registerKeyPress(
      `${this.gameObject.id}-hotkey-${this.config.key}`,
      this.config.key,
      (event) => {
        // Delegate to callback (component logic decided by user)
        this.config.onPress(event);
      },
      this.config.modifiers,
    );

   
  }

  destroy(): void {
    // Unregister from InteractionService
    if (this.unregister) {
      this.unregister();
    }

  }
}
