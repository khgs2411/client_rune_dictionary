import { I_ModuleContext } from '@/scenes/scenes.types';
import SceneModule from '../SceneModule';
import type * as RAPIER_TYPE from '@dimforge/rapier3d';

// Dynamic WASM import (loaded at runtime)
const RAPIER = import('@dimforge/rapier3d') as any;

/**
 * PhysicsService
 * Manages Rapier physics world for the game
 * Handles physics simulation step and world lifecycle
 */
export class PhysicsService extends SceneModule {
  private world!: RAPIER_TYPE.World;
  private RAPIER!: typeof RAPIER_TYPE;
  private isInitialized = false;

  async start(context: I_ModuleContext): Promise<void> {
    // Load Rapier WASM module
    this.RAPIER = await RAPIER;

    // Create physics world with gravity
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new this.RAPIER.World(gravity);

    this.isInitialized = true;
    console.log('✅ [PhysicsService] Initialized with gravity:', gravity);
    super.start(context);
  }

  public update(delta: number): void {
    if (!this.isInitialized) return;

    // Step the physics simulation
    this.world.step();
  }

  public async destroy(): Promise<void> {
    if (this.world) {
      this.world.free();
    }
    this.isInitialized = false;
    console.log('🧹 [PhysicsService] Destroyed');
  }

  /**
   * Get the Rapier world instance
   */
  public getWorld(): RAPIER_TYPE.World {
    if (!this.isInitialized) {
      throw new Error('[PhysicsService] Physics world not initialized. Call start() first.');
    }
    return this.world;
  }

  /**
   * Get the Rapier module (for creating bodies, colliders, etc.)
   */
  public getRapier(): typeof RAPIER_TYPE {
    if (!this.isInitialized) {
      throw new Error('[PhysicsService] Physics not initialized. Call start() first.');
    }
    return this.RAPIER;
  }

  /**
   * Check if physics is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}
