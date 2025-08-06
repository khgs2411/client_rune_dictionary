# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is the **Client Application** for Rune RPG - a turn-based RPG game with real-time matchmaking, part of a multi-service architecture:

1. **Client Application** (this project) - Vue 3 frontend with real-time WebSocket combat
2. **Dictionary Server** (`../server_rune_dictionary/`) - DigitalOcean serverless API for game data
3. **Matchmaking Server** (`../server_rune_matchmaking/`) - Real-time WebSocket server for combat and matchmaking
4. **Deployment Server** (`../server_rune_deployment/`) - Oracle Cloud deployment automation

## Development Commands

```bash
# Development
bun run dev              # Start Vite dev server on port 8080
bun run serve            # Alias for dev

# Build & Production
bun run build            # TypeScript check + production build
bun run build:test       # Test build process
bun run build:cleanup    # Clean up build artifacts
bun run preview          # Preview production build locally

# Deployment
bun run deploy           # Deploy to GitHub Pages

# Code Quality
bun run format           # Format code with Prettier
bun run prettier         # Alias for format
bun run format:check     # Check code formatting

# UI Testing
# Use Playwright MCP for visual verification of UI changes
```

## Architecture Overview

### Core Technology Stack

- **Framework**: Vue 3.5.13 with Composition API (`<script setup>`)
- **Build Tool**: Vite 6.2.2 with TypeScript 5.6.3
- **UI Library**: PrimeVue 4.3.2 with Aura theme
- **Styling**: SCSS + Tailwind CSS v4 + PrimeUI integration
- **Animation**: motion-v (v-motion) for complex animations
- **State Management**: Pinia with persistence (pinia-plugin-persistedstate)
- **Routing**: Vue Router 4.5.0
- **WebSocket**: Custom implementation using `topsyde-utils` library
- **HTTP Client**: Axios for API calls
- **Package Manager**: Bun (use instead of npm)

### Application Structure

#### Routes & Navigation

1. `/login` - Authentication entry point (default redirect)
2. `/app` - Main dictionary interface (requires auth)
3. `/match` - Real-time combat interface (requires auth)
4. `/` - Home/landing page

#### State Management (Pinia Stores)

- **authStore** - User authentication, client data, authorization status
- **settingsStore** - User preferences and configuration
- **miscStore** - General application state
- **matchStore** - Match-specific game state

#### WebSocket Architecture

- **useWebsocketInterface** - Core WebSocket connection handling
- **useWebsocketLogic** - Message processing and business logic
- **useWebsocketEventHandler** - Event routing and handling
- **useWebsocketEmitter** - Outbound message handling
- **useWSM** - WebSocket message utilities
- Auto-reconnection with heartbeat (20s ping/pong intervals)
- Structured message handling for chat and game actions

#### Component Organization

```
src/
├── views/              # Route components
│   ├── Dictionary.vue  # Main app interface
│   ├── Login.vue       # Authentication
│   ├── Match.vue       # Combat interface
│   └── Home.vue        # Landing page
├── components/
│   ├── application/    # Core app components
│   │   └── WebsocketConnection.vue
│   ├── chat/           # Chat system
│   │   ├── Chat.vue
│   │   ├── ChatMessage.vue
│   │   └── ChatWindow.vue
│   ├── match/          # Game combat components
│   │   ├── BattleArena.vue
│   │   ├── GameActions.vue
│   │   ├── GameInterface.vue
│   │   ├── GameLog.vue
│   │   ├── MatchLobby.vue
│   │   └── MatchResult.vue
│   ├── layout/         # Layout components
│   │   ├── Layout.vue
│   │   ├── Menu.vue
│   │   ├── Settings.vue
│   │   └── ResponsiveContainer.vue
│   └── utilities/      # Utility components
│       ├── Loading.vue
│       ├── Prompt.vue
│       └── Toast.vue
├── composables/        # Reusable composition functions
├── api/                # API layer
├── stores/             # Pinia stores
└── assets/             # Styles and static assets
```

### Configuration

#### Environment Variables

- `VITE_WS_HOST` - WebSocket server URL (default: wss://topsyde-gaming.duckdns.org:3000)
- `VITE_API_KEY` - API authentication key

#### Build Configuration

- Development base path: `/`
- Production base path: `/client_rune_dictionary/`
- Dev server port: 8080
- WebSocket proxy: `/ws` (development only)
- TypeScript: Strict mode with Vue 3 SFC support
- SCSS: Modern compiler API
- Build output: Optimized chunks with content hashing

#### Version Management

- Auto-refresh mechanism when version changes (see main.ts:19-45)
- Version comment in main.ts auto-updated by deploy script
- Current version: 0.3.5

## Development Best Practices

### Core Principles

- **Context7 MCP**: Always use for 3rd party library documentation
- **Critical Thinking**: Don't automatically agree - provide better alternatives when solutions aren't optimal
- **Context Awareness**: Consider recent edits, enhance rather than delete
- **Respect Structure**: Maintain existing file organization unless absolutely necessary
- **Consolidation**: Prefer modifying existing components over creating new ones
- **Single Responsibility**: Keep components focused on one task
- **User Feedback**: Listen and iterate based on specific requirements

### Package Management

- **ALWAYS use `bun` instead of `npm`** for all operations
- Install: `bun add [package]`
- Install dev: `bun add -d [package]`
- Run scripts: `bun run [script]`

### CSS & Theming

#### PrimeVue Theme Variables (REQUIRED)
```scss
// Backgrounds
background: var(--p-content-background);

// Text
color: var(--p-text-color);

// Borders
border-color: var(--p-content-border-color);

// Primary colors
var(--p-primary-color)
var(--p-primary-contrast-color)

// NEVER use --p-surface-card (not valid)
```

#### Tailwind Integration
- Responsive breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Test at: 375px (mobile), 768px (tablet), 1920px (desktop)
- Combine with PrimeVue utilities for spacing and layout
- Use `will-change` for animated elements

### Animation with motion-v

#### Import Pattern
```javascript
import { motion } from "motion-v"  // NOT as Vue plugin
```

#### Component Usage
```vue
<motion.div
  :initial="{ opacity: 0, scale: 0.8, y: 50 }"
  :animate="{ opacity: 1, scale: 1, y: 0 }"
  :whileInView="{ opacity: 1, once: true }"
  :transition="{ 
    type: 'spring', 
    stiffness: 100, 
    damping: 15, 
    mass: 1 
  }"
/>
```

#### Performance Guidelines
- Use transform-based animations (translateY, scale) for 60fps
- Implement `prefers-reduced-motion` support
- Use `delay` for staggered entrance effects

### Vue 3 Composition API

- Composables are NOT singletons - they're smart closures
- Each instance maintains its own state
- Use `<script setup>` syntax for all components
- Leverage TypeScript for type safety

### WebSocket Implementation

- Connection managed globally via composables
- Auto-reconnection built-in
- Heartbeat mechanism prevents timeouts
- Message structure follows defined types in `websocket.types.ts`

### Testing & Verification

- **Always use Playwright MCP** for UI verification
- Test responsive behavior at key breakpoints
- Verify animations and interactions
- Check dark/light theme compatibility

### Game Design Patterns

- Use "enemy" instead of "npc" for consistency
- Match is match regardless of PvP or PvE
- Only difference is endpoint and control mechanism
- Maintain abstraction for flexible game logic

### Component Development Workflow

1. **Check existing components first**
2. **Enhance rather than replace**
3. **Test thoroughly with Playwright**
4. **Iterate based on feedback**
5. **Polish with proper theming**

### Development Environment

- Ask user before starting/stopping dev servers
- Default dev server runs on port 8080
- WebSocket connects to configured server
- Hot reload enabled for rapid development

## Task Master Integration

This project includes Task Master AI for task management. Key commands:

```bash
# View tasks
task-master list
task-master next
task-master show <id>

# Update tasks
task-master set-status --id=<id> --status=done
task-master add-task --prompt="description"
task-master update-task --id=<id> --prompt="changes"
```

See parent `.taskmaster/` directory for full task configuration.

## Common Issues & Solutions

### WebSocket Connection
- Check `VITE_WS_HOST` environment variable
- Verify server is running
- Check browser console for connection errors

### Build Issues
- Run `bun install` to ensure dependencies
- Clear `node_modules` and reinstall if needed
- Check TypeScript errors with `vue-tsc`

### Styling Issues
- Verify PrimeVue theme variables
- Check Tailwind configuration
- Ensure SCSS modern compiler is used

## Important Reminders

- Do what's asked; nothing more, nothing less
- Never create files unless absolutely necessary
- Always prefer editing existing files
- Never proactively create documentation unless requested
- Use Playwright MCP for UI verification
- Always use bun, never npm
- Respect existing patterns and conventions