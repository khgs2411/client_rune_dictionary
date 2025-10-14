import { GameComponent, ComponentPriority } from '../../GameComponent';
import type { I_GameContext } from '../../common/gameobject.types';
import { MeshComponent } from '../rendering/MeshComponent';
import { InstancedMeshComponent } from '../rendering/InstancedMeshComponent';
import { CharacterMeshComponent } from '../rendering/CharacterMeshComponent';
import { Mesh } from 'three';

export interface I_PhysicsConfig {
  type: 'static' | 'kinematic';
  shape?: 'cuboid' | 'sphere' | 'capsule' | 'cylinder';
  shapeParams?: number[]; // Explicit shape dimensions (e.g., [halfWidth, halfHeight, halfDepth] for cuboid)
  showDebug?: boolean;
  characterController?: boolean; // If true, use kinematic character controller (only for kinematic type)
  initialPosition?: [number, number, number]; // Starting position for physics body
  characterOptions?: {
    enableAutostep?: boolean;
    enableSnapToGround?: boolean;
    maxStepHeight?: number;
    minStepWidth?: number;
    snapToGroundDistance?: number;
  };
}

/**
 * PhysicsComponent - Registers GameObject with PhysicsService
 *
 * This component requires:
 * - MeshComponent OR InstancedMeshComponent (to extract geometry/position for physics body)
 *
 * Usage:
 * ```typescript
 * // With MeshComponent (single mesh)
 * gameObject.addComponent(new PhysicsComponent({
 *   type: 'static',
 *   shape: 'cuboid'
 * }));
 *
 * // With InstancedMeshComponent (multiple instances)
 * gameObject.addComponent(new PhysicsComponent({
 *   type: 'static',
 *   shape: 'cylinder'
 * }));
 * ```
 */
export class PhysicsComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS; // 200 - depends on mesh

  private config: I_PhysicsConfig;
  private isRegistered = false;
  private instanceIds: string[] = []; // Track physics IDs for instanced meshes

  constructor(config: I_PhysicsConfig) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    // Check if physics service is ready
    if (!context.services.physics.isReady()) {
      console.warn(
        `[PhysicsComponent] Physics not ready for GameObject "${this.gameObject.id}". Skipping.`,
      );
      return;
    }

    // Check which mesh component is present
    const { meshComp, instancedMeshComp, characterMeshComp } = this.verifyRequiredComponents();

    // Register with physics service based on type
    if (this.config.type === 'static') {
      this.handleStaticMesh(meshComp, context, instancedMeshComp);
    } else if (this.config.type === 'kinematic') {
      // Kinematic character controller
      this.handleKinematicMesh(meshComp, context, characterMeshComp);
    }

    this.isRegistered = true;
  }


  private verifyRequiredComponents() {
    const meshComp = this.getComponent(MeshComponent);
    const instancedMeshComp = this.getComponent(InstancedMeshComponent);
    const characterMeshComp = this.getComponent(CharacterMeshComponent);

    if (!meshComp && !instancedMeshComp && !characterMeshComp) {
      throw new Error(
        `[PhysicsComponent] GameObject "${this.gameObject.id}" requires MeshComponent, InstancedMeshComponent, or CharacterMeshComponent`
      );
    }
    return { meshComp, instancedMeshComp, characterMeshComp };
  }

  private handleStaticMesh(meshComp: MeshComponent | null, context: I_GameContext, instancedMeshComp: InstancedMeshComponent | null) {
    if (meshComp) {
      // Single mesh registration
      context.services.physics.registerStaticFromMesh(
        this.gameObject.id,
        meshComp.mesh,
        { showDebug: this.config.showDebug }
      );
    } else if (instancedMeshComp) {
      // Instanced mesh registration
      this.instanceIds = context.services.physics.registerInstancedStatic(
        this.gameObject.id,
        instancedMeshComp.instancedMesh
      );
    }
  }

  private handleKinematicMesh(meshComp: MeshComponent | null, context: I_GameContext, characterMeshComp: CharacterMeshComponent | null) {
    if (!this.config.characterController) {
      console.warn(
        `[PhysicsComponent] Kinematic type requires characterController: true for GameObject "${this.gameObject.id}"`,
      );
      return;
    }

    // Determine which mesh to use for physics
    let physicsBody: Mesh | undefined;

    if (characterMeshComp) {
      // Use body mesh from CharacterMeshComponent
      physicsBody = characterMeshComp.bodyMesh;
    } else if (meshComp) {
      // Use regular mesh
      physicsBody = meshComp.mesh;
    } else {
      console.warn(
        `[PhysicsComponent] Kinematic character controller requires MeshComponent or CharacterMeshComponent for GameObject "${this.gameObject.id}"`,
      );
      return;
    }

    // Use provided initial position or default to [0, 1, 0]
    const initialPos = this.config.initialPosition || [0, 1, 0];

    // Register kinematic character from mesh
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

  }

  /**
   * Update physics body position (for drag, teleport, etc.)
   */
  public updatePosition(x: number, y: number, z: number): void {
    if (!this.isRegistered) return;

    const context = (this as any).context as I_GameContext;
    if (context?.services?.physics) {
      context.services.physics.setPosition(this.gameObject.id, { x, y, z });
    }
  }

  public destroy(): void {
    if (this.isRegistered) {
      // For instanced meshes, cleanup individual instance physics bodies
      if (this.instanceIds.length > 0) {
        // Note: PhysicsService.destroy() should handle this automatically
        // but we track them here in case manual cleanup is needed
        this.instanceIds = [];
      }
      // Physics cleanup happens automatically in PhysicsService.destroy()
      this.isRegistered = false;
    }
  }
}
