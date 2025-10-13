import type { GameObject } from './GameObject';
import type { I_GameContext } from './types';

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
 *   async init(context: I_GameContext): Promise<void> {
 *     const mesh = this.requireComponent(MeshComponent);
 *     const physics = this.getComponent(PhysicsComponent); // Optional
 *     // ... setup drag behavior
 *   }
 * }
 * ```
 */
export abstract class GameComponent {
  protected gameObject!: GameObject;

  /**
   * Initialization priority - lower numbers initialize first
   * Override in subclasses to control initialization order
   * Default: 1 (earliest - most components don't need to change this)
   */
  public readonly priority: number = ComponentPriority.DEFAULT;

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
   * Initialize component (called when GameObject is added to scene)
   * Use this to:
   * - Query sibling components
   * - Register with services (physics, interaction, etc.)
   * - Create Three.js objects
   * - Setup event listeners
   */
  abstract init(context: I_GameContext): Promise<void>;

  /**
   * Update component (called every frame)
   * Optional - only implement if component needs per-frame updates
   */
  update?(delta: number): void;

  /**
   * Cleanup component (called when GameObject is destroyed)
   * Optional - only implement if component needs manual cleanup
   * Note: Three.js objects registered with lifecycle.register() are cleaned up automatically
   */
  destroy?(): void;
}
