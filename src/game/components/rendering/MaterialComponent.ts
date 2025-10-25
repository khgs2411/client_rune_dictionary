import { MeshStandardMaterial } from 'three';
import { GameComponent } from '../../GameComponent';
import { useSettingsStore } from '@/stores/settings.store';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneContext } from '@/game/common/scenes.types';

export interface I_MaterialConfig {
  color?: number; // Static color
  reactiveColor?: keyof ReturnType<typeof useSettingsStore>['theme']; // Theme color key
  roughness?: number;
  metalness?: number;
  useTheme?: boolean; // Use primary theme color
  emissive?: number; // Emissive color (glow)
  emissiveIntensity?: number; // Emissive intensity (default: 1)
  transparent?: boolean; // Enable transparency
  opacity?: number; // Opacity (0-1, default: 1)
}

/**
 * MaterialComponent - Creates and manages Three.js Material
 *
 * This component creates material based on configuration.
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
export class MaterialComponent extends GameComponent {
  public material!: MeshStandardMaterial;
  private config: I_MaterialConfig;
  private settings = useSettingsStore();

  constructor(config: I_MaterialConfig = {}) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    const color = this.getColor();

    this.material = new MeshStandardMaterial({
      color,
      roughness: this.config.roughness ?? 0.8,
      metalness: this.config.metalness ?? 0.0,
      emissive: this.config.emissive ?? 0x000000,
      emissiveIntensity: this.config.emissiveIntensity ?? 1.0,
      transparent: this.config.transparent ?? false,
      opacity: this.config.opacity ?? 1.0,
    });

    // Register material for disposal (materials are disposable, not Object3D)
    context.cleanupRegistry.registerDisposable(this.material);
  }

  private getColor(): number {
    // Priority: color > reactiveColor > useTheme > default
    if (this.config.color !== undefined) {
      return this.config.color;
    }

    if (this.config.reactiveColor) {
      return this.settings.theme[this.config.reactiveColor] as number;
    }

    if (this.config.useTheme) {
      return this.settings.theme.primaryForeground;
    }

    return 0x808080; // Default gray
  }

  /**
   * Update material color (useful for theme changes)
   */
  private updateColor(color: number): void {
    if (this.material) {
      this.material.color.setHex(color);
    }
  }

  public onThemeChange(theme: I_ThemeColors): void {
    if (this.isThemed) {
      const newColor = this.getColor();
      this.updateColor(newColor);
    }
  }

  /**
   * Check if material should respond to theme changes
   */
  get isThemed(): boolean {
    return Boolean(this.config.useTheme || this.config.reactiveColor);
  }

  public destroy(): void {
    // Material cleanup handled by lifecycle.register()
  }
}
