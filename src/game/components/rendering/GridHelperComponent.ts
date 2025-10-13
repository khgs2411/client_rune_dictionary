import { GridHelper } from 'three';
import { GameComponent, ComponentPriority } from '../../GameComponent';
import type { I_GameContext } from '../../common/gameobject.types';

export interface I_GridHelperConfig {
  size?: number;
  divisions?: number;
  centerColor?: number;
  gridColor?: number;
  yOffset?: number; // Prevent z-fighting (default: 0.01)
}

/**
 * GridHelperComponent - Adds a visual grid helper to a GameObject
 *
 * This component creates a Three.js GridHelper centered on the GameObject's position.
 * Commonly used with plane geometries to visualize ground tiles.
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new GridHelperComponent({
 *   size: 10,
 *   divisions: 10,
 *   centerColor: 0x444444,
 *   gridColor: 0x888888
 * }));
 * ```
 */
export class GridHelperComponent extends GameComponent {
  public readonly priority = ComponentPriority.RENDERING; // 100 - creates helper after transform

  private config: I_GridHelperConfig;
  private gridHelper!: GridHelper;

  constructor(config: I_GridHelperConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_GameContext): Promise<void> {
    const size = this.config.size ?? 10;
    const divisions = this.config.divisions ?? 10;
    const centerColor = this.config.centerColor ?? 0x444444;
    const gridColor = this.config.gridColor ?? 0x888888;
    const yOffset = this.config.yOffset ?? 0.01;

    // Create grid helper
    this.gridHelper = new GridHelper(size, divisions, centerColor, gridColor);

    // Position slightly above ground to prevent z-fighting
    this.gridHelper.position.y = yOffset;

    // Add to scene
    context.scene.add(this.gridHelper);

    // Register for cleanup
    context.cleanupRegistry.register(this.gridHelper);
  }

  destroy(): void {
    // Cleanup handled by lifecycle.register()
  }
}
