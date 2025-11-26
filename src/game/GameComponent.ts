import { I_ThemeColors } from '@/composables/useTheme';
import type { GameObject } from './GameObject';
import { CleanupRegistry } from './CleanupRegistry';
import { Scene } from 'three';
import { I_SceneContext } from './common/scenes.types';

/**
 * Trait symbols for interface-based component lookup
 *
 * Traits allow components to declare what interfaces they implement,
 * enabling consumers to find any component with a trait without
 * knowing the concrete class.
 *
 * Usage:
 * ```typescript
 * // In component constructor:
 * this.registerTrait(TRAIT.MATERIAL_PROVIDER);
 *
 * // In consumer:
 * const material = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
 * ```
 */
export const TRAIT = {
  MATERIAL_PROVIDER: Symbol('I_MaterialProvider'),
  MESH_PROVIDER: Symbol('I_MeshProvider'),
} as const;

export type TraitKey = (typeof TRAIT)[keyof typeof TRAIT];

/**
 * Component initialization priority
 * Lower numbers initialize first
 *
 * Default priority is 1 (earliest)
 * Only set higher priorities for components that depend on others
 *
 * Priority guidelines:
 * - 1: Default (most components - transform, geometry, material, etc.)
 * - 100: Rendering components that combine others (MeshComponent)
 * - 200: Physics components (depend on mesh)
 * - 300: Interaction components (depend on mesh + physics)
 *
 * You can use enum values or plain numbers
 */
export enum ComponentPriority {
  DEFAULT = 1,
  RENDERING = 100,
  PHYSICS = 200,
  INTERACTION = 300,
}

/**
 * Base class for all game components
 * Components add functionality to GameObjects via composition
 *
 * Components can query sibling components on the same GameObject:
 * - this.getComponent(ComponentClass) - Returns component or null
 * - this.requireComponent(ComponentClass) - Returns component or throws
 *
 * Initialization order is determined by the `priority` property.
 * Lower priority numbers initialize first.
 *
 * Example:
 * ```typescript
 * class DragComponent extends GameComponent {
 *   public readonly priority = ComponentPriority.INTERACTION;
 *
 *   async init(context: I_SceneContext): Promise<void> {
 *     const mesh = this.requireComponent(MeshComponent);
 *     const physics = this.getComponent(PhysicsComponent); // Optional
 *     // ... setup drag behavior
 *   }
 * }
 * ```
 */

export interface I_GameComponent {
  init(context: I_SceneContext): Promise<void>;
  onAttach(gameObject: GameObject): void;
  update?(delta: number): void;
  destroy?(scene: Scene): void;
  onThemeChange?(theme: I_ThemeColors): void;
}

export abstract class GameComponent implements I_GameComponent {
  protected gameObject!: GameObject;

  /**
   * Component-level cleanup registry
   * Components should register their resources here for automatic cleanup
   *
   * Usage:
   * - this.cleanup.registerObject(mesh) - Auto-removes from scene + disposes
   * - this.cleanup.registerDisposable(geometry) - Disposes resource
   * - this.cleanup.registerWatcher(stopHandle) - Stops Vue watcher
   */
  protected cleanup = new CleanupRegistry();

  /**
   * Initialization priority - lower numbers initialize first
   * Override in subclasses to control initialization order
   * Default: 1 (earliest - most components don't need to change this)
   */
  public readonly priority: number = ComponentPriority.DEFAULT;

  /**
   * Set of traits this component provides
   * Traits are registered via registerTrait() in constructor
   */
  private readonly _traits = new Set<TraitKey>();

  /**
   * Register a trait this component provides
   * Call in constructor (after super()) to declare interface implementations
   *
   * @example
   * ```typescript
   * class MaterialComponent extends GameComponent implements I_MaterialProvider {
   *   constructor(config) {
   *     super();
   *     this.registerTrait(TRAIT.MATERIAL_PROVIDER);
   *   }
   * }
   * ```
   */
  protected registerTrait(trait: TraitKey): void {
    this._traits.add(trait);
  }

  /**
   * Check if this component has a trait
   * @internal Used by GameObject for trait-based lookup
   */
  public hasTrait(trait: TraitKey): boolean {
    return this._traits.has(trait);
  }

  /**
   * Called when component is attached to a GameObject
   * @internal - Called by GameObject.addComponent()
   */
  onAttach(gameObject: GameObject): void {
    this.gameObject = gameObject;
  }

  /**
   * Get a component from the same GameObject by class
   * Returns null if not found
   */
  protected getComponent<T extends GameComponent>(
    componentClass: new (...args: any[]) => T,
  ): T | null {
    return this.gameObject.getComponent(componentClass);
  }

  /**
   * Require a component from the same GameObject by class
   * Throws error if not found (use for required dependencies)
   */
  protected requireComponent<T extends GameComponent>(
    componentClass: new (...args: any[]) => T,
  ): T {
    const component = this.getComponent(componentClass);
    if (!component) {
      throw new Error(
        `[${this.constructor.name}] Required component ${componentClass.name} not found on GameObject "${this.gameObject.id}"`,
      );
    }
    return component;
  }

  /**
   * Restrict a component from being used on the same GameObject
   * Throws error if found (use to prevent incompatible component combinations)
   */
  protected restrictComponent(
    componentClass: new (...args: any[]) => GameComponent,
    reason?: string,
  ): void {
    if (this.gameObject.hasComponent(componentClass)) {
      const message = reason
        ? `[${this.constructor.name}] Cannot be used with ${componentClass.name} on GameObject "${this.gameObject.id}". ${reason}`
        : `[${this.constructor.name}] Cannot be used with ${componentClass.name} on GameObject "${this.gameObject.id}"`;
      throw new Error(message);
    }
  }

  /**
   * Find a sibling component by trait
   * Returns null if no component has the trait
   *
   * @example
   * ```typescript
   * const material = this.findByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
   * if (material) {
   *   console.log(material.material);
   * }
   * ```
   */
  protected findByTrait<T>(trait: TraitKey): T | null {
    return this.gameObject.findByTrait<T>(trait);
  }

  /**
   * Require a sibling component by trait
   * Throws error if no component has the trait
   *
   * @example
   * ```typescript
   * const material = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
   * this.mesh = new Mesh(geometry, material.material);
   * ```
   */
  protected requireByTrait<T>(trait: TraitKey): T {
    return this.gameObject.requireByTrait<T>(trait);
  }

  /**
   * Initialize component (called when GameObject is added to scene)
   * Use this to:
   * - Query sibling components
   * - Register with services (physics, interaction, etc.)
   * - Create Three.js objects
   * - Setup event listeners
   */
  public abstract init(context: I_SceneContext): Promise<void>;

  /**
   * Update component (called every frame)
   * Optional - only implement if component needs per-frame updates
   */
  public update?(delta: number): void;

  public onThemeChange?(theme: I_ThemeColors): void;

  /**
   * Cleanup component (called when GameObject is destroyed)
   *
   * Default implementation calls cleanup.cleanup() to dispose all registered resources.
   * Override if you need additional cleanup logic beyond what CleanupRegistry handles.
   *
   * If you override, call super.destroy() to ensure CleanupRegistry runs:
   * ```typescript
   * destroy() {
   *   // Your custom cleanup
   *   super.destroy();
   * }
   * ```
   */
  public destroy(scene: Scene): void {
    this.cleanup.cleanup(scene);
  }
}
