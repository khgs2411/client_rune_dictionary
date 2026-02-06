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

| Layer     | Technology                        | Notes                                  |
| --------- | --------------------------------- | -------------------------------------- |
| Framework | Vue 3.5 + TypeScript 5.9 + Vite 7 | Composition API, `<script setup>` only |
| 3D Engine | Three.js 0.180.0                  | Imperative only (NOT TresJS)           |
| Physics   | Rapier3D 0.19 (WASM)              | Always use `PhysicsSystem` facade      |
| State     | Pinia 3 + persistedstate          | Stores in `src/stores/`                |
| UI        | Reka UI 2.6 + Tailwind CSS 4.1    | Components in `src/components/ui/`     |
| Utilities | VueUse 14.1, topsyde-utils        | Prefer VueUse over custom solutions    |
| Runtime   | Bun                               | Never use npm/node                     |

---

## Architecture Decision Tree

**"Should I create a SceneModule or GameObject?"**

```
Is it...
├── Singular infrastructure for the scene (lighting, camera, match setup)?
│   └── SceneModule
├── Multiple instances of something (enemies, trees, rocks)?
│   └── GameObject with components
├── Global system (physics, VFX, interactions)?
│   └── System in src/game/systems/
└── Reusable behavior (hovering, clicking, rotating)?
    └── GameComponent
```

| Pattern         | Cardinality             | Examples                                 | Location               |
| --------------- | ----------------------- | ---------------------------------------- | ---------------------- |
| `SceneModule`   | One per scene           | LightingModule, MatchModule, DebugModule | `src/game/modules/`    |
| `GameObject`    | Many instances          | TrainingDummy, Rock, LocalPlayer         | `src/game/prefabs/`    |
| `GameComponent` | Attached to GameObjects | HoverComponent, MeshComponent            | `src/game/components/` |
| System          | Singleton services      | PhysicsSystem, VFXSystem                 | `src/game/systems/`    |

---

## Directory Structure

```
src/
├── game/                    # Three.js game engine (NO Vue here)
│   ├── Engine.ts            # WebGL Renderer, Clock, LoadingManager
│   ├── GameScene.ts         # Abstract scene base (template method)
│   ├── GameObject.ts        # Entity container (composition pattern)
│   ├── GameComponent.ts     # Behavior base class (trait system)
│   ├── CleanupRegistry.ts   # Memory management (CRITICAL)
│   ├── components/          # Reusable components by category
│   │   ├── rendering/       # Geometry, Material, Mesh, Sprite, Billboard
│   │   ├── interactions/    # Hover, Click, Drag, Hotkey
│   │   ├── physics/         # Collision, Kinematic movement
│   │   ├── entities/        # Transform, Spawn, Trajectory
│   │   └── match/           # MatchComponent (combat trigger)
│   ├── prefabs/             # GameObject implementations
│   │   ├── character/       # LocalPlayer, RemotePlayer
│   │   ├── environment/     # Rock, House, Path, Ground
│   │   └── npc/             # TrainingDummy
│   ├── modules/             # SceneModule implementations
│   │   ├── scene/           # Lighting, Match, Debug
│   │   └── networking/      # MultiplayerModule
│   ├── systems/             # Singleton services per scene
│   │   ├── PhysicsSystem.ts # Rapier3D facade (60Hz fixed timestep)
│   │   ├── VFXSystem.ts     # Emissive, particles, camera shake
│   │   ├── InteractionSystem.ts # Raycasting, input events
│   │   ├── SceneState.ts    # State machine (OVERWORLD/MATCH_REQUEST/PVE_MATCH)
│   │   ├── Spawner.ts       # Object pooling + factory pattern
│   │   └── GameObjectsManager.ts
│   └── utils/               # CollisionShapeFactory, Mouse, ObjectPool, Raycast
├── scenes/                  # Scene implementations (PlaygroundScene)
├── composables/             # Vue composables (Entity vs Controller pattern)
│   ├── camera/              # useCameraController (pure logic, no Three.js)
│   ├── character/           # useCharacterController (pure logic)
│   ├── useCamera.ts         # Camera entity (owns Three.js PerspectiveCamera)
│   ├── useCharacter.ts      # Character entity (wraps controller)
│   ├── useMatchState.ts     # Match state management
│   └── useATBPrediction.ts  # Client-side ATB prediction
├── stores/                  # Pinia stores (see table below)
├── components/              # Vue UI components
│   ├── ui/                  # Reka UI primitives
│   ├── match/               # Combat UI (ActionBar, StatusPanel, ATB)
│   └── grimoire/            # Inventory/ability UI
├── common/                  # Shared types and mirrored server enums
├── views/                   # Route views (Game, Login, Scene)
├── api/                     # HTTP API clients
└── lib/                     # Generic utilities

src_deprecated/              # Old PrimeVue app - NEVER MODIFY
```

---

## Key Concepts

### Component Priority Order
Components initialize in priority order - lower first:
```
DEFAULT=1 → RENDERING=100 → PHYSICS=200 → INTERACTION=300
```
Physics depends on mesh existing. Interaction depends on physics collider.

### Trait System (Interface-Based Discovery)
Components register traits via Symbols for decoupled lookup:
```typescript
// Provider registers:   this.registerTrait(TRAIT.MESH_PROVIDER)
// Consumer finds:       this.requireByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER)
```

### Entity vs Controller Composables
- **Entity** composables (`useCamera`, `useCharacter`) own Three.js objects
- **Controller** composables (`useCameraController`, `useCharacterController`) are pure reactive state
- Why: Testability without Three.js, reusability, SSR safety

### Scene Context (`I_SceneContext`)
Passed to all modules/components. Provides: `engine`, `scene`, `cleanupRegistry`, `getService<K>()`, `clientData`, `camera?`, `character?`

---

## Creating Things

### GameObject (Prefab)

```typescript
// src/game/prefabs/MyObject.ts
export class MyObject extends GameObject {
	constructor(config: { id: string; position?: [number, number, number] }) {
		super({ id: config.id });
		this.addComponent(new TransformComponent({ position: config.position || [0, 0, 0] }))
			.addComponent(new GeometryComponent({ type: "box", params: [1, 1, 1] }))
			.addComponent(new MaterialComponent({ color: 0xff1493 }))
			.addComponent(new MeshComponent())
			.addComponent(new HoverComponent());
	}
}

// Usage in scene:
const obj = new MyObject({ id: "my-object-1", position: [5, 0, 3] });
context.gameObjectsManager.register(obj);
await obj.init(context);
```

### SceneModule

```typescript
// src/game/modules/scene/MyModule.ts
export class MyModule extends SceneModule {
	private mesh?: Mesh;

	async init(context: I_ModuleContext): Promise<void> {
		await super.init(context); // REQUIRED first!
		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshStandardMaterial({ color: 0x00ff00 });
		this.mesh = new Mesh(geometry, material);
		context.scene.add(this.mesh);

		// CRITICAL: Register for cleanup
		context.cleanupRegistry.registerObject(this.mesh);
		context.cleanupRegistry.registerDisposable(geometry);
		context.cleanupRegistry.registerDisposable(material);
	}

	update(delta: number): void {
		if (this.mesh) this.mesh.rotation.y += delta;
	}
}
```

### GameComponent

```typescript
export class RotateComponent extends GameComponent {
	public readonly priority = ComponentPriority.DEFAULT;
	private speed: number;

	constructor(config: { speed?: number } = {}) {
		super();
		this.speed = config.speed ?? 1;
	}

	update(delta: number): void {
		const mesh = this.getComponent(MeshComponent);
		if (mesh?.mesh) mesh.mesh.rotation.y += delta * this.speed;
	}
}
```

### Using Systems

```typescript
// Physics
const physics = context.getService("physics");
physics.registerStaticFromMesh(this.gameObject.id, mesh, { showDebug: true });

// VFX
const vfx = context.getService("vfx");
vfx.applyEmissive(mesh, 0xff0000, 0.5);

// Spawner (object pooling)
const spawner = context.getService("spawner");
spawner.registerFactory('fireball', factory, { poolSize: 10, maxActivePerOwner: 5 });
```

---

## Memory Management (CRITICAL)

Three.js objects MUST be registered for cleanup to prevent memory leaks:

```typescript
context.cleanupRegistry.registerObject(mesh);           // Mesh, Light, Group
context.cleanupRegistry.registerDisposable(geometry);    // Geometry, Material, Texture
context.cleanupRegistry.registerWatcher(stopHandle);     // Vue watchers
context.cleanupRegistry.registerDisposable({ dispose: unsubscribe }); // Subscriptions
```

**Common Leak Sources:** Unregistered meshes, undisposed geometries/materials, dangling event listeners, unsubscribed watchers.

---

## Pinia Stores

| Store                | Purpose                      | Persisted |
| -------------------- | ---------------------------- | --------- |
| `auth.store.ts`      | User authentication          | Yes       |
| `websocket.store.ts` | WebSocket connection state   | No        |
| `settings.store.ts`  | User preferences             | Yes       |
| `config.store.ts`    | Debug flags, feature toggles | No        |
| `scene.store.ts`     | Current scene state          | No        |
| `match.store.ts`     | Active match data            | No        |

---

## WebSocket & Match Events

```typescript
// Connection: sec-websocket-protocol header = "clientId-username"
const ws = new WebSocket("wss://server:443", "123-PlayerName");

// Listening to match events:
websocketStore.on(E_MatchEventType.DAMAGE, (data) => {
	matchStore.applyDamage(data);
});
```

**Flow:** `Server broadcasts → websocket.store → match.store → Vue/Three.js reacts`

Client enums in `src/common/match.enums.ts` mirror server enum string values.

---

## Anti-Patterns

| Don't                           | Do Instead                         |
| ------------------------------- | ---------------------------------- |
| Use raw Rapier API              | Use `PhysicsSystem` facade         |
| Create custom utilities         | Check VueUse first                 |
| Forget cleanup registration     | Always register Three.js objects   |
| Modify `src_deprecated/`        | It's reference only                |
| Mix Vue reactivity in game code | Keep game logic in `game/` directory |
| Create new geometry per frame   | Pool or reuse geometries           |

---

## Debugging

- **Three.js Inspector**: Enable in `config.store.ts` or use browser extension
- **Physics wireframes**: `physics.registerStaticFromMesh(id, mesh, { showDebug: true })`
- **Memory leaks**: Chrome DevTools → Memory → heap snapshot before/after scene change

---

## Environment Variables

```bash
VITE_API_KEY        # Auth API key
VITE_WS_HOST        # WebSocket host (wss://...)
VITE_HOST           # REST API base URL
```

---

## Additional Documentation

| Doc                    | When to Read                                  |
| ---------------------- | --------------------------------------------- |
| `docs/architecture.md` | Component priorities, Pattern B, trait system |
| `docs/composables.md`  | Entity vs Controller composables              |
| `docs/systems.md`      | Deep-dive on Physics, VFX, Interaction        |
| `docs/sprites.md`      | Sprite sheets and animation                   |
