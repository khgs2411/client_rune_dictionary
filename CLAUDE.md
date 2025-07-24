# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**

- `bun run dev` or `bun run serve` - Start Vite dev server on port 8080

**Build & Deploy:**

- `bun run build` - TypeScript check + Vite production build
- `bun run build:test` - Run test build script
- `bun run build:cleanup` - Clean up build artifacts
- `bun run deploy` - Deploy to GitHub Pages
- `bun run preview` - Preview production build locally

**Code Formatting:**

- `bun run format` or `bun run prettier` - Format code with Prettier
- `bun run format:check` - Check code formatting

**UI Testing:**

- Use Playwright MCP for visual verification of UI changes

## Architecture Overview

This is a Vue 3 + TypeScript + Vite application that serves as a client for a rune dictionary with real-time websocket communication.

### Core Technology Stack

- **Frontend Framework:** Vue 3 with Composition API (`<script setup>`)
- **UI Library:** PrimeVue with Aura theme
- **Styling:** SCSS + Tailwind CSS + PrimeUI
- **Animation:** v-motion for complex animations
- **State Management:** Pinia with persisted state
- **Routing:** Vue Router
- **Build Tool:** Vite
- **WebSocket:** Custom implementation using `topsyde-utils` library
- **Package Manager:** Bun (use instead of npm)

### Application Structure

**Key Application Flow:**

1. Users start at login (`/login`) - default route redirect
2. After authentication, access main dictionary (`/app`) or match view (`/match`)
3. WebSocket connection established for all routes except login
4. Real-time chat and game communication via WebSocket

**State Management:**

- `authStore` - User authentication, client data, authorization status
- `settingsStore` - User preferences and configuration
- `miscStore` - General application state

**WebSocket Architecture:**

- `useWebsocketInterface` - Core WebSocket connection handling
- `useWebsocketLogic` - Message processing and business logic
- `useWSM` - WebSocket message utilities
- Auto-reconnection with heartbeat (20s ping/pong intervals)
- Structured message handling for chat and game actions

**Component Organization:**

- `views/` - Main route components (Dictionary, Login, Match)
- `components/application/` - Core app components (Chat, WebsocketConnection)
- `components/layout/` - Layout structure (Layout, Menu, Settings)
- `composables/` - Reusable composition functions for auth, websockets, utilities

### Configuration Notes

**Environment Variables:**

- `VITE_WS_HOST` - WebSocket server URL (defaults to wss://topsyde-gaming.duckdns.org:3000)
- `VITE_API_KEY` - API authentication key

**Version Management:**

- App includes auto-refresh mechanism when version changes (see main.ts:19-45)
- Version comment in main.ts is auto-updated by deploy script

**Build Configuration:**

- Base path changes between dev (`/`) and production (`/client_rune_dictionary/`)
- WebSocket proxy at `/ws` for development
- TypeScript strict mode with Vue 3 SFC support

## Development Best Practices

### General Behavior
- **Don't always agree**: If a solution is not good, do not agree with it. Instead, provide a better alternative or ask for clarification on the requirements
- **Context Awareness**: Always consider the context of the code being modified. If a file has been recently edited, focus on enhancing or fixing that code rather than suggesting deletions or major rewrites
- **Avoid Deletions**: Do not suggest code that has been deleted. Focus on enhancing existing code or adding new features without removing functionality
- **Respect Existing Structure**: Maintain the existing structure and organization of files. Do not suggest moving files or changing their locations unless absolutely necessary

### Game Design & Abstraction
- Changed phrasing from "npc" to "enemy" - recognizing that in game mechanics, a match is a match, and the opponent is the opponent regardless of whether it's PvP or PvE
- The key difference is only the endpoint accessed for a match and who controls the target
- This layer of abstraction is important for maintaining consistent game logic and design principles

### CSS & Design Principles
- Use `background: var(--p-content-background)` and `color: var(--p-text-color)` as standard for theming
- Always use PrimeVue theme variables for consistent theming across components
- NEVER use `--p-surface-card` for backgrounds, as it is not a valid color from the theme

### Vue Composition Insights
- Composables are not singleton in Vue3, they work as reference to the instance of the composable, same as a class
- They are basically a smart javascript closure

### Tailwind CSS Best Practices
- Use responsive breakpoints: `md:`, `lg:` prefixes for responsive design (tested at 375px, 768px, 1920px)
- Combine with custom CSS for complex animations beyond Tailwind's built-in classes
- Use `will-change` property for elements that will animate to optimize rendering

### v-motion Animation Implementation
- **Import Pattern**: Use `import { motion } from "motion-v"` - NOT as a Vue plugin
- **Component Usage**: Replace HTML elements with `<motion.div>`, `<motion.h1>`, etc.
- **Animation Properties**:
  - `:initial` - Starting state (opacity: 0, scale: 0.8, y: 50)
  - `:animate` - End state (opacity: 1, scale: 1, y: 0)
  - `:whileInView` - Scroll-triggered animations with `{ once: true }`
  - `:transition` - Spring physics: `{ type: 'spring', stiffness: 100, damping: 15, mass: 1 }`
- **Performance**: Use transform-based animations (translateY, scale) for 60fps performance
- **Accessibility**: Implement `prefers-reduced-motion` support with reduced animation durations
- **Staggered Animations**: Use `delay` property for sequential entrance effects

### Component Modification Best Practices
- **Consolidation Over Creation**: When implementing new features, always prefer modifying existing components rather than creating new ones. This maintains consistency and prevents component proliferation
- **Single Responsibility Principle**: Each component should have a single responsibility. If a component is doing too much, consider breaking it down into smaller, reusable components. This is more important than Consolidation
- **User Feedback Integration**: Listen carefully to user feedback and iterate based on their specific requirements. If a solution is "NOT good", understand why and pivot accordingly
- **Thorough Testing**: Always test functionality comprehensively:
  - Use Playwright MCP to verify UI changes visually
  - Test all interactive features (drag, resize, collapse/expand)
  - Simulate user interactions programmatically to ensure features work
- **Incremental Problem Solving**: Address issues one at a time:
  - First ensure basic functionality works
  - Then refine based on user feedback
  - Finally, polish with proper styling and behavior

### Development Environment Management
- If you need to start, restart or close the client or server dev environment, ask the user

### PrimeVue Integration Lessons
- PrimeVue CSS Variables: Use `--p-content-background` and `--p-text-color` for consistent theming
- Component styling: PrimeVue components work well with Tailwind utilities for spacing, colors, and layout
- Dark mode: PrimeVue's built-in dark mode variables integrate seamlessly with custom CSS
