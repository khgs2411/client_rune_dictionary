import SceneModule from '@/game/SceneModule';
import type { I_ModuleContext } from '@/scenes/scenes.types';
import { GameObject } from './GameObject';
import type { I_GameContext } from './types';

/**
 * GameObjectManager - Scene module that manages all GameObjects
 *
 * This is a SceneModule that fits into the existing scene architecture.
 * It handles:
 * - GameObject lifecycle (init, update, destroy)
 * - Collection management
 * - Context passing to components
 *
 * Usage in scene:
 * ```typescript
 * class PlaygroundScene extends GameScene {
 *   protected registerModules(): void {
 *     this.addModule('gameObjects', new GameObjectManager());
 *   }
 *
 *   protected addSceneObjects(): void {
 *     const manager = this.getModule('gameObjects')!;
 *
 *     const box = new GameObject({ id: 'box' })
 *       .addComponent(new GeometryComponent({ ... }))
 *       .addComponent(new MeshComponent());
 *
 *     manager.add(box);
 *   }
 * }
 * ```
 */
export class GameObjectManager extends SceneModule {
  private gameObjects = new Map<string, GameObject>();

  /**
   * Add a GameObject to the manager
   * If the manager is already initialized, the GameObject will be initialized immediately
   */
  add(gameObject: GameObject): void {
    if (this.gameObjects.has(gameObject.id)) {
      console.warn(
        `[GameObjectManager] GameObject with id "${gameObject.id}" already exists. Skipping.`,
      );
      return;
    }

    this.gameObjects.set(gameObject.id, gameObject);

    // If manager is already initialized, initialize the GameObject immediately
    if (this.context) {
      gameObject.init(this.context).catch((error) => {
        console.error(
          `[GameObjectManager] Failed to initialize GameObject "${gameObject.id}":`,
          error,
        );
      });
    }
  }

  /**
   * Remove a GameObject from the manager
   * Calls destroy() on the GameObject before removing
   */
  remove(id: string): void {
    const gameObject = this.gameObjects.get(id);
    if (gameObject) {
      gameObject.destroy();
      this.gameObjects.delete(id);
    }
  }

  /**
   * Get a GameObject by ID
   */
  get(id: string): GameObject | null {
    return this.gameObjects.get(id) || null;
  }

  /**
   * Check if a GameObject exists
   */
  has(id: string): boolean {
    return this.gameObjects.has(id);
  }

  /**
   * Get all GameObjects
   */
  getAll(): GameObject[] {
    return Array.from(this.gameObjects.values());
  }

  /**
   * Initialize all GameObjects
   * Called by scene when module is loaded
   * @internal
   */
  protected async init(context: I_ModuleContext): Promise<void> {
    this.context = context as I_GameContext;

    // Initialize all GameObjects
    for (const gameObject of this.gameObjects.values()) {
      try {
        await gameObject.init(this.context);
      } catch (error) {
        console.error(
          `[GameObjectManager] Failed to initialize GameObject "${gameObject.id}":`,
          error,
        );
      }
    }

    console.log(
      `✅ [GameObjectManager] Initialized ${this.gameObjects.size} GameObjects`,
    );
  }

  /**
   * Update all GameObjects
   * Called every frame by scene
   */
  public update(delta: number): void {
    for (const gameObject of this.gameObjects.values()) {
      gameObject.update(delta);
    }
  }

  /**
   * Destroy all GameObjects
   * Called when scene is destroyed
   */
  public async destroy(): Promise<void> {
    for (const gameObject of this.gameObjects.values()) {
      gameObject.destroy();
    }

    this.gameObjects.clear();

    console.log(`🧹 [GameObjectManager] Destroyed all GameObjects`);
  }
}
