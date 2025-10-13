import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { I_ThemeColors } from '@/composables/useTheme';
import { Engine } from '@/game/Engine';
import { VFXModule } from '@/game/modules/scene/VFXModule';
import { CleanupRegistry } from '@/game/CleanupRegistry';
import type { InteractionService } from '@/game/services/InteractionService';
import { PhysicsService } from '@/game/services/PhysicsService';
import { BufferGeometry, BufferGeometryEventMap, NormalBufferAttributes, Scene } from 'three';
import { RGBColor } from '@/common/types';
import type { I_InteractableBehaviors } from './interaction.types';

/**
 * Core scene interface
 */
export interface I_GameScene {
  readonly name: string;
  readonly camera: ReturnType<typeof useCamera>;
  readonly engine: Engine;

  start(): void;
  update(delta: number): void;
  destroy(): void;
}

export interface I_SceneService {
  start(ctx: I_ModuleContext): Promise<void> | void;
  destroy(): Promise<void> | void;
}

/**
 * Configuration for creating a scene
 */
export interface I_SceneConfig {
  engine: Engine;
}

/**
 * Base module interface - all modules implement this
 * Optional lifecycle hooks via duck typing (no need for separate interfaces)
 */
export interface I_SceneModule {
  /**
   * Initialize the module
   */
  start(context: I_ModuleContext): Promise<void>;

  /**
   * Cleanup the module
   */
  destroy(context?: I_ModuleContext): Promise<void>;

  /**
   * Optional: Update each frame (only implement if needed)
   */
  update?(delta: number, ...args: any[]): void | Promise<void>;

  /**
   * Optional: React to theme changes (only implement if needed)
   * Receives full theme object - modules extract what they need
   */
  onThemeChange?(theme: I_ThemeColors): void;

  addToScene?(context: I_ModuleContext, ...args: any[]): void;
}

/**
 * Entity modules - lightweight features managed by scene modules
 */
export interface I_EntityModule {
  start(context: I_ModuleContext): Promise<void>;
  destroy(): Promise<void>;
  update?(delta: number): void;
}

/**
 * Services available to modules via context
 * This is how cross-cutting concerns (interaction, audio, etc.) are shared
 */
export interface I_ModuleServices extends Record<string, I_SceneService> {
  interaction: InteractionService;
  vfx: VFXModule;
  physics: PhysicsService;
  // Future: audio?: AudioService;
}

/**
 * Context passed to modules during initialization
 * Contains everything a module might need
 */
export interface I_ModuleContext {
  engine: Engine;
  scene: Scene;
  cleanupRegistry: CleanupRegistry;
  sceneName: string;
  services: I_ModuleServices;
  camera?: ReturnType<typeof useCamera>; // Optional: for modules that need camera
  character?: ReturnType<typeof useCharacter>; // Optional: for modules that need character
}
/**
 * Scene Object Configuration DTO
 * Refactored v2: Supports new interaction structure (hover, click, drag)
 */

export interface I_SceneObjectConfig {
  position: RGBColor;
  rotation?: RGBColor; // Euler angles in radians
  scale?: RGBColor; // Default [1, 1, 1]
  geometry: Partial<SceneObjectGeometryConfig>;
  material: {
    useTheme?: boolean; // If true, uses theme color and updates on theme change
    reactiveColor?: string; // If true, changes color to the key from theme on theme change
    staticColor?: number; // If set, uses this fixed color
    roughness?: number;
    metalness?: number;
  };
  castShadow?: boolean;
  receiveShadow?: boolean;

  // Interaction configuration (optional - makes object interactive)
  interactive?: boolean; // If true, object can be clicked/hovered
  interaction?: I_InteractableBehaviors; // Interaction behavior config (hover, click, drag)
}
export type SceneObjectGeometryConfig = BufferGeometry<
  NormalBufferAttributes,
  BufferGeometryEventMap
> & {
  type: 'plane' | 'box' | 'sphere' | 'cylinder' | 'cone';
  params: number[]; // Geometry-specific parameters
  grid?: boolean; // If true and type is plane, adds a grid helper
};
