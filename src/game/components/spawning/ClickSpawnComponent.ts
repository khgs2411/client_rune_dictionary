import { SpawnComponent, I_SpawnConfig } from './SpawnComponent';
import type { I_SceneContext } from '@/game/common/scenes.types';
import { useEventListener } from '@vueuse/core';
import { Raycaster, Vector2, Vector3 } from 'three';

/**
 * Configuration for click-triggered spawning
 */
export interface I_ClickSpawnConfig extends I_SpawnConfig {
  button?: 'left' | 'right' | 'middle'; // Mouse button (default: 'left')
  spawnAtCursor?: boolean; // Spawn at raycast hit point (default: true)
  spawnDistance?: number; // If not spawnAtCursor, spawn at this distance from camera
  spawnHeight?: number; // Height offset for spawn position (default: 0)
}

/**
 * ClickSpawnComponent - Spawn objects via mouse click
 *
 * Extends SpawnComponent with mouse click listening and raycasting.
 *
 * Usage:
 * ```typescript
 * player.addComponent(new ClickSpawnComponent({
 *   button: 'left',
 *   spawnType: 'bullet',
 *   cooldown: 500, // 0.5 second
 *   spawnAtCursor: true, // Spawn at raycast hit
 *   getSpawnData: (owner) => ({
 *     direction: camera.getWorldDirection(new Vector3()),
 *     velocity: 20
 *   })
 * }));
 * ```
 */
export class ClickSpawnComponent extends SpawnComponent {
  private clickConfig: I_ClickSpawnConfig;
  private raycaster = new Raycaster();
  private mouse = new Vector2();

  constructor(config: I_ClickSpawnConfig) {
    super(config);
    this.clickConfig = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    await super.init(context);

    // Register mouse click listener with cleanup registry
    const stopListener = useEventListener('mousedown', (event: MouseEvent) => {
      this.handleClick(event);
    });

    // Register cleanup with CleanupRegistry
    this.cleanup.registerWatcher(stopListener);

    console.log(
      `🖱️  [ClickSpawnComponent] Registered ${this.clickConfig.button || 'left'}-click for "${this.config.spawnType}"`,
    );
  }

  /**
   * Handle mouse click
   */
  private handleClick(event: MouseEvent): void {
    // Check button
    const button = this.clickConfig.button || 'left';
    const buttonMap = { left: 0, middle: 1, right: 2 };
    if (event.button !== buttonMap[button]) return;

    // Prevent default (especially for right-click)
    event.preventDefault();

    // Calculate spawn position
    const spawnPosition = this.calculateSpawnPosition(event);

    // Temporarily override getSpawnData to inject click position
    const originalGetSpawnData = this.config.getSpawnData;
    this.config.getSpawnData = (owner) => {
      const baseData = originalGetSpawnData ? originalGetSpawnData(owner) : {};
      return {
        ...baseData,
        position: spawnPosition,
      };
    };

    // Attempt spawn
    this.trySpawn();

    // Restore original getSpawnData
    this.config.getSpawnData = originalGetSpawnData;
  }

  /**
   * Calculate spawn position based on raycast or distance
   */
  private calculateSpawnPosition(event: MouseEvent): Vector3 {
    const camera = this.context.camera?.instance;
    if (!camera) {
      console.warn('[ClickSpawnComponent] No camera available, spawning at origin');
      return new Vector3(0, 0, 0);
    }

    // Normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, camera);

    if (this.clickConfig.spawnAtCursor !== false) {
      // Raycast against scene objects
      const intersects = this.raycaster.intersectObjects(this.context.scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].point.clone();
        hit.y += this.clickConfig.spawnHeight ?? 0;
        return hit;
      }
    }

    // Fallback: Spawn at fixed distance from camera
    const distance = this.clickConfig.spawnDistance ?? 5;
    const spawnPos = camera.position
      .clone()
      .add(this.raycaster.ray.direction.clone().multiplyScalar(distance));
    spawnPos.y += this.clickConfig.spawnHeight ?? 0;

    return spawnPos;
  }

  destroy(): void {
    super.destroy();
    // Cleanup handled by CleanupRegistry
    console.log(`🖱️  [ClickSpawnComponent] Unregistered click listener`);
  }
}
