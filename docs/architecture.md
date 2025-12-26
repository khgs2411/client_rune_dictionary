# Architecture Deep-Dive

## Dual Architecture System

### 1. SceneModule Pattern

Scene infrastructure - singular per scene.

**Lifecycle**: `init(context)` → `update(delta)` → `destroy()`

**Examples**: LightingModule, CharacterModule, EnvironmentModule

**When to use**: Infrastructure that exists once per scene (lighting, camera rigs, environment setup).

### 2. GameObject/Component Pattern

Game entities - multiple instances.

**Examples**: TrainingDummy, Ground, Trees, LocalPlayer

**When to use**: Anything you might spawn multiple of, or that represents a discrete game entity.

**Rule of thumb**: Multiple instances → GameObject. Singular infrastructure → SceneModule.

---

## Component Priority Order

Components initialize in priority order:

```
1. DEFAULT (1)       - Transform, Geometry, Material
2. RENDERING (100)   - MeshComponent
3. PHYSICS (200)     - PhysicsComponent
4. INTERACTION (300) - Hover, Click, Drag components
```

This ensures dependencies are available when higher-priority components initialize.

---

## Pattern B: Layered Components

The recommended pattern for complex interactions.

### Capability Layer

Pure data emitters - no visual logic, just events.

| Component              | Emits                    |
| ---------------------- | ------------------------ |
| `InteractionComponent` | click, doubleclick       |
| `HoverComponent`       | start, end (no visuals!) |
| `UnitsComponent`       | distance measurements    |

**Key rule**: Capability components NEVER apply visuals directly.

### Orchestrator Layer

Listen to events, check conditions, coordinate responses.

| Component        | Responsibility                                              |
| ---------------- | ----------------------------------------------------------- |
| `MatchComponent` | Listens to hover/click, checks range, triggers combat state |

### Example Flow

```
User hovers over enemy
  → HoverComponent emits 'start' event
  → MatchComponent listens, calls UnitsComponent.isPlayerWithinRange()
  → If in range: VFXSystem.applyEmissive() shows combat glow
  → If out of range: VFXSystem.applyOutOfRange() shows different effect
```

### Why This Pattern?

1. **Testability**: Capability components are pure, easy to unit test
2. **Reusability**: HoverComponent works for any hover need
3. **Flexibility**: Change combat logic without touching hover detection
4. **Debugging**: Clear event trail to follow

---

## Trait System

Components declare interfaces for type-safe lookup:

```typescript
// In component
this.registerTrait(TRAIT.MATERIAL_PROVIDER);

// Lookup from another component
const material = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
```

### Available Traits

| Trait               | Interface            | Purpose                          |
| ------------------- | -------------------- | -------------------------------- |
| `MATERIAL_PROVIDER` | `I_MaterialProvider` | Components that expose materials |
| `MESH_PROVIDER`     | `I_MeshProvider`     | Components that expose meshes    |
| `PHYSICS_BODY`      | `I_PhysicsBody`      | Components with physics bodies   |

Use `requireByTrait()` when the trait MUST exist (throws if missing).
Use `getByTrait()` when the trait is optional (returns undefined).

---

## SceneState Machine

Managed by `SceneState` service.

### States

| State           | Description                                  |
| --------------- | -------------------------------------------- |
| `OVERWORLD`     | Normal exploration, all interactions enabled |
| `MATCH_REQUEST` | Hovering combat target, showing UI prompt    |
| `MATCH`         | In combat, movement restricted               |

### Transitions

```
OVERWORLD → MATCH_REQUEST (hover enemy in range)
MATCH_REQUEST → OVERWORLD (hover away or cancel)
MATCH_REQUEST → MATCH (confirm combat)
MATCH → OVERWORLD (combat ends)
```

### Usage

```typescript
const state = context.getService("state");

state.transition("MATCH_REQUEST");
state.onEnter("MATCH", () => {
	/* setup combat UI */
});
state.onExit("MATCH", () => {
	/* cleanup */
});
```

---

## Memory Management

### CleanupRegistry

Every scene has a CleanupRegistry. Use it for EVERYTHING.

```typescript
// Three.js objects (auto-disposes geometry, material, textures)
context.cleanupRegistry.registerObject(mesh);

// Disposable resources
context.cleanupRegistry.registerDisposable(geometry);
context.cleanupRegistry.registerDisposable(material);

// Vue watchers
const stop = watch(someRef, callback);
context.cleanupRegistry.registerWatcher(stop);

// Event listeners
context.cleanupRegistry.registerListener(element, "click", handler);
```

### Common Leaks to Avoid

1. **Unregistered meshes**: Always `registerObject()`
2. **Orphaned geometries**: Created but not attached to mesh
3. **Event listeners**: Use `registerListener()` not raw `addEventListener()`
4. **Vue watchers**: Use `registerWatcher()` for manual watchers

---

## ModuleRegistry

Type-safe module management within scenes.

```typescript
// Register
this.addModule('lighting', new LightingModule());

// Retrieve (type-safe)
const lighting = this.getModule('lighting') as LightingModule;

// Check existence
if (this.hasModule('physics')) { ... }
```

Modules are initialized in registration order, so register dependencies first.
