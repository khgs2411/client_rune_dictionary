import { GridHelper } from 'three';
import { GameComponent, ComponentPriority } from '../../GameComponent';
import { I_SceneContext } from '@/game/common/scenes.types';
import { TransformComponent } from './TransformComponent';

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

  async init(context: I_SceneContext): Promise<void> {
    const size = this.config.size ?? 10;
    const divisions = this.config.divisions ?? 10;
    const centerColor = this.config.centerColor ?? 0x444444;
    const gridColor = this.config.gridColor ?? 0x888888;
    const yOffset = this.config.yOffset ?? 0.01;

    // Create grid helper
    this.gridHelper = new GridHelper(size, divisions, centerColor, gridColor);

    // Get position from TransformComponent if available
    const transform = this.getComponent(TransformComponent);
    if (transform && transform.position) {
      this.gridHelper.position.set(
        transform.position.x,
        yOffset, // Use yOffset for Y, not transform.position.y
        transform.position.z,
      );
    } else {
      // Fallback: just use yOffset
      this.gridHelper.position.y = yOffset;
    }

    // Add to scene
    context.scene.add(this.gridHelper);

    // Register for cleanup
    context.cleanupRegistry.registerObject(this.gridHelper);
  }

  destroy(): void {
    // Remove grid helper from scene when GameObject is destroyed
    if (this.gridHelper && this.gridHelper.parent) {
      this.gridHelper.parent.remove(this.gridHelper);
    }
    // Dispose geometry manually (not handled by scene cleanup)
    if (this.gridHelper) {
      this.gridHelper.geometry?.dispose();
      const material = this.gridHelper.material;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material?.dispose();
      }
    }
  }
}
