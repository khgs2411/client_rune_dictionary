# GEMINI.md

## Development Commands

```bash
bun run dev          # Start Vite dev server (port 8080)
bun run build        # TypeScript + Vite production build
bun run format       # Prettier formatting
bun run deploy       # Deploy via compose/deploy.sh
```

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript** + **Vite 7**
- **Three.js 0.180.0** - Imperative 3D (NOT TresJS)
- **Rapier3D** - WASM physics engine
- **Pinia** + persistedstate for state management
- **Reka UI** + **Tailwind CSS 4.1** for UI
- **VueUse 13.9.0** - Always prefer over custom implementations
- **topsyde-utils** - WebSocket, RxJS helpers, game logic
- **Bun.JS** - Runtime and package manager (never npm/node)

## Architecture Overview

This is a **3D Three.js game** rebuilt from a 2D PrimeVue app. Old code in `src_deprecated/` is reference only.

### Dual Architecture System

**1. SceneModule Pattern** - Scene infrastructure (singular per scene)

- Examples: LightingModule, CharacterModule
- Lifecycle: `init(context)` → `update(delta)` → `destroy()`

**2. GameObject/Component Pattern** - Game entities (multiple instances)

- Examples: TrainingDummy, Ground, Trees prefabs
- Managed by GameObjectsManager
- Components initialize by priority order

**Rule**: Multiple instances → GameObject. Singular infrastructure → SceneModule.

### Core Classes

| Class             | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `Engine`          | Three.js Scene, WebGLRenderer, Clock wrapper            |
| `GameScene`       | Abstract base with Template Pattern lifecycle           |
| `SceneModule`     | Base for scene infrastructure modules                   |
| `GameObject`      | Entity container with fluent component API              |
| `GameComponent`   | Base for composable entity features                     |
| `CleanupRegistry` | Memory leak prevention (objects, disposables, watchers) |
| `ModuleRegistry`  | Type-safe module management                             |

### Component Priority Order

```
1. DEFAULT (1)       - Transform, Geometry, Material
2. RENDERING (100)   - MeshComponent
3. PHYSICS (200)     - PhysicsComponent
4. INTERACTION (300) - Hover, Click, Drag components
```

### Pattern B: Layered Components

**Capability Layer** (emit events, pure data):

- `InteractionComponent` - click/doubleclick events
- `HoverComponent` - start/end events (no visuals!)
- `UnitsComponent` - distance measurements

**Orchestrator Layer** (listen, decide, coordinate):

- `MatchComponent` - listens to events, checks range, triggers state

**Example flow**:

```
HoverComponent emits 'start'
  → MatchComponent checks UnitsComponent.isPlayerWithinRange()
  → VFXSystem.applyEmissive() shows combat glow
```

### Systems (via `context.getService()`)

| System               | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `InteractionSystem`  | Raycasting, hover/click handlers                 |
| `PhysicsSystem`      | Rapier3D facade (static/kinematic bodies)        |
| `VFXSystem`          | Emissive glow, particles, tooltips, camera shake |
| `SceneState`         | State machine (OVERWORLD, MATCH_REQUEST, MATCH)  |
| `GameObjectsManager` | GameObject lifecycle coordination                |

### Trait System

Components declare interfaces for lookup:

```typescript
this.registerTrait(TRAIT.MATERIAL_PROVIDER);
const material = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
```

## Directory Structure

```
src/
├── game/
│   ├── Engine.ts, GameScene.ts, SceneModule.ts
│   ├── GameObject.ts, GameComponent.ts
│   ├── CleanupRegistry.ts, ModuleRegistry.ts
│   ├── modules/scene/     # LightingModule, CharacterModule, etc.
│   ├── components/
│   │   ├── rendering/     # Transform, Geometry, Material, Mesh
│   │   ├── entities/      # Units, Spawn, Trajectory, Kinematic
│   │   ├── interactions/  # Hover, Click, Drag, Collision
│   │   ├── match/         # MatchComponent (orchestrator)
│   │   └── multiplayer/   # RemotePlayer, SyncMovement
│   ├── prefabs/           # Pre-configured GameObjects
│   │   ├── character/     # LocalPlayer, RemotePlayer
│   │   ├── environment/   # Rock, House, Hill
│   │   └── npc/           # TrainingDummy
│   └── systems/           # Physics, Interaction, VFX, SceneState
├── scenes/                # PlaygroundScene
├── composables/           # useCamera, useCharacter, useTheme
├── stores/                # auth, websocket, settings, gameConfig
├── components/ui/         # Reka UI components
└── views/                 # Game.vue, Login.vue

src_deprecated/            # Old PrimeVue app (reference only, never modify)
```

## Quick Reference: Creating Things

### New GameObject (Prefab)

```typescript
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

// Usage
const gameObjects = this.getModule("gameObjects") as GameObjectManager;
gameObjects.add(new MyObject({ id: "test-box", position: [0, 1, 0] }));
```

### New SceneModule

```typescript
export class MyModule extends SceneModule {
	async init(context: I_ModuleContext): Promise<void> {
		await super.init(context); // REQUIRED first!

		const mesh = new Mesh(geometry, material);
		context.scene.add(mesh);
		context.cleanupRegistry.registerObject(mesh);
	}

	update(delta: number): void {
		/* per-frame logic */
	}
}

// Register in scene
this.addModule("myModule", new MyModule());
```

### New GameComponent

```typescript
export class RotateComponent extends GameComponent {
	public readonly priority = ComponentPriority.DEFAULT;

	async init(context: I_SceneContext): Promise<void> {
		const mesh = this.requireComponent(MeshComponent);
	}

	update(delta: number): void {
		const mesh = this.getComponent(MeshComponent);
if (mesh) mesh.mesh.rotation.y += delta;
	}
}
```

### Using Services

```typescript
async init(context: I_SceneContext): Promise<void> {
  const physics = context.getService("physics");
  const vfx = context.getService("vfx");
  const state = context.getService("state");

  physics.registerStaticFromMesh(this.gameObject.id, mesh, { showDebug: true });
  vfx.applyEmissive(mesh, 0xff0000, 0.5);
}
```

## Key Conventions

### Must Do

- Always use `bun` (never npm/node)
- Register Three.js objects: `cleanupRegistry.registerObject(mesh)`
- Register disposables: `cleanupRegistry.registerDisposable(geometry)`
- Call `super.init(context)` first in SceneModule
- Follow Pattern B: event emitters pure, orchestrators decide
- Use VueUse for common tasks
- Mobile-first development

### Never Do

- Modify `src_deprecated/`
- Use raw Rapier API (use PhysicsSystem facade)
- Run build commands without user permission
- Add complex interfaces (use `context.getService()` instead)

## Environment

```bash
VITE_API_KEY        # Auth API key
VITE_WS_HOST        # WebSocket host (wss://...)
VITE_HOST           # REST API base URL
```

Build: base path `/client_rune_dictionary/`, path alias `@` → `./src`

## UI & Theming

- **Tailwind v4** utility classes (no SCSS)
- **Reka UI** for accessible primitives
- Light/dark via VueUse `useColorMode()`
- CSS variables in `src/style.css`

## Pinia Stores

| Store                 | Purpose                           |
| --------------------- | --------------------------------- |
| `auth.store.ts`       | Authentication state              |
| `websocket.store.ts`  | WebSocket connection              |
| `settings.store.ts`   | User preferences (persisted)      |
| `gameConfig.store.ts` | Debug flags, physics debug toggle |
| `scene.store.ts`      | Scene state and switching         |

## Composables Architecture

**Entity Composables** (own Three.js instances): `useCamera`, `useCharacter`
**Controller Composables** (pure state logic): `useCameraController`, `useCharacterController`

This separation enables testable logic without Three.js dependencies.

## Loading System

Uses RxJS from topsyde-utils:

- Scene emits `start` (totalAssets), `loaded` (count), `fail`
- Modules call `this.initialized(sceneName)` when ready
- LoadingScreen.vue subscribes and shows progress
