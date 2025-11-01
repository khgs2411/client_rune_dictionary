import type { I_SceneContext } from '@/game/common/scenes.types';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import { useGameConfigStore } from '@/stores/config.store';
import type { Vector3 } from 'three';
import { MeshComponent } from '../rendering/MeshComponent';
import { TransformComponent } from '../rendering/TransformComponent';

export interface I_DragConfig {
  lockAxis?: ('x' | 'y' | 'z')[]; // Lock specific axes from dragging
  snapToGrid?: number; // Grid snap size in world units (0 = no snapping, uses config.editor.snapToGrid by default)
  onDragStart?: (startPos: Vector3) => void; // Callback when drag starts
  onDragMove?: (currentPos: Vector3) => void; // Callback during drag
  onDragEnd?: (endPos: Vector3) => void; // Callback when drag ends
}

/**
 * DragComponent - Drag objects in editor mode
 *
 * Uses InteractionService for drag detection and updates GameObject position
 * via TransformComponent. Only works when editor mode is enabled.
 *
 * This replaces the drag functionality from InteractableBuilder with a
 * reusable component that can be added to any GameObject.
 *
 * Features:
 * - Only active in editor mode (config.editor.enabled)
 * - Drag on XZ plane with optional axis locking
 * - Grid snapping support (uses config.editor.snapToGrid by default)
 * - Callbacks for drag lifecycle events
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new DragComponent({
 *   lockAxis: ['y'], // Lock Y axis (drag only on XZ plane)
 *   snapToGrid: 0.5, // Snap to 0.5 world unit grid
 *   onDragEnd: (pos) => console.log('Dragged to:', pos)
 * }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after rendering and physics
 */
export class DragComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  private config: I_DragConfig;
  private unregister?: () => void;

  constructor(config: I_DragConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    // Require MeshComponent for hover detection
    const meshComp = this.requireComponent(MeshComponent);
    // Require TransformComponent for position updates
    const transformComp = this.requireComponent(TransformComponent);

    const interaction = context.getService('interaction');
    const gameConfig = useGameConfigStore();

    // Register drag callbacks with InteractionService
    this.unregister = interaction.registerDrag(
      `${this.gameObject.id}-drag`,
      meshComp.mesh,
      {
        onStart: (startPos) => {
          // Only allow dragging in editor mode
          if (!gameConfig.editor.enabled) return;

          console.log(`📦 [DragComponent] Drag started for "${this.gameObject.id}"`);
          this.config.onDragStart?.(startPos);
        },
        onMove: (currentPos) => {
          // Only allow dragging in editor mode
          if (!gameConfig.editor.enabled) return;

          // Update GameObject position via TransformComponent
          transformComp.position.copy(currentPos);

          this.config.onDragMove?.(currentPos);
        },
        onEnd: (endPos) => {
          // Only allow dragging in editor mode
          if (!gameConfig.editor.enabled) return;

          console.log(
            `📦 [DragComponent] Drag ended for "${this.gameObject.id}" at [${endPos.x.toFixed(2)}, ${endPos.y.toFixed(2)}, ${endPos.z.toFixed(2)}]`,
          );

          // Final position update
          transformComp.position.copy(endPos);

          this.config.onDragEnd?.(endPos);
        },
      },
      {
        lockAxis: this.config.lockAxis,
        // Use getter function to read live value from gameConfig
        // Falls back to static config value if specified
        snapToGrid:
          this.config.snapToGrid !== undefined
            ? this.config.snapToGrid
            : () => gameConfig.editor.snapToGrid,
      },
    );
  }

  destroy(): void {
    // Unregister from InteractionService
    if (this.unregister) {
      this.unregister();
    }
  }
}
