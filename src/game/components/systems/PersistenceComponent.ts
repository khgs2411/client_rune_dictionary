import { Vector3 } from 'three';
import { GameComponent, ComponentPriority } from '../../GameComponent';
import type { I_GameContext } from '../../common/gameobject.types';
import { TransformComponent } from '../rendering/TransformComponent';
import { useSceneStore } from '@/stores/scene.store';
import { DragComponent } from '../interactions/DragComponent';

/**
 * PersistenceComponent - Saves and loads GameObject position
 *
 * This component requires:
 * - TransformComponent (for position data)
 *
 * Optionally integrates with:
 * - DragComponent (auto-saves on drag end)
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new PersistenceComponent());
 * ```
 *
 * The component automatically:
 * - Loads saved position on init (if exists)
 * - Saves position when savePosition() is called
 * - Integrates with DragComponent to auto-save on drag end
 */
export class PersistenceComponent extends GameComponent {
  // Priority: 1 (default) - loads position early into TransformComponent

  private sceneStore = useSceneStore();
  private context!: I_GameContext;
  private transformComp!: TransformComponent;

  async init(context: I_GameContext): Promise<void> {
    this.context = context;

    // Require transform component
    this.transformComp = this.requireComponent(TransformComponent);

    // Load saved position if exists
    this.loadPosition();

    // If DragComponent exists, hook into its onEnd callback
    const dragComp = this.getComponent(DragComponent);
    if (dragComp) {
      // Wrap existing onEnd callback to include save
      const originalOnEnd = dragComp.getConfig().onEnd;
      const config = dragComp.getConfig();
      config.onEnd = (pos: Vector3) => {
        this.savePosition(pos);
        originalOnEnd?.(pos);
      };
    }
  }

  /**
   * Load saved position from store
   */
  private loadPosition(): void {
    const savedPos = this.sceneStore.getObjectPosition(
      this.context.sceneName,
      this.gameObject.id,
    );

    if (savedPos) {
      this.transformComp.setPosition(savedPos.x, savedPos.y, savedPos.z);
      console.log(
        `📍 [PersistenceComponent] Loaded position for ${this.gameObject.id}:`,
        savedPos,
      );
    }
  }

  /**
   * Save current position to store
   */
  savePosition(position?: Vector3): void {
    const pos = position || this.transformComp.position;

    this.sceneStore.saveObjectPosition(this.context.sceneName, this.gameObject.id, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
    });

    console.log(
      `💾 [PersistenceComponent] Saved position for ${this.gameObject.id}:`,
      { x: pos.x, y: pos.y, z: pos.z },
    );
  }

  /**
   * Clear saved position from store
   */
  clearPosition(): void {
    // This would require a new method in SceneStore to remove individual objects
    console.warn(
      `[PersistenceComponent] clearPosition() not yet implemented for ${this.gameObject.id}`,
    );
  }

  destroy(): void {
    // Persistence data stays in localStorage
  }
}
