import type { GameComponent } from './GameComponent';
import type { I_GameContext, I_GameObjectConfig, I_Interactable } from './types';
import { MeshComponent } from './components/rendering/MeshComponent';

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
  private components = new Map<Function, GameComponent>();
  private isInitialized = false;

  constructor(config: I_GameObjectConfig) {
    this.id = config.id;
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
  addComponent(component: GameComponent): this {
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
  async init(context: I_GameContext): Promise<void> {
    if (this.isInitialized) {
      console.warn(`[GameObject] GameObject "${this.id}" already initialized`);
      return;
    }

    // Sort components by priority (lower number = initialize first)
    const sortedComponents = Array.from(this.components.values()).sort(
      (a, b) => a.priority - b.priority
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
  private async registerWithServices(context: I_GameContext): Promise<void> {
    // Handle interaction lifecycle coordination 
    await this.registerInteractions(context);
  }

  /**
   * Register all interaction components with InteractionService
   * This method coordinates multiple I_Interactable components into a single
   * registration, preventing overwrites.
   *
   * Lifecycle hook called at end of init() - GameObject acts as lifecycle
   * coordinator for interaction system.
   * @private
   */
  private async registerInteractions(context: I_GameContext): Promise<void> {
    // Check if MeshComponent exists (required for interactions)
    const meshComp = this.getComponent(MeshComponent);
    if (!meshComp) {
      // No mesh = no visual interactions possible
      return;
    }

    // Collect all components implementing I_Interactable
    const interactables: I_Interactable[] = [];
    for (const component of this.components.values()) {
      // Type guard: Check if component implements I_Interactable interface
      if ('registerInteractions' in component && typeof (component as any).registerInteractions === 'function') {
        interactables.push(component as I_Interactable);
      }
    }

    // If no interactable components, skip registration
    if (interactables.length === 0) {
      return;
    }

    // Create single builder for all interactions
    const builder = context.services.interaction.register(this.id, meshComp.mesh);

    // Let each interactable component add its behaviors to the builder
    for (const interactable of interactables) {
      interactable.registerInteractions(builder, context);
    }

    // Builder auto-registers via promise callback when done
  }

  /**
   * Update all components that have update() method
   * Called by GameObjectManager every frame
   * @internal
   */
  update(delta: number): void {
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
  destroy(): void {
    for (const component of this.components.values()) {
      if (component.destroy) {
        component.destroy();
      }
    }

    this.components.clear();
    this.isInitialized = false;
  }
}
