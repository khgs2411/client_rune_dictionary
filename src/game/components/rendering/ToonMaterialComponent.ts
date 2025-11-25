import { DataTexture, MeshToonMaterial, NearestFilter, RGBAFormat, Color } from 'three';
import { BaseMaterialComponent, I_BaseMaterialConfig } from './BaseMaterialComponent';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_ToonMaterialConfig extends I_BaseMaterialConfig {
  gradientSteps?: 3 | 4 | 5; // Number of cel-shading bands (default: 3)
  vibrant?: boolean; // Auto-boost saturation by 40% (default: false)
}

/**
 * ToonMaterialComponent - Cel-shaded material for OSRS + Genshin hybrid style
 *
 * Creates a MeshToonMaterial with configurable gradient steps for cel-shading.
 * Supports theme colors, reactive colors, and vibrant mode (saturation boost).
 *
 * Usage:
 * ```typescript
 * // Basic toon material
 * gameObject.addComponent(new ToonMaterialComponent({
 *   color: 0x228b22,
 *   gradientSteps: 3
 * }));
 *
 * // Vibrant toon material (40% saturation boost)
 * gameObject.addComponent(new ToonMaterialComponent({
 *   color: 0x654321,
 *   vibrant: true,
 *   gradientSteps: 5
 * }));
 * ```
 */
export class ToonMaterialComponent extends BaseMaterialComponent<
  MeshToonMaterial,
  I_ToonMaterialConfig
> {
  public material!: MeshToonMaterial;
  private gradientMap!: DataTexture;

  constructor(config: I_ToonMaterialConfig = {}) {
    super(config);
  }

  protected createMaterial(color: number, context: I_SceneContext): MeshToonMaterial {
    const finalColor = this.config.vibrant ? this.boostSaturation(color, 1.4) : color;

    // Create gradient map for cel-shading
    this.gradientMap = this.createGradientMap(this.config.gradientSteps ?? 3);
    context.cleanupRegistry.registerDisposable(this.gradientMap);

    return new MeshToonMaterial({
      color: finalColor,
      gradientMap: this.gradientMap,
      emissive: this.config.emissive ?? 0x000000,
      emissiveIntensity: this.config.emissiveIntensity ?? 0,
    });
  }

  /**
   * Override to apply vibrant mode when updating color
   */
  protected updateColor(color: number): void {
    if (this.material) {
      const finalColor = this.config.vibrant ? this.boostSaturation(color, 1.4) : color;
      this.material.color.setHex(finalColor);
    }
  }

  /**
   * Create a gradient map texture for cel-shading
   * More steps = smoother shading, fewer steps = more cartoon-like
   */
  private createGradientMap(steps: 3 | 4 | 5): DataTexture {
    const colors = this.getGradientColors(steps);
    const width = steps;
    const height = 1;

    // Create pixel data (RGBA for each step)
    const data = new Uint8Array(width * height * 4);

    for (let i = 0; i < steps; i++) {
      const stride = i * 4;
      data[stride] = colors[i]; // R
      data[stride + 1] = colors[i]; // G
      data[stride + 2] = colors[i]; // B
      data[stride + 3] = 255; // A
    }

    const texture = new DataTexture(data, width, height, RGBAFormat);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Get grayscale values for gradient steps
   * These control the light-to-dark bands in cel-shading
   */
  private getGradientColors(steps: 3 | 4 | 5): number[] {
    switch (steps) {
      case 3:
        // Classic cel-shading: shadow, mid, highlight
        return [80, 160, 255];
      case 4:
        // Smoother: deep shadow, shadow, mid, highlight
        return [60, 120, 180, 255];
      case 5:
        // Genshin-style: more gradual transitions
        return [50, 100, 150, 200, 255];
      default:
        return [80, 160, 255];
    }
  }

  /**
   * Boost saturation of a color by a factor
   * Used for "vibrant" mode to achieve Genshin-style colors
   */
  private boostSaturation(hexColor: number, factor: number): number {
    const color = new Color(hexColor);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);

    // Boost saturation, clamp to 1.0
    const boostedColor = new Color().setHSL(hsl.h, Math.min(1, hsl.s * factor), hsl.l);

    return boostedColor.getHex();
  }
}
