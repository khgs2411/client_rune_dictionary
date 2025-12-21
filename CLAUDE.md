# RUNE Client

Vue 3 + Three.js 3D game client. Rebuilt from a 2D PrimeVue app (old code in `src_deprecated/` for reference only).

**Goal**: Mobile-first, clean component architecture, no memory leaks.

---

## Commands

```bash
bun run dev          # Vite dev server (port 8080)
bun run build        # Production build
bun run format       # Prettier formatting
bun run deploy       # Deploy via compose/deploy.sh
```

---

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript** + **Vite 7**
- **Three.js 0.180.0** - Imperative 3D (NOT TresJS)
- **Rapier3D** - WASM physics (use PhysicsSystem facade, never raw API)
- **Pinia** + persistedstate for state
- **Reka UI** + **Tailwind CSS 4.1** for UI
- **VueUse 13.9.0** - Always prefer over custom implementations
- **topsyde-utils** - WebSocket, RxJS helpers
- **Bun** - Runtime and package manager (never npm/node)

---

## Directory Structure

```
src/
├── game/
│   ├── Engine.ts, GameScene.ts, SceneModule.ts
│   ├── GameObject.ts, GameComponent.ts
│   ├── CleanupRegistry.ts, ModuleRegistry.ts
│   ├── modules/scene/       # LightingModule, CharacterModule
│   ├── components/          # Transform, Mesh, Hover, Match, etc.
│   ├── prefabs/             # LocalPlayer, TrainingDummy, Rock
│   └── systems/             # Physics, Interaction, VFX, SceneState
├── scenes/                  # PlaygroundScene
├── composables/             # useCamera, useCharacter, useTheme
├── stores/                  # auth, websocket, settings, gameConfig
├── components/ui/           # Reka UI components
└── views/                   # Game.vue, Login.vue

src_deprecated/              # Old PrimeVue app - NEVER MODIFY
```

---

## Architecture (Quick Reference)

### Dual Pattern System

| Pattern | Use When | Examples |
|---------|----------|----------|
| **SceneModule** | Singular infrastructure | LightingModule, CharacterModule |
| **GameObject** | Multiple instances | TrainingDummy, Rock, Trees |

### Core Classes

| Class | Purpose |
|-------|---------|
| `Engine` | Three.js Scene, Renderer, Clock |
| `GameScene` | Abstract base with lifecycle |
| `SceneModule` | Scene infrastructure base |
| `GameObject` | Entity with fluent component API |
| `GameComponent` | Composable entity features |
| `CleanupRegistry` | Memory leak prevention |

### Systems (via `context.getService()`)

| System | Purpose |
|--------|---------|
| `InteractionSystem` | Raycasting, hover/click |
| `PhysicsSystem` | Rapier3D facade |
| `VFXSystem` | Emissive, particles, shake |
| `SceneState` | State machine |
| `GameObjectsManager` | GameObject lifecycle |

See `docs/architecture.md` for Pattern B (layered components) and component priority details.

---

## Quick Reference: Creating Things

### GameObject (Prefab)

```typescript
export class MyObject extends GameObject {
  constructor(config: { id: string; position?: [number, number, number] }) {
    super({ id: config.id });
    this.addComponent(new TransformComponent({ position: config.position || [0, 0, 0] }))
      .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
      .addComponent(new MaterialComponent({ color: 0xff1493 }))
      .addComponent(new MeshComponent())
      .addComponent(new HoverComponent());
  }
}
```

### SceneModule

```typescript
export class MyModule extends SceneModule {
  async init(context: I_ModuleContext): Promise<void> {
    await super.init(context);  // REQUIRED first!
    
    const mesh = new Mesh(geometry, material);
    context.scene.add(mesh);
    context.cleanupRegistry.registerObject(mesh);
  }
  
  update(delta: number): void { /* per-frame */ }
}
```

### GameComponent

```typescript
export class RotateComponent extends GameComponent {
  public readonly priority = ComponentPriority.DEFAULT;
  
  update(delta: number): void {
    const mesh = this.getComponent(MeshComponent);
    if (mesh) mesh.mesh.rotation.y += delta;
  }
}
```

### Using Services

```typescript
const physics = context.getService('physics');
const vfx = context.getService('vfx');

physics.registerStaticFromMesh(this.gameObject.id, mesh, { showDebug: true });
vfx.applyEmissive(mesh, 0xff0000, 0.5);
```

---

## Critical Rules

### MUST Do

- Always use `bun` (never npm/node)
- Register Three.js objects: `cleanupRegistry.registerObject(mesh)`
- Register disposables: `cleanupRegistry.registerDisposable(geometry)`
- Call `super.init(context)` first in SceneModule
- Use VueUse for common tasks
- Mobile-first development

### NEVER Do

- Modify `src_deprecated/`
- Use raw Rapier API (use PhysicsSystem facade)
- Run build/deploy commands without user permission

---

## Pinia Stores

| Store | Purpose |
|-------|---------|
| `auth.store.ts` | Authentication |
| `websocket.store.ts` | WebSocket connection |
| `settings.store.ts` | User preferences (persisted) |
| `gameConfig.store.ts` | Debug flags |
| `scene.store.ts` | Scene state/switching |

---

## Environment

```bash
VITE_API_KEY        # Auth API key
VITE_WS_HOST        # WebSocket host (wss://...)
VITE_HOST           # REST API base URL
```

Build config: base path `/client_rune_dictionary/`, alias `@` → `./src`

---

## Additional Docs

| Doc | When to read |
|-----|--------------|
| `docs/architecture.md` | Pattern B, component priorities, trait system |
| `docs/composables.md` | Entity vs Controller composables, testing |
| `docs/systems.md` | Deep-dive on Physics, VFX, Interaction systems |