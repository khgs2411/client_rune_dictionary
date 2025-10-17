# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
bun run dev          # Start Vite development server on port 8080
bun run serve        # Alias for dev command

# Building
bun run build        # TypeScript compile + Vite production build
bun run preview      # Preview production build locally

# Deployment
bun run build:test      # Test build using compose/test-build.sh
bun run build:cleanup   # Cleanup builds using compose/cleanup-builds.sh
bun run deploy          # Deploy using compose/deploy.sh

# Code Formatting
bun run format       # Format with Prettier (recommended)
bun run prettier     # Alias for format
bun run format:check # Check formatting without fixing
```

## Architecture Overview

### Complete Rebuild (v0.5.0+)

This application underwent a complete architectural rebuild from a 2D PrimeVue app to a **3D Three.js-based game**. The old codebase is preserved in `src_deprecated/` for reference but should not be used for new development.

### Frontend Stack

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety (single consolidated `tsconfig.json`)
- **Vite 7** as build tool and dev server
- **Pinia** for state management with `pinia-plugin-persistedstate`
- **Vue Router** for navigation
- **Three.js 0.180.0** - Direct imperative Three.js (no TresJS)
- **VueUse 13.9.0** - Battle-tested composition utilities (always prefer VueUse over custom implementations)

### 3D Game Engine Architecture

The game uses a **custom imperative architecture** with Three.js, not declarative TresJS. There are two complementary systems for building game objects:

#### System 1: Module-Based Architecture (Scene Infrastructure)

**Core Classes:**

1. **Engine** (`src/game/Engine.ts`)

   - Encapsulates Three.js `Scene`, `WebGLRenderer`, `Clock`, and `LoadingManager`
   - Does NOT own the camera (each scene creates its own)
   - Provides `render()`, `resize()`, and `cleanup()` methods
   - Initialized once per game session in [Game.vue](src/views/Game.vue)

2. **GameScene** (`src/game/GameScene.ts`)

   - Abstract base class implementing the **Template Pattern**
   - Manages scene lifecycle: `start()` → `update(delta)` → `destroy()`
   - Contains typed module registry (`Partial<TModuleRegistry>`)
   - Handles module loading progress via RxJS observables from `topsyde-utils`
   - Owns high-level entity composables (`camera`, `character`, `settings`)
   - Subclasses only override `registerModules()` and optionally customize lifecycle steps

3. **SceneModule** (`src/game/SceneModule.ts`)

   - Base class for **high-level scene infrastructure** (lighting, ground, objects, etc.)
   - Lifecycle: `start(context)` → `update(delta)` → `destroy()`
   - Emits loading events via RxJS for loading screen coordination
   - Receives `I_ModuleContext` with `engine`, `scene`, `cleanupRegistry`, `settings`, `sceneName`, `services`

4. **ModuleRegistry** (`src/game/ModuleRegistry.ts`)

   - Utility class for type-safe module management
   - Automatically tracks updateable modules for performance
   - Manages initialization state and provides query methods
   - Performance-optimized: no `filter()` calls in update loop

5. **CleanupRegistry** (`src/game/CleanupRegistry.ts`)
   - Manages cleanup of Three.js objects, Vue watchers, and disposable resources
   - Fluent API: `cleanupRegistry.registerObject(mesh).registerWatcher(watcher).registerDisposable(geometry)`
   - Supports Object3D (with recursive traversal), raw disposables, and watchers
   - Automatically disposes geometries/materials and stops watchers on cleanup
   - Prevents memory leaks

#### System 2: GameObject/Component Architecture (Game Entities)

**Entity-Component System** for dynamic, interactive game objects:

**When to use GameObjects vs SceneModules:**
- Use **GameObject/Component** for: Individual game entities, interactive objects, anything that needs composition
- Use **SceneModule** for: Scene-wide infrastructure (lighting, camera, character, global systems)
- **Rule of thumb**: If you're creating multiple instances, use GameObject. If it's singular infrastructure, use SceneModule.

1. **GameObject** (`src/game/GameObject.ts`)

   - Entity container that holds components
   - Provides fluent API for component composition
   - Manages component lifecycle (init, update, destroy)
   - Components are initialized in priority order
   - Automatically coordinates with services (physics, interaction, etc.)
   - Example: `new GameObject({ id: 'box' }).addComponent(new GeometryComponent(...)).addComponent(new MeshComponent())`

2. **GameComponent** (`src/game/GameComponent.ts`)

   - Base class for all game components
   - Priority-based initialization (lower numbers initialize first)
   - Can query sibling components: `this.getComponent()`, `this.requireComponent()`, `this.restrictComponent()`
   - Lifecycle: `init(context)` → `update(delta)` → `destroy()`
   - **Priority levels**: DEFAULT (1), RENDERING (100), PHYSICS (200), INTERACTION (300)

3. **GameObjectManager** (`src/game/services/GameObjectManager.ts`)

   - SceneModule that manages all GameObjects in a scene
   - Handles GameObject lifecycle coordination
   - Provides collection management: `add()`, `remove()`, `get()`, `has()`, `getAll()`
   - Add to scene like any other module: `this.addModule('gameObjects', new GameObjectManager())`

4. **Prefabs** (`src/game/prefabs/`)
   - Pre-configured GameObjects with common component combinations
   - Example: `EditableBox` - draggable, physics-enabled, persistent box
   - Create custom prefabs by extending GameObject and adding components in constructor

**Available Components:**

- **Rendering Components** (Priority: 1)
  - `TransformComponent` - Position, rotation, scale
  - `GeometryComponent` - Box, sphere, capsule, cylinder, cone, plane geometries
  - `MaterialComponent` - Standard material with color, roughness, metalness
  - `MeshComponent` - Combines geometry + material into Three.js Mesh (Priority: 100)
  - `InstancedMeshComponent` - Instanced rendering for many identical objects
  - `GridHelperComponent` - Debug grid visualization

- **Physics Components** (Priority: 200)
  - `PhysicsComponent` - Registers with PhysicsService (static, kinematic, or dynamic bodies)

- **Interaction Components** (Priority: 300)
  - `HoverComponent` - Hover glow effect via InteractionService
  - `ClickComponent` - Click VFX, camera shake, particles via InteractionService
  - `DragComponent` - Drag objects on XZ plane with optional grid snapping (editor mode only)

- **System Components** (Priority: 1)
  - `PersistenceComponent` - Auto-save/load GameObject position to localStorage

#### Example Scene Structure

```typescript
// scenes/PlaygroundScene.ts
interface PlaygroundModuleRegistry {
  lighting: LightingModule;
  ground: GroundModule;
  sceneObjects: SceneObjectsModule;
  characterMesh: CharacterModule;
}

export class PlaygroundScene extends GameScene<PlaygroundModuleRegistry> {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start(); // Template method triggers full initialization
  }

  protected registerModules(): void {
    this.addModule('lighting', new LightingModule());
    this.addModule('ground', new GroundModule(this.settings));
    // ... add more modules
  }
}
```

#### Composables Architecture

The game separates **high-level entities** from **low-level controllers**:

- **Entity Composables** (`useCamera`, `useCharacter`) - Own Three.js instances and coordinate lifecycle
- **Controller Composables** (`useCameraController`, `useCharacterController`) - Pure state/input logic, no Three.js
- **Sub-controllers** (`useCameraRotation`, `useCameraZoom`, `useCharacterMovement`, etc.) - Granular concerns

This separation enables:

- Testable controller logic (no Three.js dependencies)
- Reusable controllers across different rendering contexts
- Clear ownership (entity owns instance, controller owns state)

### UI & Styling

- **Reka UI** - Unstyled, accessible component primitives (Radix Vue fork)
- **Tailwind CSS 4.1** - Utility-first styling (configured via `@tailwindcss/vite` plugin)
- **CSS Variables** - Theming approach using HSL color values
- **lucide-vue-next** - Icon library
- **@texel/color** - Color manipulation utilities

**Theming System:**

- Light/dark mode via VueUse `useColorMode()` composable
- CSS variables defined in `src/style.css` (`:root` for light, `.dark` for dark)
- Tailwind v4 uses `@import "tailwindcss"` syntax (no tailwind.config file)
- Theme colors dynamically pulled from CSS and converted for Three.js materials
- Scenes can watch theme changes and update material colors reactively

### Key Architectural Patterns

#### 1. Template Pattern (GameScene)

`GameScene` provides default lifecycle implementations. Subclasses override specific steps:

```typescript
public start(): void {
  this.initializeComposables();  // Default: camera + character + settings
  this.registerModules();        // REQUIRED: scene-specific modules
  this.startModuleLoading();     // Default: async module initialization
  this.finalizeSetup();          // Override: add watchers, custom setup
}
```

#### 2. Module Pattern (SceneModule vs EntityModule)

**SceneModules** are high-level scene infrastructure:

```typescript
export class LightingModule extends SceneModule implements I_SceneModule {
  async start(context: I_ModuleContext): Promise<void> {
    const light = new DirectionalLight();
    context.scene.add(light);
    context.lifecycle.register(light); // Auto-cleanup
    this.initialized(context.sceneName); // Notify loading complete
  }

  update(delta: number): void {
    /* animate lights */
  }
  async destroy(): Promise<void> {
    /* cleanup */
  }
}
```

**EntityModules** are composable entity features:

```typescript
export class SceneObjectsModule extends SceneModule {
  async start(context: I_ModuleContext): Promise<void> {
    // Create objects
    const box = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    context.scene.add(box);
    context.lifecycle.register(box);

    // Register with interaction service (no boilerplate needed!)
    context.services.interaction.register('box-1', box, {
      hoverable: true,
      clickable: true,
      tooltip: { title: 'Mysterious Box' },
    });

    this.initialized(context.sceneName);
  }
}
```

#### 3. Service Layer Pattern

GameScene provides shared services via the `services` property in `I_ModuleContext`:

```typescript
// GameScene initialization
protected services = {
  interaction: new InteractionService(),
};

// Modules access services via context
async start(context: I_ModuleContext): Promise<void> {
  // Register interactable objects
  context.services.interaction.register('my-object', mesh, config);
}
```

**Current Services:**

- **InteractionService** - Centralized interaction detection and visual feedback
  - Eliminates need for `I_InteractableModule` interface boilerplate
  - Modules simply call `context.services.interaction.register()`
  - Components use builder pattern: `context.services.interaction.register(id, mesh).withHoverGlow().withClickVFX()`
- **PhysicsService** - Rapier-based physics engine wrapper (Rapier3D WASM)
  - Simple facade over Rapier physics (single file, minimal API)
  - Static bodies: `registerStatic()`, `registerStaticFromMesh()`, `registerInstancedStatic()`
  - Kinematic characters: `registerKinematic()`, `registerKinematicFromMesh()`
  - Movement: `moveKinematic()`, `isGrounded()`, `getPosition()`, `setPosition()`
  - Debug wireframes with global toggle via gameConfig store
  - Auto-cleanup via CleanupRegistry

#### 4. Loading System

Uses RxJS observables (`topsyde-utils`) for coordination:

- **Scene-level events**: `scene:loading` channel
  - `start`: Scene initialization begins (emits `totalAssets`)
  - `loaded`: Module initialized (emits `loaded` count)
  - `fail`: Module loading failed
- **Module-level events**: `module:loading` channel
  - `loaded`: Module reports completion via `this.initialized(sceneName)`

The [LoadingScreen.vue](src/components/LoadingScreen.vue) component subscribes to these events and shows progress.

#### 5. Composable Entity Pattern

```typescript
// High-level entity (owns Three.js instance)
export function useCamera(): I_GameCamera {
  const controller = useCameraController(); // Pure state logic
  const instance = new PerspectiveCamera(); // Three.js instance

  function update(targetPosition: Vector3) {
    controller.update(); // Update state
    // Apply state to Three.js instance
    instance.position.copy(controller.position);
  }

  return { controller, instance, update, start, destroy };
}
```

#### State Management (Pinia Stores)

Current stores:

- **auth.store.ts** - Authentication state
- **websocket.store.ts** - WebSocket connection state and client data
- **settings.store.ts** - User settings and theme preferences (persisted)
- **gameConfig.store.ts** - App configuration (debug flags, stats visibility, physics debug, etc.)
- **scene.store.ts** - Current scene state and scene switching logic

Reference `src_deprecated/stores/` for old WebSocket and match state patterns (being modernized).

### Backend Integration

- **axios** for REST API calls ([auth.api.ts](src/api/auth.api.ts))
- **topsyde-utils 1.0.210** - Custom package for WebSocket utilities, RxJS helpers, game logic
- **Custom Vite Plugin** ([plugins/topsyde-utils-vite-plugin.ts](plugins/topsyde-utils-vite-plugin.ts))
  - Provides Node.js module compatibility in browser
  - Mocks `path`, `fs` modules for topsyde-utils
  - Disables sourcemaps for topsyde-utils (prevents dev warnings)
- **WebSocket Integration** - Real-time multiplayer via `websocket.store.ts` and `WebSocketManager.vue`

### Directory Structure

```
src/
├── game/                    # Core game engine
│   ├── Engine.ts           # Three.js engine wrapper
│   ├── GameScene.ts        # Abstract scene base class
│   ├── SceneModule.ts      # High-level scene module base class
│   ├── ModuleRegistry.ts   # Type-safe module management
│   ├── CleanupRegistry.ts  # Cleanup manager (formerly SceneLifecycle)
│   ├── GameObject.ts       # Entity container for components
│   ├── GameComponent.ts    # Base class for all components
│   ├── EntityModule.ts     # (Deprecated - use GameComponent instead)
│   ├── modules/            # Reusable scene modules
│   │   └── scene/          # Scene infrastructure modules
│   │       ├── LightingModule.ts
│   │       ├── GroundModule.ts (DEPRECATED - use prefabs)
│   │       ├── SceneObjectsModule.ts
│   │       ├── SceneInstancedObjectsModule.ts
│   │       ├── CharacterModule.ts
│   │       ├── DebugModule.ts
│   │       └── VFXModule.ts
│   ├── components/         # GameComponents 
│   │   ├── rendering/      # Visual components
│   │   │   ├── GeometryComponent.ts
│   │   │   ├── MaterialComponent.ts
│   │   │   ├── MeshComponent.ts
│   │   │   ├── TransformComponent.ts
│   │   │   ├── InstancedMeshComponent.ts
│   │   │   └── GridHelperComponent.ts
│   │   ├── interactions/   # Interaction components
│   │   │   ├── HoverComponent.ts
│   │   │   ├── ClickComponent.ts
│   │   │   ├── DragComponent.ts
│   │   │   └── PhysicsComponent.ts
│   │   └── systems/        # System components
│   │       └── PersistenceComponent.ts
│   ├── prefabs/            # Pre-configured GameObjects
│   │   ├── EditableBox.ts  # Draggable physics box with persistence
│   │   ├── Ground.ts       # Static ground plane
│   │   └── Trees.ts        # Instanced tree meshes
│   ├── services/           # Scene services
│   │   ├── InteractionService.ts
│   │   ├── PhysicsService.ts
│   │   ├── GameObjectManager.ts
│   │   └── InteractableBuilder.ts
│   ├── common/             # Types and interfaces
│   │   ├── scenes.types.ts
│   │   ├── gameobject.types.ts
│   │   └── interaction.types.ts
│   └── utils/              # Utility classes
│       ├── Mouse.ts
│       └── Raycast.ts
├── scenes/                  # Concrete scene implementations
│   ├── PlaygroundScene.ts  # Main game scene
│   └── scenes.types.ts     # Scene interfaces
├── composables/             # Vue composables
│   ├── useCamera.ts        # High-level camera entity
│   ├── useCameraController.ts
│   ├── useCharacter.ts     # High-level character entity
│   ├── useCharacterController.ts
│   ├── useJoystick.ts      # Mobile virtual joystick
│   └── useTheme.ts         # Theme/color utilities
├── components/              # Vue components
│   ├── ui/                 # Reka UI components (manually added)
│   ├── LoadingScreen.vue   # Loading progress overlay
│   ├── ApplicationSettings.vue
│   ├── GameSettings.vue
│   └── ...
├── layout/                  # Layout components
│   ├── Menu.vue
│   └── VirtualJoystick.vue # Mobile touch controls
├── stores/                  # Pinia state management
│   ├── auth.store.ts
│   ├── websocket.store.ts  # WebSocket connection state
│   ├── settings.store.ts   # User preferences + theme
│   └── gameConfig.store.ts # App config (debug flags, etc.)
├── data/                    # Data transfer objects
│   └── sceneObjectConfig.dto.ts
├── views/                   # Page components
│   ├── Game.vue            # Main game view (canvas + engine)
│   └── Login.vue
├── router/                  # Vue Router
├── api/                     # Backend API clients
├── common/                  # Shared types and utilities
├── lib/                     # Utility functions
├── App.vue                  # Root component
├── main.ts                  # App entry point
├── style.css               # Global styles + Tailwind + CSS variables
└── vite-env.d.ts

src_deprecated/              # Old 2D PrimeVue app (reference only)
plugins/                     # Vite plugins
compose/                     # Deployment scripts
```

### Environment & Configuration

#### Environment Variables

- `VITE_API_KEY`: Authentication API key
- `VITE_WS_HOST`: WebSocket server host (defaults to wss://topsyde-gaming.duckdns.org:443 or wss://game.rcl-team.com:443)
- `VITE_HOST`: REST API base URL
- Development server runs on port 8080

#### Build Configuration

- **Base path**: `/client_rune_dictionary/` for production (GitHub Pages deployment)
- **Assets**: Chunked output with hash-based filenames
- **Source maps**: Disabled in production
- **Path alias**: `@` → `./src`
- **Three.js optimization**: Deduped and excluded from pre-bundling

#### Important Files

- [vite.config.ts](vite.config.ts) - Vite configuration with custom topsyde-utils plugin
- [tsconfig.json](tsconfig.json) - Single consolidated TypeScript config
- [plugins/topsyde-utils-vite-plugin.ts](plugins/topsyde-utils-vite-plugin.ts) - Critical for topsyde-utils browser compatibility

### Development Guidelines

#### Creating New Scenes

1. Define typed module registry interface
2. Extend `GameScene<YourModuleRegistry>`
3. Implement `registerModules()` to compose your scene
4. Optionally override `finalizeSetup()` for custom watchers
5. Scene lifecycle is handled automatically by base class

#### Creating New Modules

**For SceneModules** (high-level infrastructure):

1. Extend `SceneModule` base class
2. Implement lifecycle methods:
   - `async init(context)` - Initialize and add to scene (must call `super.init(context)` first!)
   - `update(delta)` - Update each frame (optional)
   - `async destroy()` - Cleanup (optional if using cleanupRegistry)
3. Register Three.js objects with `context.cleanupRegistry.registerObject(...objects)`
4. Register disposables with `context.cleanupRegistry.registerDisposable(...geometries)`
5. Add to scene via `scene.addModule('myModule', new MyModule())`

**For GameComponents** (composable entity features - PREFERRED):

1. Extend `GameComponent` base class
2. Set priority if needed (default is ComponentPriority.DEFAULT)
3. Implement lifecycle methods:
   - `async init(context)` - Initialize (query sibling components here)
   - `update(delta)` - Update each frame (optional)
   - `destroy()` - Cleanup (optional)
4. Use `this.getComponent()`, `this.requireComponent()`, `this.restrictComponent()` to interact with siblings
5. Add to GameObject: `gameObject.addComponent(new MyComponent())`

**Using Services** (like InteractionService):

Instead of creating complex interfaces, use services via `context.services`:

```typescript
// Old way (complex, lots of boilerplate)
class MyModule extends SceneModule implements I_InteractableModule {
  setInteractionSystem(system) {
    /* ... */
  }
  clearInteractionSystem() {
    /* ... */
  }
}

// New way (simple, clean)
class MyModule extends SceneModule {
  async start(context: I_ModuleContext) {
    context.services.interaction.register('my-object', mesh, config);
  }
}
```

#### Component Patterns

- Use Composition API with `<script setup>`
- For game views, use imperative Three.js classes (not TresJS components)
- For UI/HUD, use Reka UI primitives from `@/components/ui/`
- Always prefer VueUse composables (`useEventListener`, `useRafFn`, `useWindowSize`, etc.) over custom implementations

#### Styling Approach

- **Tailwind v4** utility classes for all styling
- **No SCSS/Sass** in new code (removed from rebuild)
- CSS variables for theming: `bg-background`, `text-foreground`, etc.
- Dark mode via `useColorMode()` from `@vueuse/core`
- Semantic color names defined in [src/style.css](src/style.css)

#### State Management

- Create new Pinia stores as needed (reference [src_deprecated/stores/](src_deprecated/stores/) for patterns)
- Use `pinia-plugin-persistedstate` for localStorage persistence
- Keep stores focused and single-purpose

#### Mobile-First Development

- **This project must be mobile-first**
- Test on touch devices frequently
- Virtual joystick available via [VirtualJoystick.vue](src/layout/VirtualJoystick.vue)
- Camera/character controllers support both keyboard and touch input
- Use VueUse `usePointerSwipe`, `usePointerPress` for touch interactions

### Testing & Quality

- **No TypeScript checking required** - user validates files
- Code formatting via Prettier (required before builds)
- **Always use `bun`** instead of npm (bun run, bun add, etc.)
- **Never run build commands without user permission**

### Migration Notes

#### What Was Removed (v0.5.0)

- **TresJS** (declarative Three.js) - replaced with imperative Three.js classes
- **shadcn-vue** - replaced with Reka UI primitives
- PrimeVue and old component libraries
- Old color system and theme utilities
- SCSS preprocessing
- Complex layout wrappers
- Old WebSocket composables (will be rebuilt)

#### What Was Preserved

- Core backend integration patterns (axios, topsyde-utils)
- Pinia store architecture
- Router structure
- Authentication concepts
- Game state management patterns

#### Reference Material

The [src_deprecated/](src_deprecated/) folder contains the complete old PrimeVue codebase. Useful for:

- Understanding old WebSocket event handling patterns (will need modernization)
- Referencing game state structures
- Understanding match/combat logic
- Reviewing authentication flow

**Do not copy-paste from deprecated code**; use it only as reference to rebuild with modern patterns.

### Common Patterns

#### Adding a New GameObject (Model Components Pattern - RECOMMENDED)

```typescript
// 1. Create prefab class in src/game/prefabs/
export class MyObject extends GameObject {
  constructor(config: { id: string; position?: [number, number, number] }) {
    super({ id: config.id });

    // Add components in fluent chain
    this.addComponent(
      new TransformComponent({ position: config.position || [0, 0, 0] }),
    )
      .addComponent(
        new GeometryComponent({ type: 'box', params: [1, 1, 1] }),
      )
      .addComponent(
        new MaterialComponent({ color: 0xff1493 }),
      )
      .addComponent(new MeshComponent())
      .addComponent(
        new PhysicsComponent({ type: 'static', shape: 'cuboid' }),
      )
      .addComponent(
        new HoverComponent({ glowColor: 0xff8c00 }),
      );
  }
}

// 2. Use in scene
const gameObjects = this.getModule('gameObjects') as GameObjectManager;
const myObj = new MyObject({ id: 'test-box', position: [0, 1, 0] });
gameObjects.add(myObj);
```

#### Adding a New SceneModule

```typescript
// 1. Create module class in src/game/modules/scene/
export class MyModule extends SceneModule {
  async init(context: I_ModuleContext): Promise<void> {
    // IMPORTANT: Call super.init() first to store context
    await super.init(context);

    // Create Three.js objects
    const mesh = new Mesh(geometry, material);
    context.scene.add(mesh);

    // Register for auto-cleanup
    context.cleanupRegistry.registerObject(mesh);

    // Use services (e.g., interactions)
    context.services.interaction
      .register('my-mesh', mesh)
      .withHoverGlow(0xff8c00)
      .withClickVFX('POW!');
  }

  update(delta: number): void {
    // Optional: animate on each frame
  }

  async destroy(): Promise<void> {
    // Optional: manual cleanup (if not using cleanupRegistry)
  }
}

// 2. Add to scene's module registry
interface PlaygroundModuleRegistry {
  // ... existing modules
  myModule: MyModule;
}

// 3. Register in scene
protected registerModules(): void {
  // ... existing modules
  this.addModule('myModule', new MyModule());
}
```

#### Adding a New Service

```typescript
// 1. Create service class in src/game/services/
export class MyService implements I_SceneService {
  async start(ctx: I_ModuleContext): Promise<void> {
    // Initialize service
  }

  update(delta: number): void {
    // Optional: update logic
  }

  async destroy(): Promise<void> {
    // Cleanup
  }
}

// 2. Add to GameScene services
protected services = {
  interaction: new InteractionService(),
  myService: new MyService(), // Add here
};

// 3. Use in modules via context
async start(context: I_ModuleContext) {
  context.services.myService.doSomething();
}
```

#### Creating a Custom Component

```typescript
// 1. Create component in src/game/components/
export class RotateComponent extends GameComponent {
  // Set priority for initialization order
  public readonly priority = ComponentPriority.DEFAULT;

  private speed: number;
  private axis: 'x' | 'y' | 'z';

  constructor(config: { speed: number; axis?: 'x' | 'y' | 'z' }) {
    super();
    this.speed = config.speed;
    this.axis = config.axis || 'y';
  }

  async init(context: I_GameContext): Promise<void> {
    // Query required sibling components
    const mesh = this.requireComponent(MeshComponent);
    console.log('RotateComponent initialized for', mesh.mesh.name);
  }

  update(delta: number): void {
    const mesh = this.getComponent(MeshComponent);
    if (!mesh) return;

    // Rotate mesh
    mesh.mesh.rotation[this.axis] += this.speed * delta;
  }

  destroy(): void {
    // Cleanup if needed
  }
}

// 2. Use in GameObject
const obj = new GameObject({ id: 'spinner' })
  .addComponent(new GeometryComponent({ type: 'box', params: [1, 1, 1] }))
  .addComponent(new MaterialComponent({ color: 0x00ff00 }))
  .addComponent(new MeshComponent())
  .addComponent(new RotateComponent({ speed: 1, axis: 'y' }));
```

#### Using Physics in Components

```typescript
export class PhysicsComponent extends GameComponent implements I_Interactable {
  public readonly priority = ComponentPriority.PHYSICS;

  async init(context: I_GameContext): Promise<void> {
    // Require MeshComponent (initialized before us due to priority)
    const mesh = this.requireComponent(MeshComponent);

    // Register with physics service
    context.services.physics.registerStaticFromMesh(
      this.gameObject.id,
      mesh.mesh,
      { showDebug: true }
    );
  }

  // Implement I_Interactable to add drag behavior
  registerInteractions(builder: I_InteractionBuilder, context: I_GameContext): void {
    const dragConfig = this.config.drag;
    if (dragConfig) {
      builder.withDrag({
        lockAxis: dragConfig.lockAxis,
        snapToGrid: dragConfig.snapToGrid,
        onEnd: (pos) => {
          // Update physics body when dragged
          context.services.physics.updateStaticBodyPosition(
            this.gameObject.id,
            [pos.x, pos.y, pos.z]
          );
        },
      });
    }
  }
}
```

#### Using VueUse in Game Loop

```typescript
// In Game.vue
import { useRafFn, useWindowSize, tryOnMounted, tryOnUnmounted } from '@vueuse/core';

// Auto-reactive window size
const { width, height } = useWindowSize();
watch([width, height], () => {
  engine?.resize();
  currentScene?.camera.instance.aspect = width.value / height.value;
  currentScene?.camera.instance.updateProjectionMatrix();
});

// Game loop with automatic cleanup
const { pause, resume } = useRafFn(() => {
  if (!engine || !currentScene) return;
  const delta = engine.clock.getDelta();
  currentScene.update(delta);
  engine.render(currentScene.camera.instance);
});

// Lifecycle hooks with safety
tryOnMounted(() => start());
tryOnUnmounted(() => destroy());
```

### Important Conventions

- **Never modify `src_deprecated/`** - it's frozen for reference
- **Always use VueUse** for common tasks (event listeners, window size, RAF, etc.)
- **Mobile-first mindset** - test on touch devices, use virtual joystick
- **Register all Three.js objects** with `cleanupRegistry.registerObject()` to prevent memory leaks
- **Register disposables** with `cleanupRegistry.registerDisposable()` for geometries, materials, textures
- **Use GameObject/Component pattern for game entities** - SceneModules are for scene infrastructure only
- **Component priority matters** - Default (1), Rendering (100), Physics (200), Interaction (300)
- **Always call `super.init(context)` first** in SceneModule init() method to store context reference
- **Use RxJS from topsyde-utils** for event coordination (`useRxjs(channel)`)
- **Prefer Services over Interfaces** - Use `context.services.X` instead of creating complex interfaces
- **InteractableBuilder pattern** - Use `.withHoverGlow()`, `.withClickVFX()`, `.withDrag()` for interactions
- **Physics via Rapier3D** - Use PhysicsService facade, not raw Rapier API
- **ModuleRegistry handles tracking** - Don't manually manage module collections

### Quick Reference: Architecture Decisions

#### Dual Architecture System

This codebase uses **two complementary patterns**:

1. **SceneModule Pattern** - For scene infrastructure
   - Examples: LightingModule, CharacterModule, PhysicsService
   - One per scene, registered in scene's module registry
   - Lifecycle: init() → update() → destroy()

2. **GameObject/Component Pattern** - For game entities 
   - Examples: EditableBox, Ground, Trees (prefabs)
   - Many instances per scene, managed by GameObjectManager
   - Components: GeometryComponent, MaterialComponent, PhysicsComponent, HoverComponent, etc.
   - Lifecycle: GameObject.init() → Component.init() → Component.update() → Component.destroy()

#### Key Design Patterns

- **Template Pattern** - GameScene provides lifecycle framework, subclasses override registerModules()
- **Builder Pattern** - InteractableBuilder for fluent interaction configuration
- **Facade Pattern** - PhysicsService wraps Rapier3D complexity
- **Registry Pattern** - ModuleRegistry for type-safe module tracking, GameObjectManager for entity tracking
- **Priority Pattern** - Components initialize in priority order (rendering → physics → interaction)
- **Service Locator** - Services available via context.services (interaction, physics)

#### Component Priority Order

```
1. DEFAULT (1)       - TransformComponent, GeometryComponent, MaterialComponent
2. RENDERING (100)   - MeshComponent (requires geometry + material)
3. PHYSICS (200)     - PhysicsComponent (requires mesh)
4. INTERACTION (300) - HoverComponent, ClickComponent, DragComponent (require mesh + physics)
```

#### Cleanup Strategy

- **CleanupRegistry** manages all cleanup automatically
- Register Object3D: `cleanupRegistry.registerObject(mesh)` - removes from scene + recursive dispose
- Register Disposables: `cleanupRegistry.registerDisposable(geometry)` - calls dispose()
- Register Watchers: `cleanupRegistry.registerWatcher(stopHandle)` - stops Vue watchers
- All registered resources cleaned on scene destroy

#### Physics Integration

- **Rapier3D** - WASM-based 3D physics engine
- **PhysicsService** - Simplified facade (never use raw Rapier API)
- Static bodies: Ground, walls, obstacles (never move)
- Kinematic bodies: Player, NPCs (move via explicit position updates with collision detection)
- Debug wireframes: Toggle via `gameConfig.debug.showPhysicsDebug`

#### Interaction System

- **InteractionService** - Centralized raycasting + visual feedback
- **InteractableBuilder** - Fluent API for defining behaviors
  - Hover: `.withHoverGlow(color, intensity)`, `.withTooltip(title, description)`
  - Click: `.withClickVFX(text, color)`, `.withCameraShake(intensity, duration)`, `.withParticles(count, color)`
  - Drag: `.withDrag({ lockAxis, snapToGrid, onEnd })` (editor mode only)
- Components implement `I_Interactable` interface to register with builder
- GameObject coordinates registration via `registerInteractions()` lifecycle hook
