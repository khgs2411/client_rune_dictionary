import { Material } from 'three';
import { GameComponent, CAPABILITY } from '../../GameComponent';
import { useSettingsStore } from '@/stores/settings.store';
import { I_ThemeColors } from '@/composables/useTheme';
import { I_SceneContext } from '@/game/common/scenes.types';
import { I_MaterialProvider } from './mesh.types';

/**
 * Base configuration shared by all material components
 */
export interface I_BaseMaterialConfig {
  color?: number; // Static color
  reactiveColor?: keyof ReturnType<typeof useSettingsStore>['theme']; // Theme color key
  useTheme?: boolean; // Use primary theme color
  emissive?: number; // Emissive color (glow)
  emissiveIntensity?: number; // Emissive intensity (default varies by subclass)
}

/**
 * BaseMaterialComponent - Abstract base for all material components
 *
 * Provides shared logic for:
 * - Color resolution (static, theme, reactive)
 * - Theme change handling
 * - Settings store integration
 * - Automatic MATERIAL_PROVIDER capability registration
 *
 * Subclasses must implement:
 * - `createMaterial(color, context)` - Create the specific Three.js material
 *
 * Usage:
 * ```typescript
 * export class MyMaterialComponent extends BaseMaterialComponent<
 *   MeshBasicMaterial,
 *   I_MyMaterialConfig
 * > {
 *   protected createMaterial(color: number, context: I_SceneContext): MeshBasicMaterial {
 *     return new MeshBasicMaterial({ color });
 *   }
 * }
 * ```
 */
export abstract class BaseMaterialComponent<
    TMaterial extends Material,
    TConfig extends I_BaseMaterialConfig,
  >
  extends GameComponent
  implements I_MaterialProvider
{
  public abstract material: TMaterial;
  protected config: TConfig;
  protected settings = useSettingsStore();

  constructor(config: TConfig) {
    super();
    this.config = config;
    // Auto-register capability - subclasses inherit this
    this.registerCapability(CAPABILITY.MATERIAL_PROVIDER);
  }

  async init(context: I_SceneContext): Promise<void> {
    const color = this.getColor();
    this.material = this.createMaterial(color, context);
    context.cleanupRegistry.registerDisposable(this.material);
  }

  /**
   * Create the material instance
   * Subclasses implement this to create their specific material type
   */
  protected abstract createMaterial(color: number, context: I_SceneContext): TMaterial;

  /**
   * Resolve color from config
   * Priority: color > reactiveColor > useTheme > default gray
   */
  protected getColor(): number {
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
   * Update material color
   * Override in subclasses for custom color handling (e.g., vibrant mode)
   */
  protected updateColor(color: number): void {
    if (this.material && 'color' in this.material) {
      (this.material as any).color.setHex(color);
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
    // Cleanup handled by cleanupRegistry
  }
}
