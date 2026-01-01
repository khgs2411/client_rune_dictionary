# RUNE Client

Vue 3 + Three.js 3D game client with component-based architecture.

**Design Goals:** Mobile-first, no memory leaks, clean separation between Vue UI and Three.js game layer.

---

## Quick Reference

```bash
bun run dev      # Dev server (port 8080)
bun run format   # Prettier (run before commits)
```

**Never run `bun run build` or `bun run deploy` without explicit user permission.**

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Vue 3 + TypeScript + Vite 7 | Composition API, `<script setup>` only |
| 3D Engine | Three.js 0.180.0 | Imperative only (NOT TresJS) |
| Physics | Rapier3D (WASM) | Always use `PhysicsSystem` facade |
| State | Pinia + persistedstate | Stores in `src/stores/` |
| UI | Reka UI + Tailwind CSS 4.1 | Components in `src/components/ui/` |
| Utilities | VueUse 13.9.0, topsyde-utils | Prefer VueUse over custom solutions |
| Runtime | Bun | Never use npm/node |

---

## Architecture Decision Tree

**"Should I create a SceneModule or GameObject?"**

```
Is it...
├── Singular infrastructure for the scene (lighting, camera, ground)?
│   └── SceneModule
├── Multiple instances of something (enemies, trees, rocks)?
│   └── GameObject with components
├── Global system (physics, VFX, interactions)?
│   └── System in src/game/systems/
└── Reusable behavior (hovering, clicking, rotating)?
    └── GameComponent
```

### Pattern Summary

| Pattern | Cardinality | Examples | Location |
|---------|-------------|----------|----------|
| `SceneModule` | One per scene | LightingModule, GroundModule, MatchModule | `src/game/modules/` |
| `GameObject` | Many instances | TrainingDummy, Rock, LocalPlayer | `src/game/prefabs/` |
| `GameComponent` | Attached to GameObjects | HoverComponent, MeshComponent | `src/game/components/` |
| System | Singleton services | PhysicsSystem, VFXSystem | `src/game/systems/` |

---

## Directory Structure

```
src/
├── game/                    # Three.js game engine
│   ├── Engine.ts            # Scene, Renderer, Clock
│   ├── GameScene.ts         # Abstract scene base
│   ├── GameObject.ts        # Entity base class
│   ├── GameComponent.ts     # Component base class
│   ├── CleanupRegistry.ts   # Memory management (CRITICAL)
│   ├── components/          # Reusable components
│   │   ├── core/            # EventEmitterComponent
│   │   ├── rendering/       # Mesh, Material, Sprite, Billboard
│   │   ├── interactions/    # Hover, Click, Drag, Hotkey
│   │   ├── physics/         # Collision, Kinematic movement
│   │   └── entities/        # Transform, Spawn, Trajectory
│   ├── prefabs/             # GameObject implementations
│   │   ├── character/       # LocalPlayer, RemotePlayer
│   │   ├── environment/     # Rock, House, TileChunk
│   │   └── npc/             # TrainingDummy
│   ├── modules/             # SceneModule implementations
│   │   └── scene/           # Lighting, Ground, Match, TileMap
│   └── systems/             # Global systems
│       ├── PhysicsSystem.ts # Rapier3D facade
│       ├── VFXSystem.ts     # Emissive, particles
│       └── InteractionSystem.ts # Raycasting
├── scenes/                  # Scene implementations
├── composables/             # Vue composables
├── stores/                  # Pinia stores
├── components/              # Vue UI components
│   ├── ui/                  # Reka UI primitives
│   ├── match/               # Combat UI (ActionBar, StatusPanel)
│   └── grimoire/            # Inventory/ability UI
├── views/                   # Route views
├── common/                  # Shared types and enums
└── api/                     # HTTP API clients

src_deprecated/              # Old PrimeVue app - NEVER MODIFY
```

---

## Creating Things

### GameObject (Prefab)

```typescript
// src/game/prefabs/MyObject.ts
export class MyObject extends GameObject {
    constructor(config: { id: string; position?: [number, number, number] }) {
        super({ id: config.id });
        
        this.addComponent(new TransformComponent({ 
            position: config.position || [0, 0, 0] 
        }))
        .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
        .addComponent(new MaterialComponent({ color: 0xff1493 }))
        .addComponent(new MeshComponent())
        .addComponent(new HoverComponent()); // Optional interactivity
    }
}

// Usage in scene:
const obj = new MyObject({ id: 'my-object-1', position: [5, 0, 3] });
context.gameObjectsManager.register(obj);
await obj.init(context);
```

### SceneModule

```typescript
// src/game/modules/scene/MyModule.ts
export class MyModule extends SceneModule {
    private mesh?: Mesh;

    async init(context: I_ModuleContext): Promise<void> {
        await super.init(context); // ⚠️ REQUIRED first!

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new Mesh(geometry, material);
        
        context.scene.add(this.mesh);
        
        // ⚠️ CRITICAL: Register for cleanup
        context.cleanupRegistry.registerObject(this.mesh);
        context.cleanupRegistry.registerDisposable(geometry);
        context.cleanupRegistry.registerDisposable(material);
    }

    update(delta: number): void {
        if (this.mesh) {
            this.mesh.rotation.y += delta;
        }
    }
}
```

### GameComponent

```typescript
// src/game/components/MyComponent.ts
export class RotateComponent extends GameComponent {
    public readonly priority = ComponentPriority.DEFAULT;
    
    private speed: number;
    
    constructor(config: { speed?: number } = {}) {
        super();
        this.speed = config.speed ?? 1;
    }

    update(delta: number): void {
        const mesh = this.getComponent(MeshComponent);
        if (mesh?.mesh) {
            mesh.mesh.rotation.y += delta * this.speed;
        }
    }
}
```

### Using Systems

```typescript
// In any module or component with access to context:

// Physics
const physics = context.getService('physics');
physics.registerStaticFromMesh(this.gameObject.id, mesh, { showDebug: true });

// VFX
const vfx = context.getService('vfx');
vfx.applyEmissive(mesh, 0xff0000, 0.5);

// Interaction (handled automatically if using InteractionComponent/HoverComponent)
const interaction = context.getService('interaction');
```

---

## Memory Management (CRITICAL)

Three.js objects MUST be registered for cleanup to prevent memory leaks:

```typescript
// For Three.js objects (Mesh, Light, Group, etc.)
context.cleanupRegistry.registerObject(mesh);

// For disposable resources (Geometry, Material, Texture)
context.cleanupRegistry.registerDisposable(geometry);
context.cleanupRegistry.registerDisposable(material);

// For subscriptions and callbacks
const unsubscribe = someObservable.subscribe(() => {});
context.cleanupRegistry.registerDisposable({ dispose: unsubscribe });
```

**Common Memory Leak Sources:**
- Unregistered meshes
- Geometries/materials not disposed
- Event listeners not removed
- RxJS subscriptions not unsubscribed

---

## Pinia Stores

| Store | Purpose | Persisted |
|-------|---------|-----------|
| `auth.store.ts` | User authentication | Yes |
| `websocket.store.ts` | WebSocket connection state | No |
| `settings.store.ts` | User preferences | Yes |
| `config.store.ts` | Debug flags, feature toggles | No |
| `scene.store.ts` | Current scene state | No |
| `match.store.ts` | Active match data | No |

---

## WebSocket Communication

Client connects to server using topsyde-utils WebSocket:

```typescript
// Connection format (in sec-websocket-protocol header):
// "clientId-username"
const ws = new WebSocket('wss://server:443', '123-PlayerName');
```

**Match Events Flow:**
```
Server broadcasts → websocket.store receives → match.store updates → Vue/Three.js reacts
```

---

## Common Patterns

### Accessing Three.js from Vue

```typescript
// In Vue component - use composables
const { camera, controls } = useCamera();

// For game logic - use the game context, not Vue
// Game systems should be independent of Vue reactivity
```

### Adding Interactivity to a GameObject

```typescript
// Method 1: HoverComponent (simple hover effect)
this.addComponent(new HoverComponent());

// Method 2: InteractionComponent (full click handling)
this.addComponent(new InteractionComponent({
    onClick: () => console.log('Clicked!'),
    onHover: () => console.log('Hovered!'),
}));

// Method 3: MouseClickComponent + custom handling
this.addComponent(new MouseClickComponent({
    onClick: (event) => this.handleClick(event),
}));
```

### Responding to Match Events

```typescript
// In a Vue composable or store:
websocketStore.on(E_MatchEventType.DAMAGE, (data) => {
    // Update UI
    matchStore.applyDamage(data);
});

// In a Three.js component (if needed):
// Subscribe in init(), unsubscribe in cleanup
```

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Use raw Rapier API | Use `PhysicsSystem` facade |
| Create custom utilities | Check VueUse first |
| Forget cleanup registration | Always register Three.js objects |
| Modify `src_deprecated/` | It's reference only |
| Mix Vue reactivity in game code | Keep game logic in game/ directory |
| Create new geometry per frame | Pool or reuse geometries |

---

## Debugging

### Three.js Inspector
Enable in `config.store.ts` or use browser extension.

### Physics Debug Wireframes
```typescript
physics.registerStaticFromMesh(id, mesh, { showDebug: true });
```

### Check Memory Leaks
1. Open Chrome DevTools → Memory
2. Take heap snapshot before/after scene change
3. Compare for retained Three.js objects

---

## Environment Variables

```bash
VITE_API_KEY        # Auth API key
VITE_WS_HOST        # WebSocket host (wss://...)
VITE_HOST           # REST API base URL
```

---

## Additional Documentation

| Doc | When to Read |
|-----|--------------|
| `docs/architecture.md` | Component priorities, Pattern B, trait system |
| `docs/composables.md` | Entity vs Controller composables |
| `docs/systems.md` | Deep-dive on Physics, VFX, Interaction |
