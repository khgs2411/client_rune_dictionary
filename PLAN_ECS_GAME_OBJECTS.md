# ECS Game Object System Implementation Plan

## Overview

Implementing a slim ECS (Entity-Component-System) architecture for game objects in the RUNE RPG project. This separates game objects from scene modules, providing a clean, composable system for creating and managing entities in the game world.

## Architecture Principles

### Core Concepts

1. **GameObject = Entity** - Just a container with an ID that holds components
2. **GameComponent = Behavior** - Reusable functionality that can be attached to any GameObject
3. **Components Query Siblings** - Components can find and interact with other components on the same GameObject
4. **No Type Enums** - Use `instanceof` and constructor-based lookups (zero boilerplate!)
5. **Everything is a Component** - Mesh, geometry, material, physics, interactions - all components
6. **GameObject Subclasses = Prefabs** - Pre-configured component bundles for common objects
7. **GameObjectManager = SceneModule** - Fits perfectly into existing scene module architecture

## Class Structure

### 1. GameObject (Entity - Container Only)

```typescript
class GameObject {
  id: string;
  private components = new Map<Function, GameComponent>();

  // Fluent API for adding components
  addComponent(component: GameComponent): this {
    component.onAttach(this);
    this.components.set(component.constructor, component);
    return this; // Chainable
  }

  // Query by class constructor (no enum needed!)
  getComponent<T extends GameComponent>(
    componentClass: new (...args: any[]) => T
  ): T | null {
    return this.components.get(componentClass) as T || null;
  }

  hasComponent(componentClass: Function): boolean
  removeComponent(componentClass: Function): void

  // Lifecycle propagates to all components
  async init(context: GameContext): Promise<void>
  update(delta: number): void
  destroy(): void
}
```

### 2. GameComponent (Base Class)

```typescript
abstract class GameComponent {
  protected gameObject!: GameObject;

  onAttach(gameObject: GameObject): void {
    this.gameObject = gameObject;
  }

  // Helper to query sibling components by class
  protected getComponent<T extends GameComponent>(
    componentClass: new (...args: any[]) => T
  ): T | null {
    return this.gameObject.getComponent(componentClass);
  }

  // Require component (throws if missing)
  protected requireComponent<T extends GameComponent>(
    componentClass: new (...args: any[]) => T
  ): T {
    const comp = this.getComponent(componentClass);
    if (!comp) throw new Error(`Required component ${componentClass.name} not found`);
    return comp;
  }

  // Lifecycle hooks
  abstract init(context: GameContext): Promise<void>
  update?(delta: number): void
  destroy?(): void
}
```

### 3. Core Components

#### Rendering Components

- **TransformComponent** - Position, rotation, scale data
- **GeometryComponent** - Creates and manages BufferGeometry
- **MaterialComponent** - Creates and manages Material
- **MeshComponent** - Combines geometry + material → Mesh, adds to scene
- **InstancedMeshComponent** - Handles Three.js InstancedMesh logic

#### Interaction Components

- **PhysicsComponent** - Registers with PhysicsService (static/kinematic bodies)
- **DragComponent** - Handles drag interactions via InteractionService
- **ClickComponent** - Handles click events
- **HoverComponent** - Handles hover effects (glow, tooltip)

#### System Components

- **PersistenceComponent** - Handles save/load via SceneStore
- **HealthComponent** - Example: game-specific state (for future)
- **AnimationComponent** - Example: animation state (for future)

### 4. GameObjectManager (SceneModule)

```typescript
class GameObjectManager extends SceneModule {
  private gameObjects = new Map<string, GameObject>();

  add(gameObject: GameObject): void {
    this.gameObjects.set(gameObject.id, gameObject);
    // Automatically calls gameObject.init(context) when scene loads
  }

  remove(id: string): void {
    const obj = this.gameObjects.get(id);
    if (obj) {
      obj.destroy();
      this.gameObjects.delete(id);
    }
  }

  get(id: string): GameObject | null

  // Lifecycle - propagates to all GameObjects
  async init(context: I_ModuleContext): Promise<void>
  update(delta: number): void
  destroy(): void
}
```

### 5. GameObject Subclasses (Prefabs)

```typescript
// Example: Ground prefab
class Ground extends GameObject {
  constructor(config: GroundConfig) {
    super({ id: config.id });

    this.addComponent(new TransformComponent({ position: [0, 0, 0] }));
    this.addComponent(new GeometryComponent({ type: 'plane', params: [100, 100] }));
    this.addComponent(new MaterialComponent({ reactiveColor: 'background' }));
    this.addComponent(new InstancedMeshComponent({ count: 1 }));
    this.addComponent(new PhysicsComponent({ type: 'static', shape: 'cuboid' }));
  }
}

// Example: Editable box prefab
class EditableBox extends GameObject {
  constructor(config: EditableBoxConfig) {
    super({ id: config.id });

    this.addComponent(new TransformComponent({ position: config.position }));
    this.addComponent(new GeometryComponent({ type: 'box', params: config.size }));
    this.addComponent(new MaterialComponent({ color: config.color }));
    this.addComponent(new MeshComponent());
    this.addComponent(new PhysicsComponent({ type: 'static', shape: 'cuboid' }));
    this.addComponent(new DragComponent({ lockAxis: ['y'], onEnd: config.onDragEnd }));
    this.addComponent(new PersistenceComponent());
  }
}
```

## Usage Examples

### Scene Setup

```typescript
class PlaygroundScene extends GameScene {
  protected registerModules(): void {
    // Register GameObjectManager as a module
    this.addModule('gameObjects', new GameObjectManager());
  }

  protected addSceneObjects(): void {
    const objectManager = this.getModule('gameObjects');

    // Using prefabs
    const ground = new Ground({ id: 'ground' });
    objectManager.add(ground);

    // Custom composition
    const box = new GameObject({ id: 'pink-box' })
      .addComponent(new TransformComponent({ position: [-3, 1, 3] }))
      .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
      .addComponent(new MaterialComponent({ color: 0xff1493 }))
      .addComponent(new MeshComponent())
      .addComponent(new PhysicsComponent({ type: 'static', shape: 'cuboid' }))
      .addComponent(new DragComponent({
        lockAxis: ['y'],
        onEnd: (pos) => console.log('Dragged to:', pos)
      }))
      .addComponent(new PersistenceComponent());

    objectManager.add(box);

    // Instanced objects (trees)
    const treeGroup = new GameObject({ id: 'tree-group' })
      .addComponent(new GeometryComponent({ type: 'cylinder', params: [0.15, 0.2, 1.5] }))
      .addComponent(new MaterialComponent({ staticColor: 0x654321 }))
      .addComponent(new InstancedMeshComponent({
        count: 5,
        positions: [
          [10, 0.75, 0],
          [12, 0.75, 2],
          [14, 0.75, -1],
          [10, 0.75, -3],
          [13, 0.75, -2],
        ]
      }))
      .addComponent(new PhysicsComponent({ type: 'static', shape: 'cylinder' }));

    objectManager.add(treeGroup);
  }
}
```

### Component Interaction Example

```typescript
// DragComponent queries other components
class DragComponent extends GameComponent {
  async init(context: GameContext): Promise<void> {
    // Require mesh for interaction
    const mesh = this.requireComponent(MeshComponent);
    const transform = this.requireComponent(TransformComponent);

    // Register drag with InteractionService
    context.services.interaction.register(this.gameObject.id, mesh.mesh)
      .withDrag({
        lockAxis: this.config.lockAxis,
        onEnd: (pos) => this.handleDragEnd(pos, context, transform)
      });
  }

  private handleDragEnd(pos: Vector3, context: GameContext, transform: TransformComponent): void {
    // Update transform
    transform.setPosition(pos);

    // Update physics if component exists
    const physics = this.getComponent(PhysicsComponent);
    if (physics) {
      context.services.physics.setPosition(this.gameObject.id, pos);
    }

    // Save position if persistent
    const persistence = this.getComponent(PersistenceComponent);
    if (persistence) {
      persistence.savePosition(pos);
    }

    // Custom callback
    this.config.onEnd?.(pos);
  }
}
```

## Benefits

✅ **Composition over Inheritance** - Mix and match components freely
✅ **Zero Boilerplate** - No ComponentType enums to maintain
✅ **Type-Safe** - TypeScript infers component types automatically
✅ **Reusable Components** - Write once, use anywhere
✅ **Clean Separation** - GameObject = data container, Components = behavior
✅ **Easy to Extend** - Add new components without touching existing code
✅ **Fits Existing Architecture** - GameObjectManager is just another SceneModule
✅ **Optional Features** - Only add components you need
✅ **Instancing Support** - InstancedMeshComponent handles Three.js complexity
✅ **Editor Integration** - DragComponent + PersistenceComponent = automatic level editor support

## Migration Strategy

1. **Phase 1**: Implement core ECS classes (GameObject, GameComponent, GameObjectManager)
2. **Phase 2**: Implement rendering components (Transform, Geometry, Material, Mesh, InstancedMesh)
3. **Phase 3**: Implement interaction components (Physics, Drag, Click, Hover)
4. **Phase 4**: Implement system components (Persistence)
5. **Phase 5**: Create prefab classes (Ground, EditableBox, etc.)
6. **Phase 6**: Refactor PlaygroundScene to use new system
7. **Phase 7**: Deprecate old SceneObjectsModule and SceneInstancedObjectsModule

## File Structure

```
src/game/ecs/
├── GameObject.ts                    # Entity container
├── GameComponent.ts                 # Base component class
├── GameObjectManager.ts             # System (SceneModule)
├── components/
│   ├── rendering/
│   │   ├── TransformComponent.ts
│   │   ├── GeometryComponent.ts
│   │   ├── MaterialComponent.ts
│   │   ├── MeshComponent.ts
│   │   └── InstancedMeshComponent.ts
│   ├── interaction/
│   │   ├── PhysicsComponent.ts
│   │   ├── DragComponent.ts
│   │   ├── ClickComponent.ts
│   │   └── HoverComponent.ts
│   └── system/
│       └── PersistenceComponent.ts
├── prefabs/
│   ├── Ground.ts
│   ├── EditableBox.ts
│   └── TreeGroup.ts
└── types.ts                         # Shared types and interfaces
```

---

## Implementation TODO

### Phase 1: Core ECS Classes ✅
- [x] Create `GameObject` class with component management
- [x] Create `GameComponent` base class with lifecycle hooks
- [x] Create `GameObjectManager` as SceneModule
- [x] Define `GameContext` interface (engine, scene, services, lifecycle)
- [x] Create shared types file

### Phase 2: Rendering Components ✅
- [x] Implement `TransformComponent` (position, rotation, scale)
- [x] Implement `GeometryComponent` (creates BufferGeometry from config)
- [x] Implement `MaterialComponent` (creates Material from config)
- [x] Implement `MeshComponent` (combines geometry + material)
- [ ] Implement `InstancedMeshComponent` (handles Three.js instancing) - DEFERRED

### Phase 3: Interaction Components ✅
- [x] Implement `PhysicsComponent` (integrates with PhysicsService)
- [x] Implement `DragComponent` (integrates with InteractionService)
- [x] Implement `ClickComponent` (click events)
- [x] Implement `HoverComponent` (hover effects)

### Phase 4: System Components ✅
- [x] Implement `PersistenceComponent` (save/load via SceneStore)

### Phase 5: Prefabs ✅
- [x] Create `EditableBox` prefab class
- [ ] Create `Ground` prefab class - DEFERRED
- [ ] Create `TreeGroup` prefab class (instanced) - DEFERRED

### Phase 6: Scene Integration ✅
- [x] Update PlaygroundScene to use GameObjectManager
- [x] Create example ECS GameObject (green box)

### Phase 7: Refactor - SOLID Compliance (IN PROGRESS)
- [x] Identify issue: Multiple interaction components overwriting registrations
- [ ] Create `I_InteractionBuilder` interface (SOLID - depend on abstractions)
- [ ] Create lifecycle interfaces in types.ts:
  - [ ] `I_Interactable` - for interaction components
  - [ ] `I_Renderable` - for rendering components (empty, future-proofing)
  - [ ] `I_Physical` - for physics components (empty, future-proofing)
- [ ] Make `InteractableBuilder` implement `I_InteractionBuilder`
- [ ] Update interaction components to implement `I_Interactable`:
  - [ ] Remove direct `register()` calls from `init()`
  - [ ] Add `registerWithService(builder, context)` method
  - [ ] DragComponent
  - [ ] ClickComponent
  - [ ] HoverComponent
- [ ] Update `GameObject` to handle interaction lifecycle:
  - [ ] Add `registerInteractions()` method
  - [ ] Call at end of `init()` to consolidate all interactions
  - [ ] Query components implementing `I_Interactable`
  - [ ] Create single builder, let each component register itself
- [ ] Remove `src/game/ecs/index.ts` exports file (import from file paths)

### Phase 8: Testing
- [ ] Test level editor with refactored ECS system
- [ ] Verify all interactions work (drag, hover, click)
- [ ] Verify save/load works with PersistenceComponent
- [ ] Test hot reload behavior

### Phase 9: Future Cleanup (DEFERRED)
- [ ] Mark SceneObjectsModule as deprecated
- [ ] Mark SceneInstancedObjectsModule as deprecated
- [ ] Update documentation
- [ ] Remove debug logging (if any)

---

## Notes

- **Component Dependencies**: Components can require other components (e.g., MeshComponent requires GeometryComponent + MaterialComponent)
- **Initialization Order**: GameObjectManager handles initialization order automatically based on component dependencies
- **Hot Reload**: GameObject lifecycle integrates with scene lifecycle, so HMR should work seamlessly
- **Performance**: InstancedMeshComponent handles Three.js instancing internally, keeping rendering efficient
- **Editor Support**: Any GameObject with DragComponent + PersistenceComponent is automatically editable in the level editor
