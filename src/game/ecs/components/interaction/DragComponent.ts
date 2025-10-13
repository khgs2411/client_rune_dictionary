import { Vector3 } from 'three';
import { GameComponent } from '../../GameComponent';
import type { I_GameContext, I_Interactable, I_InteractionBuilder } from '../../types';
import { MeshComponent } from '../rendering/MeshComponent';
import { PhysicsComponent } from './PhysicsComponent';
import { TransformComponent } from '../rendering/TransformComponent';

export interface I_DragConfig {
  lockAxis?: ('x' | 'y' | 'z')[];
  snapToGrid?: number;
  onStart?: (position: Vector3) => void;
  onMove?: (position: Vector3) => void;
  onEnd?: (position: Vector3) => void;
}

/**
 * DragComponent - Enables drag-and-drop interaction for GameObject
 *
 * This component requires:
 * - MeshComponent (for interaction registration)
 * - TransformComponent (for position updates)
 *
 * Optionally uses:
 * - PhysicsComponent (to update physics body on drag end)
 *
 * Implements I_Interactable for lifecycle coordination by GameObject
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new DragComponent({
 *   lockAxis: ['y'], // Lock Y axis (XZ plane only)
 *   snapToGrid: 0.5, // Snap to 0.5 unit grid
 *   onEnd: (pos) => {
 *     console.log('Dragged to:', pos);
 *   }
 * }));
 * ```
 */
export class DragComponent extends GameComponent implements I_Interactable {
  private config: I_DragConfig;
  private context!: I_GameContext;
  private transformComp!: TransformComponent;

  constructor(config: I_DragConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    this.context = context;

    // Restrict: cannot use with InstancedMeshComponent
    const InstancedMeshComponent = await import('../rendering/InstancedMeshComponent').then(
      (m) => m.InstancedMeshComponent,
    );
    this.restrictComponent(
      InstancedMeshComponent,
      'Individual instances cannot be dragged. Drag is only for single-mesh GameObjects.',
    );

    // Store references for later use in registerWithService
    this.transformComp = this.requireComponent(TransformComponent);
  }

  /**
   * Register drag behavior with InteractionService builder
   * Called by GameObject during interaction lifecycle coordination
   */
  registerWithService(builder: I_InteractionBuilder, context: I_GameContext): void {
    builder.withDrag({
      lockAxis: this.config.lockAxis,
      snapToGrid: this.config.snapToGrid,
      onStart: (pos) => this.handleDragStart(pos),
      onMove: (pos) => this.handleDragMove(pos),
      onEnd: (pos) => this.handleDragEnd(pos),
    });
  }

  private handleDragStart(position: Vector3): void {
    // Custom callback
    this.config.onStart?.(position);
  }

  private handleDragMove(position: Vector3): void {
    // Update transform component
    this.transformComp.setPosition(position);

    // Custom callback
    this.config.onMove?.(position);
  }

  private handleDragEnd(position: Vector3): void {
    // Update transform component
    this.transformComp.setPosition(position);

    // Update physics if component exists
    const physicsComp = this.getComponent(PhysicsComponent);
    if (physicsComp && this.context.services.physics.isReady()) {
      this.context.services.physics.setPosition(this.gameObject.id, {
        x: position.x,
        y: position.y,
        z: position.z,
      });
    }

    // Custom callback
    this.config.onEnd?.(position);
  }

  destroy(): void {
    // Interaction cleanup happens automatically in InteractionService.destroy()
  }
}
