import { I_ModuleContext } from '@/scenes/scenes.types';
import SceneModule from '../SceneModule';
import type * as RAPIER_TYPE from '@dimforge/rapier3d';

// Dynamic WASM import (loaded at runtime)
const RAPIER = import('@dimforge/rapier3d') as any;

// ============================================================================
// Config Types (Simple API)
// ============================================================================

type Vector3Like = { x: number; y: number; z: number } | [number, number, number];
type PositionVector3 = { x: number; y: number; z: number };

interface BaseBodyConfig {
  position?: Vector3Like;
  rotation?: Vector3Like; // Euler angles in radians
}

interface StaticBodyConfig extends BaseBodyConfig {
  shape: 'cuboid' | 'sphere' | 'capsule' | 'cylinder';
  size?: Vector3Like; // For cuboid: [width, height, depth], for sphere: [radius], etc.
  radius?: number; // For sphere, capsule
  height?: number; // For capsule, cylinder
}

interface KinematicConfig extends BaseBodyConfig {
  shape: 'capsule' | 'cylinder' | 'cuboid';
  radius?: number; // For capsule, cylinder
  height?: number; // For capsule, cylinder
  size?: Vector3Like; // For cuboid
  enableAutostep?: boolean;
  enableSnapToGround?: boolean;
  maxStepHeight?: number;
  minStepWidth?: number;
  snapToGroundDistance?: number;
}

interface MovementResult {
  x: number;
  y: number;
  z: number;
  isGrounded: boolean;
}

// ============================================================================
// PhysicsService - Simple Rapier Facade
// ============================================================================

/**
 * PhysicsService
 *
 * Simple facade over Rapier physics engine
 * Single file, minimal API, hides Rapier complexity
 *
 * Usage:
 * - registerStatic(): Create static colliders (ground, walls, obstacles)
 * - registerKinematic(): Create kinematic characters (player, NPCs)
 * - moveKinematic(): Move kinematic body with collision detection
 * - isGrounded(): Check if kinematic is on ground
 * - remove(): Clean up physics body
 */
export class PhysicsService extends SceneModule {
  private world!: RAPIER_TYPE.World;
  private RAPIER!: typeof RAPIER_TYPE;
  private isInitialized = false;

  // Tracking maps
  private bodies = new Map<string, RAPIER_TYPE.RigidBody>();
  private colliders = new Map<string, RAPIER_TYPE.Collider>();
  private kinematicControllers = new Map<string, RAPIER_TYPE.KinematicCharacterController>();

  // ============================================================================
  // Lifecycle
  // ============================================================================

  protected async init(context: I_ModuleContext): Promise<void> {
    // Load Rapier WASM module
    this.RAPIER = await RAPIER;

    // Create physics world with gravity
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new this.RAPIER.World(gravity);

    this.isInitialized = true;
    console.log('✅ [PhysicsService] Initialized');
  }

  public update(delta: number): void {
    if (!this.isInitialized) return;
    this.world.step();
  }

  public async destroy(): Promise<void> {
    // Clean up all tracked objects
    this.kinematicControllers.forEach(controller => this.world.removeCharacterController(controller));
    this.colliders.clear();
    this.bodies.clear();
    this.kinematicControllers.clear();

    if (this.world) {
      this.world.free();
    }
    this.isInitialized = false;
    console.log('🧹 [PhysicsService] Destroyed');
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  // ============================================================================
  // Registration API
  // ============================================================================

  /**
   * Register a static physics body (ground, walls, obstacles)
   * Static bodies never move and are optimized for collision detection
   */
  public registerStatic(id: string, config: StaticBodyConfig): void {
    this.assertReady();

    const position = this.toVector3(config.position ?? [0, 0, 0]);
    const rotation = this.toVector3(config.rotation ?? [0, 0, 0]);

    // Create rigid body
    const bodyDesc = this.RAPIER.RigidBodyDesc.fixed()
      .setTranslation(position.x, position.y, position.z)
      .setRotation(this.eulerToQuaternion(rotation));

    const body = this.world.createRigidBody(bodyDesc);

    // Create collider based on shape
    const colliderDesc = this.createColliderDesc(config);
    const collider = this.world.createCollider(colliderDesc, body);

    this.bodies.set(id, body);
    this.colliders.set(id, collider);

    console.log(`[PhysicsService] Registered static body: ${id}`);
  }

  /**
   * Register a kinematic character controller (player, NPCs)
   * Kinematic bodies move via explicit position updates with collision detection
   */
  public registerKinematic(id: string, config: KinematicConfig): void {
    this.assertReady();

    const position = this.toVector3(config.position ?? [0, 0, 0]);
    const rotation = this.toVector3(config.rotation ?? [0, 0, 0]);

    // Create kinematic rigid body
    const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(position.x, position.y, position.z)
      .setRotation(this.eulerToQuaternion(rotation));

    const body = this.world.createRigidBody(bodyDesc);

    // Create collider
    const colliderDesc = this.createColliderDesc(config);
    const collider = this.world.createCollider(colliderDesc, body);

    // Create character controller
    const controller = this.world.createCharacterController(0.01);

    // Configure character controller
    if (config.enableAutostep) {
      const maxStepHeight = config.maxStepHeight ?? 0.5;
      const minStepWidth = config.minStepWidth ?? 0.2;
      controller.enableAutostep(maxStepHeight, minStepWidth, true);
    }

    if (config.enableSnapToGround) {
      const snapDistance = config.snapToGroundDistance ?? 0.5;
      controller.enableSnapToGround(snapDistance);
    }

    controller.setApplyImpulsesToDynamicBodies(true);

    this.bodies.set(id, body);
    this.colliders.set(id, collider);
    this.kinematicControllers.set(id, controller);

    console.log(`[PhysicsService] Registered kinematic body: ${id}`);
  }

  /**
   * Remove a physics body and clean up resources
   */
  public remove(id: string): void {
    const controller = this.kinematicControllers.get(id);
    if (controller) {
      this.world.removeCharacterController(controller);
      this.kinematicControllers.delete(id);
    }

    const body = this.bodies.get(id);
    if (body) {
      this.world.removeRigidBody(body);
      this.bodies.delete(id);
    }

    this.colliders.delete(id);
    console.log(`[PhysicsService] Removed body: ${id}`);
  }

  // ============================================================================
  // Movement & Queries API
  // ============================================================================

  /**
   * Move a kinematic body with collision detection
   * Returns the collision-corrected movement and grounded state
   */
  public moveKinematic(id: string, movement: Vector3Like): MovementResult {
    const body = this.bodies.get(id);
    const controller = this.kinematicControllers.get(id);
    const collider = this.colliders.get(id);

    if (!body || !controller || !collider) {
      console.warn(`[PhysicsService] Kinematic body not found: ${id}`);
      return { x: 0, y: 0, z: 0, isGrounded: false };
    }

    const currentPos = body.translation();
    const desiredMovement = this.toVector3(movement);

    // Compute collision-corrected movement
    const rapierMovement = new this.RAPIER.Vector3(
      desiredMovement.x,
      desiredMovement.y,
      desiredMovement.z
    );

    controller.computeColliderMovement(collider, rapierMovement);
    const correctedMovement = controller.computedMovement();
    const isGrounded = controller.computedGrounded();

    // Apply corrected movement
    const newPos = {
      x: currentPos.x + correctedMovement.x,
      y: currentPos.y + correctedMovement.y,
      z: currentPos.z + correctedMovement.z,
    };

    body.setNextKinematicTranslation(newPos);

    return {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      isGrounded,
    };
  }

  /**
   * Get current position of a body
   */
  public getPosition(id: string): PositionVector3 | null {
    const body = this.bodies.get(id);
    if (!body) return null;

    const pos = body.translation();
    return { x: pos.x, y: pos.y, z: pos.z };
  }

  /**
   * Check if a kinematic body is grounded (last computed state)
   */
  public isGrounded(id: string): boolean {
    const controller = this.kinematicControllers.get(id);
    return controller?.computedGrounded() ?? false;
  }

  /**
   * Set position directly (teleport)
   */
  public setPosition(id: string, position: Vector3Like): void {
    const body = this.bodies.get(id);
    if (!body) {
      console.warn(`[PhysicsService] Body not found: ${id}`);
      return;
    }

    const pos = this.toVector3(position);
    body.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
  }

  /**
   * Set rotation directly
   */
  public setRotation(id: string, rotation: Vector3Like): void {
    const body = this.bodies.get(id);
    if (!body) {
      console.warn(`[PhysicsService] Body not found: ${id}`);
      return;
    }

    const rot = this.toVector3(rotation);
    body.setRotation(this.eulerToQuaternion(rot), true);
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  private assertReady(): void {
    if (!this.isInitialized) {
      throw new Error('[PhysicsService] Physics not initialized. Call start() first.');
    }
  }

  private toVector3(v: Vector3Like): { x: number; y: number; z: number } {
    if (Array.isArray(v)) {
      return { x: v[0], y: v[1], z: v[2] };
    }
    return v;
  }

  private createColliderDesc(config: StaticBodyConfig | KinematicConfig): RAPIER_TYPE.ColliderDesc {
    switch (config.shape) {
      case 'cuboid': {
        const size = this.toVector3(config.size ?? [1, 1, 1]);
        return this.RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
      }

      case 'sphere': {
        const radius = config.radius ?? 1;
        return this.RAPIER.ColliderDesc.ball(radius);
      }

      case 'capsule': {
        const radius = config.radius ?? 0.5;
        const height = config.height ?? 2;
        const halfHeight = (height - radius * 2) / 2; // Capsule half-height is cylinder part only
        return this.RAPIER.ColliderDesc.capsule(halfHeight, radius);
      }

      case 'cylinder': {
        const radius = config.radius ?? 0.5;
        const height = config.height ?? 2;
        return this.RAPIER.ColliderDesc.cylinder(height / 2, radius);
      }

      default:
        throw new Error(`[PhysicsService] Unsupported shape: ${(config as any).shape}`);
    }
  }

  private eulerToQuaternion(euler: { x: number; y: number; z: number }): { x: number; y: number; z: number; w: number } {
    const { x, y, z } = euler;

    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    return {
      x: s1 * c2 * c3 + c1 * s2 * s3,
      y: c1 * s2 * c3 - s1 * c2 * s3,
      z: c1 * c2 * s3 + s1 * s2 * c3,
      w: c1 * c2 * c3 - s1 * s2 * s3,
    };
  }
}
