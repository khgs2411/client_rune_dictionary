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

The game uses a **custom imperative architecture** with Three.js, not declarative TresJS. The architecture follows these patterns:

#### Core Classes

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

3. **GameModule** (`src/game/GameModule.ts`)
   - Base class for scene modules (lighting, ground, objects, etc.)
   - Lifecycle: `start(context)` → `update(delta)` → `destroy()`
   - Emits loading events via RxJS for loading screen coordination
   - Receives `I_ModuleContext` with `engine`, `scene`, `lifecycle`, `settings`, `sceneName`

4. **SceneLifecycle** (`src/game/SceneLifecycle.ts`)
   - Manages cleanup of Three.js objects and Vue watchers
   - Fluent API: `lifecycle.register(mesh1, mesh2).watch(watcher)`
   - Automatically disposes geometries/materials and stops watchers on cleanup
   - Prevents memory leaks

#### Example Scene Structure

```typescript
// scenes/PlaygroundScene.ts
interface PlaygroundModuleRegistry {
  lighting: LightingModule;
  ground: GroundModule;
  sceneObjects: SceneObjectsModule;
  characterMesh: CharacterMeshModule;
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

#### 2. Module Pattern

Each module is self-contained and receives `I_ModuleContext`:

```typescript
export class LightingModule extends GameModule implements I_SceneModule {
  async start(context: I_ModuleContext): Promise<void> {
    const light = new DirectionalLight();
    context.scene.add(light);
    context.lifecycle.register(light); // Auto-cleanup
    this.initialized(context.sceneName); // Notify loading complete
  }

  update(delta: number): void { /* animate lights */ }
  async destroy(): Promise<void> { /* cleanup */ }
}
```

#### 3. Loading System

Uses RxJS observables (`topsyde-utils`) for coordination:

- **Scene-level events**: `scene:loading` channel
  - `start`: Scene initialization begins (emits `totalAssets`)
  - `loaded`: Module initialized (emits `loaded` count)
  - `fail`: Module loading failed
- **Module-level events**: `module:loading` channel
  - `loaded`: Module reports completion via `this.initialized(sceneName)`

The [LoadingScreen.vue](src/components/LoadingScreen.vue) component subscribes to these events and shows progress.

#### 4. Composable Entity Pattern

```typescript
// High-level entity (owns Three.js instance)
export function useCamera(): I_GameCamera {
  const controller = useCameraController(); // Pure state logic
  const instance = new PerspectiveCamera();  // Three.js instance

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
- **settings.store.ts** - User settings and theme preferences
- **config.store.ts** - App configuration (debug flags, etc.)

Reference `src_deprecated/stores/` for old WebSocket and match state patterns.

### Backend Integration

- **axios** for REST API calls ([auth.api.ts](src/api/auth.api.ts))
- **topsyde-utils 1.0.209** - Custom package for WebSocket utilities, RxJS helpers, game logic
- **Custom Vite Plugin** ([plugins/topsyde-utils-vite-plugin.ts](plugins/topsyde-utils-vite-plugin.ts))
  - Provides Node.js module compatibility in browser
  - Mocks `path`, `fs` modules for topsyde-utils
  - Disables sourcemaps for topsyde-utils (prevents dev warnings)

### Directory Structure

```
src/
├── game/                    # Core game engine
│   ├── Engine.ts           # Three.js engine wrapper
│   ├── GameScene.ts        # Abstract scene base class
│   ├── GameModule.ts       # Module base class
│   ├── SceneLifecycle.ts   # Cleanup manager
│   └── modules/            # Reusable scene modules
│       ├── LightingModule.ts
│       ├── GroundModule.ts
│       ├── SceneObjectsModule.ts
│       ├── CharacterMeshModule.ts
│       └── DebugModule.ts
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
│   ├── settings.store.ts   # User preferences + theme
│   └── config.store.ts     # App config (debug flags, etc.)
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
- `VITE_WS_HOST`: WebSocket server host (defaults to wss://topsyde-gaming.duckdns.org:3000)
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

1. Extend `GameModule` base class
2. Implement `I_SceneModule` interface:
   - `async start(context)` - Initialize and add to scene
   - `update(delta)` - Update each frame (optional)
   - `async destroy()` - Cleanup (optional if using lifecycle.register)
3. Register Three.js objects with `context.lifecycle.register(...objects)`
4. Call `this.initialized(context.sceneName)` when ready

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

#### Adding a New Game Module

```typescript
// 1. Create module class in src/game/modules/
export class MyModule extends GameModule implements I_SceneModule {
  async start(context: I_ModuleContext): Promise<void> {
    // Create Three.js objects
    const mesh = new Mesh(geometry, material);
    context.scene.add(mesh);

    // Register for auto-cleanup
    context.lifecycle.register(mesh);

    // Notify loading complete
    this.initialized(context.sceneName);
  }

  update(delta: number): void {
    // Optional: animate on each frame
  }

  async destroy(): Promise<void> {
    // Optional: manual cleanup (if not using lifecycle.register)
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

#### Theme-Aware Materials

```typescript
// Module with dynamic colors
export class SceneObjectsModule extends GameModule implements I_ThemedSceneModule {
  private themedMeshes: Mesh[] = [];

  async start(context: I_ModuleContext): Promise<void> {
    const mesh = new Mesh(
      new BoxGeometry(),
      new MeshStandardMaterial({ color: 0xffffff }) // Will be updated
    );
    this.themedMeshes.push(mesh);
    context.scene.add(mesh);
    context.lifecycle.register(mesh);
    this.initialized(context.sceneName);
  }

  updateColors(colorHex: number): void {
    this.themedMeshes.forEach((mesh) => {
      (mesh.material as MeshStandardMaterial).color.setHex(colorHex);
    });
  }
}

// Scene watches theme and updates modules
protected finalizeSetup(): void {
  super.finalizeSetup();
  this.lifecycle.watch(
    watch(
      () => this.settings.theme.currentTheme,
      () => this.modules.sceneObjects?.updateColors(this.settings.theme.primaryForeground)
    )
  );
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
- **Register all Three.js objects** with `lifecycle.register()` to prevent memory leaks
- **Emit loading events** from modules via `this.initialized(sceneName)`
- **Use RxJS from topsyde-utils** for event coordination (`useRxjs(channel)`)
