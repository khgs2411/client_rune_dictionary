import type { GameComponent, CapabilityKey } from './GameComponent';
import type { GameObjectType, I_GameObjectConfig } from './common/gameobject.types';
import { I_SceneContext } from './common/scenes.types';

/**
 * GameObject - Entity container for components
 *
 * A GameObject is just a container with an ID that holds components.
 * Components provide all functionality (rendering, physics, interactions, etc.)
 *
 * Usage:
 * ```typescript
 * const box = new GameObject({ id: 'box-1' })
 *   .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
 *   .addComponent(new MaterialComponent({ color: 0xff1493 }))
 *   .addComponent(new MeshComponent())
 *   .addComponent(new PhysicsComponent({ type: 'static' }))
 *   .addComponent(new DragComponent({ lockAxis: ['y'] }));
 * ```
 */
export class GameObject {
  public readonly id: string;
  protected readonly type?: GameObjectType;
  private components = new Map<Function, GameComponent>();
  private isInitialized = false;
  protected context: I_SceneContext | null = null;

  constructor(config: I_GameObjectConfig) {
    this.id = config.id;
    this.type = config.type || 'null';
  }

  /**
   * Add a component to this GameObject
   * Returns this for fluent API chaining
   *
   * Example:
   * ```typescript
   * gameObject
   *   .addComponent(new GeometryComponent({ ... }))
   *   .addComponent(new MaterialComponent({ ... }))
   *   .addComponent(new MeshComponent());
   * ```
   */
  public addComponent(component: GameComponent): this {
    if (this.isInitialized) {
      console.warn(
        `[GameObject] Adding component ${component.constructor.name} to already initialized GameObject "${this.id}". Component will not be initialized.`,
      );
    }

    component.onAttach(this);
    this.components.set(component.constructor, component);
    return this;
  }

  /**
   * Gets the type of this game object.
   *
   * Returns the GameObjectType assigned to this instance, or undefined if no type has been set.
   *
   * @returns The GameObjectType for this object, or undefined when not available.
   */
  public getType(): GameObjectType | undefined {
    return this.type;
  }

  /**
   * Determines whether this game object is of the given type.
   *
   * @param type - The GameObjectType to check against this object's type.
   * @returns True if this object's type strictly equals the provided type; otherwise false.
   *
   * @example
   * // returns true if the object's type is GameObjectType.Player
   * obj.isType(GameObjectType.Player);
   */
  public isType(type: GameObjectType): boolean {
    return this.type === type;
  }

  /**
   * Get a component by its class constructor
   * Returns null if not found
   *
   * Example:
   * ```typescript
   * const mesh = gameObject.getComponent(MeshComponent);
   * if (mesh) {
   *   // Use mesh component
   * }
   * ```
   */
  getComponent<T extends GameComponent>(componentClass: new (...args: any[]) => T): T | null {
    return (this.components.get(componentClass) as T) || null;
  }

  /**
   * Check if GameObject has a specific component
   */
  hasComponent(componentClass: Function): boolean {
    return this.components.has(componentClass);
  }

  /**
   * Find a component by capability
   * Returns null if no component provides the capability
   *
   * Example:
   * ```typescript
   * const material = gameObject.findByCapability<I_MaterialProvider>(CAPABILITY.MATERIAL_PROVIDER);
   * if (material) {
   *   console.log(material.material);
   * }
   * ```
   */
  findByCapability<T>(capability: CapabilityKey): T | null {
    for (const component of this.components.values()) {
      if (component.hasCapability(capability)) {
        return component as unknown as T;
      }
    }
    return null;
  }

  /**
   * Require a component by capability
   * Throws error if no component provides the capability
   *
   * Example:
   * ```typescript
   * const material = gameObject.requireByCapability<I_MaterialProvider>(CAPABILITY.MATERIAL_PROVIDER);
   * this.mesh = new Mesh(geometry, material.material);
   * ```
   */
  requireByCapability<T>(capability: CapabilityKey): T {
    const component = this.findByCapability<T>(capability);
    if (!component) {
      throw new Error(
        `[GameObject] No component with capability ${capability.description} found on "${this.id}"`,
      );
    }
    return component;
  }

  /**
   * Check if any component provides a specific capability
   */
  hasCapability(capability: CapabilityKey): boolean {
    return this.findByCapability(capability) !== null;
  }

  /**
   * Remove a component from this GameObject
   * Note: This does NOT call destroy() on the component
   */
  removeComponent(componentClass: Function): void {
    this.components.delete(componentClass);
  }

  /**
   * Get all components (for iteration)
   */
  getAllComponents(): GameComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * Initialize all components
   * Components are initialized in priority order (lower priority first)
   * Called by GameObjectManager when GameObject is added to scene
   * @internal
   */
  public async init(context: I_SceneContext): Promise<void> {
    if (this.isInitialized) {
      console.warn(`[GameObject] GameObject "${this.id}" already initialized`);
      return;
    }

    // Store context for later use (destroy, etc.)
    this.context = context;

    // Sort components by priority (lower number = initialize first)
    const sortedComponents = Array.from(this.components.values()).sort(
      (a, b) => a.priority - b.priority,
    );

    // Initialize components in priority order
    for (const component of sortedComponents) {
      await component.init(context);
    }

    // Handle services lifecycle coordination (SOLID compliance)
    await this.registerWithServices(context);

    this.isInitialized = true;
  }

  /**
   * Register with various services as needed
   * This method handles lifecycle coordination for services that
   * require multiple components to work together (e.g. interaction)
   * @private
   */
  private async registerWithServices(context: I_SceneContext): Promise<void> {
    // DISABLED: Old I_Interactable pattern replaced by InteractionComponent
    // InteractionComponent now handles all interaction registration internally
    // await this.registerInteractions(context);
    // No service registration needed - components handle their own service integration
  }

  /**
   * DEPRECATED: Old I_Interactable pattern
   *
   * This method is disabled. Use InteractionComponent instead.
   *
   * Migration path:
   * - Old: Components implemented I_Interactable + GameObject coordinated via InteractableBuilder
   * - New: Add InteractionComponent to GameObject + listen to events via .on('click', callback)
   *
   * Example:
   * ```typescript
   * // Old way (deprecated):
   * class MyComponent extends GameComponent implements I_Interactable {
   *   registerInteractions(builder: I_InteractionBuilder) {
   *     builder.withClickVFX('POW!');
   *   }
   * }
   *
   * // New way (recommended):
   * class MyComponent extends GameComponent {
   *   async init(context: I_SceneContext) {
   *     const interaction = this.getComponent(InteractionComponent);
   *     interaction.on('click', (intersection) => {
   *     });
   *   }
   * }
   * ```
   *
   * @deprecated Use InteractionComponent instead
   * @private
   */
  private async registerInteractions(context: I_SceneContext): Promise<void> {
    // Method disabled - see deprecation notice above
    return;
  }

  /**
   * Update all components that have update() method
   * Called by GameObjectManager every frame
   * @internal
   */
  public update(delta: number): void {
    if (!this.isInitialized) return;

    for (const component of this.components.values()) {
      if (component.update) {
        component.update(delta);
      }
    }
  }

  /**
   * Destroy all components
   * Called by GameObjectManager when GameObject is removed
   * @internal
   */
  public destroy(): void {
    if (!this.context) {
      console.warn(`[GameObject] GameObject "${this.id}" destroyed before initialization`);
      this.components.clear();
      return;
    }

    // Destroy all components (each component's CleanupRegistry will run)
    for (const component of this.components.values()) {
      if (component.destroy) {
        component.destroy(this.context.scene);
      }
    }

    this.components.clear();
    this.context = null;
    this.isInitialized = false;
  }
}
