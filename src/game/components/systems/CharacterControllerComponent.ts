import { GameComponent, ComponentPriority } from '@/game/GameComponent';
import type { I_SceneContext } from '@/game/common/scenes.types';
import type { I_CharacterControls } from '@/composables/composables.types';
import { CharacterMeshComponent } from '@/game/components/rendering/CharacterMeshComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';

export interface I_CharacterControllerConfig {
  controller: I_CharacterControls; // Scene-owned character controller
  initialPosition?: [number, number, number]; // Starting position for physics body
  characterOptions?: {
    enableAutostep?: boolean;
    enableSnapToGround?: boolean;
    maxStepHeight?: number;
    minStepWidth?: number;
    snapToGroundDistance?: number;
  };
  showDebug?: boolean;
}

/**
 * CharacterControllerComponent - Kinematic character controller for player movement
 *
 * This component:
 * - Registers a kinematic character controller with PhysicsService
 * - Handles player-specific physics (auto-step, ground snapping, collision)
 * - Works with MovementComponent to provide collision-aware movement
 *
 * This is ONLY for player characters. For static/dynamic colliders, use CollisionComponent.
 *
 * Usage:
 * ```typescript
 * // LocalPlayer
 * gameObject.addComponent(new CharacterControllerComponent({
 *   controller: characterController,
 *   initialPosition: [0, 1, 0],
 *   characterOptions: {
 *     enableAutostep: true,
 *     maxStepHeight: 0.5
 *   }
 * }));
 * ```
 *
 * Dependencies:
 * - Requires CharacterMeshComponent OR MeshComponent
 */
export class CharacterControllerComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

  private config: I_CharacterControllerConfig;
  private isRegistered = false;

  constructor(config: I_CharacterControllerConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[CharacterControllerComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Get mesh for physics body
    const characterMeshComp = this.getComponent(CharacterMeshComponent);
    const meshComp = this.getComponent(MeshComponent);

    let physicsBody;
    if (characterMeshComp) {
      physicsBody = characterMeshComp.bodyMesh;
    } else if (meshComp) {
      physicsBody = meshComp.mesh;
    } else {
      throw new Error(
        `[CharacterControllerComponent] GameObject "${this.gameObject.id}" requires CharacterMeshComponent or MeshComponent`,
      );
    }

    // Use provided initial position or default to [0, 1, 0]
    const initialPos = this.config.initialPosition || [0, 1, 0];

    // Register kinematic character with PhysicsService
    context.services.physics.registerKinematicFromMesh(
      this.gameObject.id,
      physicsBody,
      initialPos,
      this.config.characterOptions || {
        enableAutostep: true,
        enableSnapToGround: true,
        maxStepHeight: 0.5,
        minStepWidth: 0.2,
        snapToGroundDistance: 0.5,
      },
    );

    this.isRegistered = true;
    console.log(
      `🎮 [CharacterControllerComponent] Registered kinematic controller for "${this.gameObject.id}"`,
    );
  }

  /**
   * Update physics body position (for teleport, etc.)
   */
  public updatePosition(x: number, y: number, z: number): void {
    if (!this.isRegistered) return;

    const context = (this as any).context as I_SceneContext;
    if (context?.services?.physics) {
      context.services.physics.setPosition(this.gameObject.id, { x, y, z });
    }
  }

  destroy(): void {
    // Physics cleanup happens automatically in PhysicsService
    this.isRegistered = false;
  }
}
