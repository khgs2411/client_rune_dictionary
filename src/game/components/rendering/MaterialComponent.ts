import { MeshStandardMaterial } from 'three';
import { BaseMaterialComponent, I_BaseMaterialConfig } from './BaseMaterialComponent';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_MaterialConfig extends I_BaseMaterialConfig {
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
}

/**
 * MaterialComponent - Standard PBR material
 *
 * Creates a MeshStandardMaterial with roughness/metalness workflow.
 * Supports static colors, theme colors, and reactive theme colors.
 *
 * Usage:
 * ```typescript
 * // Static color
 * gameObject.addComponent(new MaterialComponent({
 *   color: 0xff1493,
 *   roughness: 0.8,
 *   metalness: 0.2
 * }));
 *
 * // Theme color (updates on theme change)
 * gameObject.addComponent(new MaterialComponent({
 *   useTheme: true
 * }));
 *
 * // Reactive color (specific theme color key)
 * gameObject.addComponent(new MaterialComponent({
 *   reactiveColor: 'background'
 * }));
 * ```
 */
export class MaterialComponent extends BaseMaterialComponent<
  MeshStandardMaterial,
  I_MaterialConfig
> {
  public material!: MeshStandardMaterial;

  constructor(config: I_MaterialConfig = {}) {
    super(config);
  }

  protected createMaterial(color: number, context: I_SceneContext): MeshStandardMaterial {
    return new MeshStandardMaterial({
      color,
      roughness: this.config.roughness ?? 0.8,
      metalness: this.config.metalness ?? 0.0,
      emissive: this.config.emissive ?? 0x000000,
      emissiveIntensity: this.config.emissiveIntensity ?? 1.0,
      transparent: this.config.transparent ?? false,
      opacity: this.config.opacity ?? 1.0,
    });
  }
}
