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

This application underwent a complete architectural rebuild from a 2D PrimeVue app to a 3D Three.js-based game. The old codebase is preserved in `src_deprecated/` for reference but should not be used for new development.

### Frontend Stack

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety (single consolidated `tsconfig.json`)
- **Vite 7** as build tool and dev server
- **Pinia** for state management with `pinia-plugin-persistedstate`
- **Vue Router** for navigation
- **Three.js + TresJS** for 3D rendering and game world

### 3D Rendering Stack

- **Three.js 0.180.0** - Core 3D engine
- **@tresjs/core 5.0.3** - Declarative Three.js using Vue components
- **@tresjs/cientos 5.0.2** - Helper components (OrbitControls, Sky, Environment, etc.)
- **@tresjs/post-processing 3.0.0** - Visual effects (Bloom, SSAO, etc.)

**Important:** TresJS requires special Vite plugin configuration. The `vite.config.ts` imports `templateCompilerOptions` from `@tresjs/core` and spreads it into the Vue plugin.

### UI & Styling

- **shadcn-vue** - Component system built on Radix Vue primitives
- **Tailwind CSS 4.1** - Utility-first styling (configured via `@tailwindcss/vite` plugin)
- **CSS Variables** - Theming approach using HSL color values
- **lucide-vue-next** - Icon library

**Theming System:**

- Light/dark mode via VueUse `useColorMode()` composable
- CSS variables defined in `src/style.css` (`:root` for light, `.dark` for dark)
- Tailwind v4 uses `@import "tailwindcss"` syntax (no config file needed)
- Base color: Neutral
- Style variant: New York

### Key Architectural Patterns

#### TresJS 3D Scene Pattern

TresJS allows declarative Three.js using Vue components:

```vue
<TresCanvas>
  <TresPerspectiveCamera :position="[3, 3, 3]" />
  <TresMesh>
    <TresBoxGeometry />
    <TresMeshStandardMaterial color="orange" />
  </TresMesh>
  <TresAmbientLight :intensity="0.5" />
</TresCanvas>
```

The 3D world is the primary interface; traditional UI components are used for HUD overlays.

#### State Management (Pinia Stores)

Stores are being rebuilt from scratch. Reference `src_deprecated/stores/` for old patterns:

- Authentication and WebSocket client management
- Match state and game state
- User settings and theme preferences
- Toast notifications

#### Backend Integration

- **axios** for REST API calls
- **topsyde-utils 1.0.207** - Custom package for WebSocket utilities and game logic
- **Custom Vite Plugin** (`plugins/topsyde-utils-vite-plugin.ts`) - Provides Node.js module compatibility in browser (mocks `path`, `fs` for topsyde-utils)

### Directory Structure

```
src/
├── components/       # Vue components
│   └── ui/          # shadcn-vue components (added via CLI)
├── lib/             # Utility functions
│   └── utils.ts     # shadcn utilities (cn, etc.)
├── router/          # Vue Router configuration
├── views/           # Page components
├── App.vue          # Root component (simple RouterView wrapper)
├── main.ts          # App entry point
├── style.css        # Global styles + Tailwind + CSS variables
└── vite-env.d.ts    # Vite type definitions

src_deprecated/      # Old 2D app (PrimeVue-based) - for reference only
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
- **TresJS Integration**: Requires `templateCompilerOptions` from `@tresjs/core` in Vite config

#### Important Files

- `components.json` - shadcn-vue configuration (style: new-york, baseColor: neutral)
- `vite.config.ts` - Build configuration with TresJS + Tailwind v4 plugins
- `tsconfig.json` - Single consolidated TypeScript config (no project references)
- `plugins/topsyde-utils-vite-plugin.ts` - Critical for topsyde-utils browser compatibility

### Development Guidelines

#### Component Patterns

- Use Composition API with `<script setup>`
- For 3D scenes, use TresJS declarative components
- For UI/HUD, use shadcn-vue components from `@/components/ui/`
- Add shadcn components via: `bunx shadcn-vue@latest add <component-name>`

#### Styling Approach

- **Tailwind v4** utility classes for all styling
- **No SCSS/Sass** - removed from this rebuild
- CSS variables for theming: `bg-background`, `text-foreground`, etc.
- Dark mode via `useColorMode()` from `@vueuse/core`
- Semantic color names defined in `src/style.css`

#### State Management

- Create new Pinia stores as needed (reference deprecated stores for patterns)
- Use `pinia-plugin-persistedstate` for localStorage persistence
- Keep stores focused and single-purpose

#### WebSocket Management

The old WebSocket implementation is in `src_deprecated/common/composables/`. It will be completely rebuilt with a cleaner architecture.

### Testing & Quality

- **No TypeScript checking required** - user validates files
- Code formatting via Prettier
- **Always use `bun`** instead of npm (bun run, bun add, etc.)
- Never run build commands without user permission

### Migration Notes

#### What Was Removed

- PrimeVue, Reka UI, and all old component libraries
- Old color system and theme utilities
- SCSS preprocessing
- Complex layout wrappers
- Old WebSocket composables (will be rebuilt)

#### What Was Preserved

- Core backend integration patterns (axios, topsyde-utils)
- Pinia store architecture (but stores need rebuilding)
- Router structure
- Authentication concepts
- Game state management patterns

#### Reference Material

The `src_deprecated/` folder contains the complete old codebase. Useful for:

- Understanding old WebSocket event handling patterns
- Referencing game state structures
- Understanding match/combat logic
- Reviewing authentication flow

Do not copy-paste from deprecated code; use it only as reference to rebuild with modern patterns.

- This project has to be mobile first
- Always use vueuse where possible in vue related files - it is battle tested and filled with utilities