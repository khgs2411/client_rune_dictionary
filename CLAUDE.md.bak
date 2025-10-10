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

### Frontend Stack
- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety
- **Vite** as build tool and dev server
- **Pinia** for state management with persistence
- **Vue Router** with authentication guards

### UI Libraries & Styling
- **PrimeVue 4.3.2** as primary component library with Aura theme
- **Reka UI** DEPRECATED DO NOT USE REPLACE WITH PRIMEVUE NATIVE ELEMENTS!!! ~for additional components~
- **Tailwind CSS 4.0** DEPRECATED DO NOT USE REPLACE WITH PRIMEVUE NATIVE ELEMENTS for utility-first styling
- **Custom Centralized Color System** (see COLOR_SYSTEM.md)

### Key Architectural Patterns

#### Centralized Color System
The application uses a **single source of truth** color system (`src/utils/color-system.ts`):
- Manages themes for PrimeVue and custom components
- 23 color themes with light/dark modes each
- All colors must use CSS variables: `var(--primary)`, `var(--background)`, etc.
- Never hardcode colors or use library-specific color functions

#### State Management (Pinia Stores)
- **Auth Store**: User authentication, WebSocket client data, localStorage persistence
- **Settings Store**: Theme preferences, dark mode, fully persisted
- **Misc Store**: Toast notifications (transient)
- **Match Store**: Game match state and WebSocket communication
- **Damage Calculator Store**: Combat calculation state

#### Authentication Flow
1. Login credentials → Auth API call → Handshake API → WebSocket client setup
2. Authentication state persisted in localStorage
3. Router guards protect authenticated routes
4. Automatic redirects based on auth status

### Directory Structure

```
src/
├── api/           # API layer (auth, app, match endpoints)
├── components/    # Vue components
│   ├── ui/        # Reusable UI components (removed - using PrimeVue directly)
│   └── demo/      # Demo/showcase components
├── composables/   # Vue composables
│   └── animation/ # Animation-related composables
├── stores/        # Pinia stores
├── utils/         # Utility functions
│   ├── color-system.ts  # Centralized color management
│   └── theme-utils.ts   # Theme utilities
├── views/         # Page components (Login, Dictionary, Match, etc.)
├── router/        # Vue Router configuration
└── styles/        # Global styles and SCSS
```

### Environment & Configuration

#### Environment Variables
- `VITE_API_KEY`: Authentication API key (required)
- Development server runs on port 8080

#### Build Configuration
- **Base path**: `/client_rune_dictionary/` for production
- **Assets**: Chunked output with hash-based filenames
- **Source maps**: Disabled in production
- **Path alias**: `@` → `./src`

### Development Guidelines

#### Component Patterns
- Use Composition API with `<script setup>`
- Follow existing component structure in `src/components/ui/`
- Import UI components from established libraries before creating custom ones
- All colors must use the centralized color system

#### Styling Approach
- Tailwind CSS for utility classes
- SCSS for complex styling (`src/assets/css/style.scss`)
- CSS variables for all color references
- PrimeVue theming integration through color system

#### State Management
- Use appropriate Pinia store for state
- Persist only necessary state (auth, settings)
- Use composables for reusable logic
- Maintain clear separation between stores

### Testing & Quality

- **No TypeScript checking required** - ask user to validate files
- Code formatting via Prettier with `.prettierrc` configuration
- Use `bun` instead of npm for all operations
- Version management with automatic cache clearing on updates

### Special Features

#### Animation System
- Composables in `src/composables/animation/`
- Performance monitoring and reduced motion support
- Sparkle effects and animation showcases

#### WebSocket Integration
- Real-time match communication via Match store
- Client data management through Auth store
- Automatic connection handling

#### Damage Calculation
- Complex combat mechanics with multiple formulas
- Dedicated store for calculation state
- Integration with match system