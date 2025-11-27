import type { I_SceneContext } from '@/game/common/scenes.types';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import { E_SceneState } from '@/game/services/SceneStateService';
import { InteractionComponent } from '../interactions/InteractionComponent';

/**
 * Arena configuration for match environment
 */
export interface I_ArenaConfig {
  width: number;
  depth: number;
  height: number;
}

/**
 * MatchComponent - Bridge that makes a GameObject "matchable"
 *
 * This component listens to double-click events from InteractionComponent
 * and triggers the match request flow via scene state change.
 *
 * Responsibilities:
 * - Listen to 'doubleclick' event from InteractionComponent
 * - Validate scene state (must be OVERWORLD)
 * - Trigger MATCH_REQUEST state (MatchModule handles the rest)
 * - Hold arena configuration for match environment
 *
 * Does NOT handle:
 * - API calls (moved to MatchModule)
 * - Store updates (moved to MatchModule)
 * - Error handling (moved to MatchModule)
 *
 * Dependencies:
 * - Requires InteractionComponent (for doubleclick event)
 *
 * Usage:
 * ```typescript
 * const npc = new GameObject({ id: 'training-dummy' })
 *   .addComponent(new InteractionComponent())
 *   .addComponent(new MatchComponent());
 * ```
 *
 * Priority: INTERACTION (300) - Runs after InteractionComponent
 */
export class MatchComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  /**
   * Arena configuration - read by MatchModule when spawning arena
   * Defaults match current arena dimensions
   */
  public readonly arenaConfig: I_ArenaConfig = {
    width: 40,
    depth: 25,
    height: 20,
  };

  async init(context: I_SceneContext): Promise<void> {
    this.setupInteractionListener(context);
  }

  private setupInteractionListener(context: I_SceneContext): void {
    const interaction = this.requireComponent(InteractionComponent);

    interaction.on('doubleclick', async () => {
      console.log(`⚔️ [MatchComponent] Double-click detected on ${this.gameObject.id}`);
      this.requestMatch(context);
    });
  }

  /**
   * Request match start - triggers state change
   * MatchModule handles API calls, arena spawning, camera transitions
   */
  private requestMatch(context: I_SceneContext): void {
    const stateService = context.getService('state');

    if (!stateService.isOverworld()) {
      console.warn('⚔️ [MatchComponent] Cannot start match - not in OVERWORLD state');
      return;
    }

    // Just trigger state change - MatchModule handles everything else
    stateService.setState(E_SceneState.MATCH_REQUEST);
  }

  destroy(): void {
    // InteractionComponent handles its own cleanup
  }
}
