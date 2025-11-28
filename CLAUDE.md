# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important rules and guidelines

**This project uses the Flow framework for project management.**

**CRITICAL DELEGATION RULE**: You MUST delegate ALL Flow-related operations to the Flow sub-agent.

**HOW TO DELEGATE TO FLOW:**

```
Task tool → subagent_type: "flow" → description + prompt
```

**DO NOT use these (they execute in YOUR context, not Flow's):**

- ❌ Skill tool with flow-\* skills
- ❌ SlashCommand tool with /flow-\* commands
- ❌ Reading .flow/ files directly
- ❌ Task tool with subagent_type: "general-purpose"

**ALWAYS delegate when the user**:

- Asks about status/progress: "what am I working on?", "what's next?", "show my status"
- Manages work: "add a task", "create a phase", "start iteration", "mark as complete"
- Plans features: "I want to build X", "let's plan Y", "add feature Z"
- Updates architecture: "update PLAN.md", "add a guideline", "change the approach"
- Asks methodology questions: "what are iterations?", "how do phases work?"
- Mentions ANY of: tasks, phases, iterations, DASHBOARD, PLAN, brainstorm, .flow/ files, /flow-\* commands

**ROLE SEPARATION:**

- Flow agent = PROJECT MANAGER (workflow, planning, status)
- You = ENGINEER (code implementation, debugging, git operations)

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
- **Bun.JS** as runtime and package manager (replaces Node.js + npm/yarn)

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

3. **GameObjectManager** (`src/game/systems/GameObjectsManager.ts`)

    - SceneModule that manages all GameObjects in a scene
    - Handles GameObject lifecycle coordination
    - Provides collection management: `add()`, `remove()`, `get()`, `has()`, `getAll()`
    - Add to scene like any other module: `this.addModule('gameObjects', new GameObjectManager())`

4. **Prefabs** (`src/game/prefabs/`)
    - Pre-configured GameObjects with common component combinations
    - Example: `EditableBox` - draggable, physics-enabled, persistent box
    - Create custom prefabs by extending GameObject and adding components in constructor

**Component Architecture Philosophy:**

The component system follows **Pattern B** - a layered architecture where:

- **Low-level components** (Capability Layer) - Emit events, provide pure data/measurements
- **High-level components** (Orchestrator Layer) - Listen to events, make decisions, coordinate behavior

This separation enables:
- Reusable low-level components across different use cases
- Single responsibility principle (each component does one thing well)
- Flexible composition (swap orchestrators without changing capabilities)

**Example: Match initiation flow**
```
InteractionComponent (emits 'doubleclick')
    → MatchComponent (listens, checks range via UnitsComponent, triggers state change)
        → MatchModule (handles API calls, arena spawning, transitions)
```

**Trait System:**

Components can declare interfaces they implement via traits, enabling interface-based lookup:

```typescript
// In component constructor:
this.registerTrait(TRAIT.MATERIAL_PROVIDER);

// In consumer:
const material = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
```

Available traits: `TRAIT.MATERIAL_PROVIDER`, `TRAIT.MESH_PROVIDER`

**Available Components:**

- **Rendering Components** (`components/rendering/`) - Priority: DEFAULT (1)

    - `TransformComponent` - Position, rotation, scale
    - `GeometryComponent` - Box, sphere, capsule, cylinder, cone, plane geometries
    - `MaterialComponent` - Standard material with color, roughness, metalness
    - `ToonMaterialComponent` - Cel-shaded toon material
    - `BaseMaterialComponent` - Abstract base for material components (registers MATERIAL_PROVIDER trait)
    - `MeshComponent` - Combines geometry + material into Three.js Mesh (Priority: RENDERING 100)
    - `CharacterMeshComponent` - Character-specific mesh with animations
    - `InstancedMeshComponent` - Instanced rendering for many identical objects
    - `GridHelperComponent` - Debug grid visualization

- **Entity Components** (`components/entities/`) - Priority: DEFAULT (1)

    - `UnitsComponent` - **Pure measurement utility** for distance calculations
      - `distanceTo(target)` - Euclidean distance to Vector3
      - `distanceToPlayer()` - Distance to player character
      - `isPlayerWithinRange(range)` - Range check helper
    - `SpawnComponent` - Spawn point configuration
    - `TrajectoryComponent` - Projectile trajectory calculation
    - `KinematicMovementComponent` - Kinematic body movement
    - `KinematicCollisionComponent` - Kinematic collision detection

- **Interaction Components** (`components/interactions/`) - Priority: INTERACTION (300)

    - `InteractionComponent` - **Pure event emitter** for click/doubleclick
      - Emits 'click' and 'doubleclick' events
      - Handles double-click detection (300ms threshold)
      - Other components listen via `.on('doubleclick', callback)`
    - `HoverComponent` - **Pure hover capability** that emits events
      - Emits 'start' and 'end' events (no visual effects!)
      - Consumers decide what to do on hover
      - Query hover state via `.hovering` property
    - `HoverGlowComponent` - Applies emissive glow on hover
    - `ClickVFXComponent` - Shows click effects (POW!, particles)
    - `MouseClickComponent` - Generic mouse click handler
    - `HotkeyComponent` - Keyboard shortcut bindings
    - `CollisionComponent` - Static collision body registration
    - `DragComponent` - Drag objects on XZ plane (editor mode only)

- **Match Components** (`components/match/`) - Priority: INTERACTION (300)

    - `MatchComponent` - **Orchestrator** for match initiation
      - Listens to InteractionComponent doubleclick events
      - Listens to HoverComponent hover events
      - Checks player range via UnitsComponent
      - Shows combat glow when hovering in range (via VFXService)
      - Triggers MATCH_REQUEST state change
      - Holds arena configuration for match environment

- **Multiplayer Components** (`components/multiplayer/`)

    - `RemotePlayerComponent` - Renders remote player characters
    - `SyncMovementComponent` - Synchronizes movement with server

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
	readonly name = "PlaygroundScene";
	readonly engine: Engine;

	constructor(config: I_SceneConfig) {
		super();
		this.engine = config.engine;
		this.start(); // Template method triggers full initialization
	}

	protected registerModules(): void {
		this.addModule("lighting", new LightingModule());
		this.addModule("ground", new GroundModule(this.settings));
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
		context.services.interaction.register("box-1", box, {
			hoverable: true,
			clickable: true,
			tooltip: { title: "Mysterious Box" },
		});

		this.initialized(context.sceneName);
	}
}
```

#### 3. Systems Layer Pattern

GameScene provides shared **systems** (game-wide subsystems) via the context. Systems are distinct from components - they provide scene-wide functionality that multiple GameObjects/Components can use.

```typescript
// Components access systems via context.getService()
async init(context: I_SceneContext): Promise<void> {
  const interaction = context.getService("interaction");
  const vfx = context.getService("vfx");
  const state = context.getService("state");
}
```

**Current Systems** (`src/game/systems/`):

- **InteractionSystem** - Centralized interaction detection and event handling
    - Registers hover/click handlers for meshes
    - Components use: `interaction.registerHover()`, `interaction.registerMouseClick()`
    - Handles raycasting and event dispatch

- **PhysicsSystem** - Rapier-based physics engine wrapper (Rapier3D WASM)
    - Simple facade over Rapier physics (single file, minimal API)
    - Static bodies: `registerStatic()`, `registerStaticFromMesh()`, `registerInstancedStatic()`
    - Kinematic characters: `registerKinematic()`, `registerKinematicFromMesh()`
    - Movement: `moveKinematic()`, `isGrounded()`, `getPosition()`, `setPosition()`
    - Debug wireframes with global toggle via gameConfig store
    - Auto-cleanup via CleanupRegistry

- **VFXSystem** - Visual effects with object pooling
    - **Emissive glow**: `applyEmissive(mesh, color, intensity)`, `restoreEmissive(mesh)`
      - Caches original material values for restoration
      - Used by MatchComponent for combat hover glow
    - **Click effects**: `showClickEffect(position, text, color)` - POW!, BAM! text sprites
    - **Tooltips**: `showTooltip(position, title, description)`, `hideTooltip()`
      - Billboards that face camera (using troika-three-text for crisp rendering)
    - **Particles**: `spawnParticles(position, count, color, speed)` - Burst effects
    - **Camera shake**: `shakeCamera(intensity, duration)` - Screen feedback
    - Pre-allocated pools for performance (TextSprites: 10, Tooltips: 3, Particles: 5)

- **SceneState** - Scene state machine
    - States: `OVERWORLD`, `MATCH_REQUEST`, `MATCH`, etc.
    - Components query state: `stateService.isOverworld()`
    - Components trigger transitions: `stateService.setState(E_SceneState.MATCH_REQUEST)`

- **GameObjectsManager** - Manages all GameObjects in scene
    - Collection management: `add()`, `remove()`, `get()`, `has()`, `getAll()`
    - Coordinates GameObject lifecycle

- **NetworkingSystem** - WebSocket communication for multiplayer

- **Spawner** - Entity spawning utilities

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
│   ├── GameComponent.ts    # Base class for all components (includes TRAIT system)
│   ├── modules/            # Reusable scene modules
│   │   └── scene/          # Scene infrastructure modules
│   │       ├── LightingModule.ts
│   │       ├── SceneObjectsModule.ts
│   │       ├── SceneInstancedObjectsModule.ts
│   │       ├── CharacterModule.ts
│   │       ├── DebugModule.ts
│   │       └── VFXModule.ts
│   ├── components/         # GameComponents (organized by domain)
│   │   ├── rendering/      # Visual components (Priority: DEFAULT/RENDERING)
│   │   │   ├── TransformComponent.ts
│   │   │   ├── GeometryComponent.ts
│   │   │   ├── BaseMaterialComponent.ts  # Abstract base with TRAIT registration
│   │   │   ├── MaterialComponent.ts
│   │   │   ├── ToonMaterialComponent.ts
│   │   │   ├── MeshComponent.ts
│   │   │   ├── CharacterMeshComponent.ts
│   │   │   ├── InstancedMeshComponent.ts
│   │   │   └── GridHelperComponent.ts
│   │   ├── entities/       # Entity measurement/movement (Priority: DEFAULT)
│   │   │   ├── UnitsComponent.ts         # Pure distance measurement utility
│   │   │   ├── TransformComponent.ts
│   │   │   ├── SpawnComponent.ts
│   │   │   ├── TrajectoryComponent.ts
│   │   │   ├── KinematicMovementComponent.ts
│   │   │   └── KinematicCollisionComponent.ts
│   │   ├── interactions/   # Interaction capabilities (Priority: INTERACTION)
│   │   │   ├── InteractionComponent.ts   # Pure event emitter (click/doubleclick)
│   │   │   ├── HoverComponent.ts         # Pure hover events (no visuals)
│   │   │   ├── HoverGlowComponent.ts     # Emissive glow on hover
│   │   │   ├── ClickVFXComponent.ts      # Click visual effects
│   │   │   ├── MouseClickComponent.ts
│   │   │   ├── HotkeyComponent.ts
│   │   │   ├── CollisionComponent.ts
│   │   │   └── DragComponent.ts
│   │   ├── match/          # Match/combat orchestration (Priority: INTERACTION)
│   │   │   └── MatchComponent.ts         # Orchestrator for match initiation
│   │   └── multiplayer/    # Network synchronization
│   │       ├── RemotePlayerComponent.ts
│   │       └── SyncMovementComponent.ts
│   ├── prefabs/            # Pre-configured GameObjects (organized by type)
│   │   ├── character/      # Player-related prefabs
│   │   │   ├── LocalPlayer.ts
│   │   │   ├── RemotePlayer.ts
│   │   │   └── createPlayer.ts
│   │   ├── environment/    # World objects
│   │   │   ├── Rock.ts
│   │   │   ├── House.ts
│   │   │   ├── Path.ts
│   │   │   └── Hill.ts
│   │   ├── npc/            # Non-player characters
│   │   │   └── TrainingDummy.ts  # Matchable NPC (example of Pattern B)
│   │   ├── Ground.ts       # Static ground plane
│   │   ├── Trees.ts        # Instanced tree meshes
│   │   ├── Fireball.ts     # Projectile prefab
│   │   ├── MatchGrid.ts    # Match arena grid
│   │   ├── MatchAreaWalls.ts
│   │   ├── MatchAreaDome.ts
│   │   └── MatchCameraAnchor.ts
│   ├── systems/            # Game systems (scene-wide subsystems)
│   │   ├── InteractionSystem.ts    # Interaction detection + event handling
│   │   ├── PhysicsSystem.ts        # Rapier3D physics wrapper
│   │   ├── VFXSystem.ts            # Visual effects (emissive, particles, tooltips)
│   │   ├── GameObjectsManager.ts   # GameObject lifecycle management
│   │   ├── SceneState.ts           # Scene state machine (OVERWORLD, MATCH_REQUEST, etc.)
│   │   ├── NetworkingSystem.ts     # WebSocket multiplayer communication
│   │   ├── SceneSystem.ts          # Base class for systems
│   │   └── Spawner.ts              # Entity spawning utilities
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
		context.services.interaction.register("my-object", mesh, config);
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
		this.addComponent(new TransformComponent({ position: config.position || [0, 0, 0] }))
			.addComponent(new GeometryComponent({ type: "box", params: [1, 1, 1] }))
			.addComponent(new MaterialComponent({ color: 0xff1493 }))
			.addComponent(new MeshComponent())
			.addComponent(new PhysicsComponent({ type: "static", shape: "cuboid" }))
			.addComponent(new HoverComponent({ glowColor: 0xff8c00 }));
	}
}

// 2. Use in scene
const gameObjects = this.getModule("gameObjects") as GameObjectManager;
const myObj = new MyObject({ id: "test-box", position: [0, 1, 0] });
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

#### Adding a New System

```typescript
// 1. Create system class in src/game/systems/
export class MySystem extends SceneSystem {
  protected async init(context: I_SceneContext): Promise<void> {
    // Initialize system
  }

  update(delta: number): void {
    // Optional: per-frame update logic
  }

  async destroy(): Promise<void> {
    // Cleanup
  }
}

// 2. Register system in GameScene
// (Systems are registered via the scene's service registry)

// 3. Use in components via context.getService()
async init(context: I_SceneContext): Promise<void> {
  const mySystem = context.getService("mySystem");
  mySystem.doSomething();
}
```

#### Creating a Custom Component

**Simple Component (no dependencies):**

```typescript
// 1. Create component in src/game/components/
export class RotateComponent extends GameComponent {
	public readonly priority = ComponentPriority.DEFAULT;
	private speed: number;
	private axis: "x" | "y" | "z";

	constructor(config: { speed: number; axis?: "x" | "y" | "z" }) {
		super();
		this.speed = config.speed;
		this.axis = config.axis || "y";
	}

	async init(context: I_SceneContext): Promise<void> {
		const mesh = this.requireComponent(MeshComponent);
		console.log("RotateComponent initialized for", mesh.mesh.name);
	}

	update(delta: number): void {
		const mesh = this.getComponent(MeshComponent);
		if (!mesh) return;
		mesh.mesh.rotation[this.axis] += this.speed * delta;
	}
}
```

**Event Emitter Component (Capability Layer - Pattern B):**

```typescript
// Pure capability - emits events, no behavior decisions
export class HoverComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;
	private events = new Map<string, HoverEventCallback[]>();
	private isHovered = false;

	async init(context: I_SceneContext): Promise<void> {
		const meshComp = this.requireComponent(MeshComponent);
		const interaction = context.getService("interaction");

		interaction.registerHover(`${this.gameObject.id}-hover`, meshComp.mesh, {
			onStart: (intersection) => {
				this.isHovered = true;
				this.emit("start", intersection);
			},
			onEnd: () => {
				this.isHovered = false;
				this.emit("end");
			},
		});
	}

	public on(event: "start" | "end", callback: HoverEventCallback): void {
		if (!this.events.has(event)) this.events.set(event, []);
		this.events.get(event)!.push(callback);
	}

	public get hovering(): boolean { return this.isHovered; }
}
```

**Orchestrator Component (Pattern B):**

```typescript
// Orchestrates behavior - listens to events, queries data, makes decisions
export class MatchComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;
	public readonly interactionRange: number;

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;
		this.unitsComponent = this.requireComponent(UnitsComponent);
		this.meshComponent = this.requireComponent(MeshComponent);

		// Listen to low-level events
		const interaction = this.requireComponent(InteractionComponent);
		interaction.on("doubleclick", () => this.requestMatch(context));

		const hover = this.getComponent(HoverComponent);
		hover?.on("start", () => {
			if (this.isWithinInteractionRange()) this.showCombatGlow();
		});
		hover?.on("end", () => this.hideCombatGlow());
	}

	private requestMatch(context: I_SceneContext): void {
		const stateService = context.getService("state");
		if (!stateService.isOverworld()) return;
		if (!this.isWithinInteractionRange()) return;

		// Trigger state change - MatchModule handles the rest
		stateService.setState(E_SceneState.MATCH_REQUEST);
	}

	public isWithinInteractionRange(): boolean {
		return this.unitsComponent.isPlayerWithinRange(this.interactionRange);
	}
}
```

#### Using Physics in Components

```typescript
export class PhysicsComponent extends GameComponent implements I_Interactable {
	public readonly priority = ComponentPriority.PHYSICS;

	async init(context: I_SceneContext): Promise<void> {
		// Require MeshComponent (initialized before us due to priority)
		const mesh = this.requireComponent(MeshComponent);

		// Register with physics service
		context.services.physics.registerStaticFromMesh(this.gameObject.id, mesh.mesh, {
			showDebug: true,
		});
	}

	// Implement I_Interactable to add drag behavior
	registerInteractions(builder: I_InteractionBuilder, context: I_SceneContext): void {
		const dragConfig = this.config.drag;
		if (dragConfig) {
			builder.withDrag({
				lockAxis: dragConfig.lockAxis,
				snapToGrid: dragConfig.snapToGrid,
				onEnd: (pos) => {
					// Update physics body when dragged
					context.services.physics.updateStaticBodyPosition(this.gameObject.id, [pos.x, pos.y, pos.z]);
				},
			});
		}
	}
}
```

#### Using VueUse in Game Loop

```typescript
// In Game.vue
import { useRafFn, useWindowSize, tryOnMounted, tryOnUnmounted } from "@vueuse/core";

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

**Component Architecture:**

- **Follow Pattern B** - Low-level components emit events, high-level orchestrate behavior
- **Keep event emitters pure** - HoverComponent/InteractionComponent emit events only, no visual effects
- **Orchestrators own behavior** - MatchComponent decides when to show glow, when to start match
- **Use UnitsComponent for distance** - Pure measurement utility, don't embed distance logic elsewhere
- **Component priority matters** - Default (1), Rendering (100), Physics (200), Interaction (300)
- **Use traits for interfaces** - `this.registerTrait(TRAIT.MATERIAL_PROVIDER)` for interface-based lookup

**General Rules:**

- **Never modify `src_deprecated/`** - it's frozen for reference
- **Always use VueUse** for common tasks (event listeners, window size, RAF, etc.)
- **Mobile-first mindset** - test on touch devices, use virtual joystick
- **Register all Three.js objects** with `cleanupRegistry.registerObject()` to prevent memory leaks
- **Register disposables** with `cleanupRegistry.registerDisposable()` for geometries, materials, textures
- **Use GameObject/Component pattern for game entities** - SceneModules are for scene infrastructure only
- **Always call `super.init(context)` first** in SceneModule init() method to store context reference
- **Use RxJS from topsyde-utils** for event coordination (`useRxjs(channel)`)
- **Prefer Systems over Interfaces** - Use `context.getService("x")` instead of creating complex interfaces
- **VFXSystem for visual effects** - Use `applyEmissive()`, `spawnParticles()`, `shakeCamera()` instead of custom effects
- **Physics via Rapier3D** - Use PhysicsSystem facade, not raw Rapier API
- **ModuleRegistry handles tracking** - Don't manually manage module collections

### Quick Reference: Architecture Decisions

#### Dual Architecture System

This codebase uses **two complementary patterns**:

1. **SceneModule Pattern** - For scene infrastructure

    - Examples: LightingModule, CharacterModule, PhysicsService
    - One per scene, registered in scene's module registry
    - Lifecycle: init() → update() → destroy()

2. **GameObject/Component Pattern** - For game entities
    - Examples: TrainingDummy, Ground, Trees (prefabs)
    - Many instances per scene, managed by GameObjectManager
    - Components organized by domain: rendering/, entities/, interactions/, match/, multiplayer/
    - Lifecycle: GameObject.init() → Component.init() → Component.update() → Component.destroy()

#### Key Design Patterns

- **Pattern B (Layered Components)** - Low-level emit events, high-level orchestrate behavior
  - Capability Layer: HoverComponent, InteractionComponent, UnitsComponent (pure events/data)
  - Orchestrator Layer: MatchComponent (listens, decides, coordinates)
  - Module Layer: MatchModule (handles side effects - API calls, arena spawning)
- **Template Pattern** - GameScene provides lifecycle framework, subclasses override registerModules()
- **Builder Pattern** - InteractableBuilder for fluent interaction configuration
- **Facade Pattern** - PhysicsSystem wraps Rapier3D, VFXSystem wraps effect subsystems
- **Registry Pattern** - ModuleRegistry for type-safe module tracking, GameObjectManager for entity tracking
- **Priority Pattern** - Components initialize in priority order (rendering → physics → interaction)
- **Service Locator** - Systems available via context.getService() (interaction, physics, vfx, state)
- **Trait Pattern** - Interface-based component lookup via TRAIT symbols

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

**Service-Based (low-level registration):**
- **InteractionService** - Centralized raycasting + event detection
- **InteractableBuilder** - Fluent API for defining behaviors
    - Hover: `.withHoverGlow(color, intensity)`, `.withTooltip(title, description)`
    - Click: `.withClickVFX(text, color)`, `.withCameraShake(intensity, duration)`, `.withParticles(count, color)`
    - Drag: `.withDrag({ lockAxis, snapToGrid, onEnd })` (editor mode only)

**Component-Based (Pattern B - RECOMMENDED):**
- **InteractionComponent** - Pure event emitter for click/doubleclick
- **HoverComponent** - Pure hover detection (emits 'start'/'end' events)
- **MatchComponent** - Orchestrator example (listens to events, checks range, triggers state)
- **UnitsComponent** - Pure distance measurement (no events, just data)
- **VFXSystem** - Visual effects (emissive glow, particles, camera shake)

**Pattern B Flow Example:**
```
User hovers over NPC
  → HoverComponent emits 'start'
  → MatchComponent listens, checks UnitsComponent.isPlayerWithinRange()
  → If in range: VFXSystem.applyEmissive() shows combat glow

User double-clicks NPC
  → InteractionComponent emits 'doubleclick'
  → MatchComponent checks range + scene state
  → If valid: SceneStateService.setState(MATCH_REQUEST)
  → MatchModule handles API calls, arena spawning, camera transition
```
