# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**

- `npm run dev` or `npm run serve` - Start Vite dev server on port 8080

**Build & Deploy:**

- `npm run build` - TypeScript check + Vite production build
- `npm run build:test` - Run test build script
- `npm run build:cleanup` - Clean up build artifacts
- `npm run deploy` - Deploy to GitHub Pages
- `npm run preview` - Preview production build locally

**Code Formatting:**

- `npm run format` or `npm run prettier` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Architecture Overview

This is a Vue 3 + TypeScript + Vite application that serves as a client for a rune dictionary with real-time websocket communication.

### Core Technology Stack

- **Frontend Framework:** Vue 3 with Composition API (`<script setup>`)
- **UI Library:** PrimeVue with Aura theme
- **Styling:** SCSS + Tailwind CSS + PrimeUI
- **State Management:** Pinia with persisted state
- **Routing:** Vue Router
- **Build Tool:** Vite
- **WebSocket:** Custom implementation using `topsyde-utils` library

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
