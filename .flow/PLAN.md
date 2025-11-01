# Combat System Reimplementation - Development Plan

> **📖 Framework Guide**: See [framework/DEVELOPMENT_FRAMEWORK.md](framework/DEVELOPMENT_FRAMEWORK.md) for complete Flow methodology
> **📍 Current Progress**: See [DASHBOARD.md](DASHBOARD.md) for real-time status tracking
> **🎯 Purpose**: Reimagine combat system with match mode, camera controls, arena boundaries, and visual feedback for Vue 3 + Three.js game

**Created**: 2025-01-18
**Version**: V1
**Plan Location**: `.flow/` (managed by Flow framework)

---

## Overview

### Purpose

Rebuild the combat system from the ground up to support a polished match experience with proper camera controls, arena boundaries, and visual feedback. The system must handle state transitions between overworld and match modes, provide a fixed asymmetric camera view similar to Diablo II, and create invisible collision boundaries with visual indicators.

This reimplementation focuses on establishing the foundational infrastructure for combat, ensuring smooth mode transitions, and providing clear visual feedback to players about the match arena boundaries.

### Goals

**Primary Goals**:

- Implement state management system for OVERWORLD ↔ PVE_MATCH transitions
- Create fixed camera system with frozen position during matches (no following, no zoom/rotation)
- Build invisible collision walls with visual border indicators (faint glowing lines)
- Ensure arena boundaries are consistent and frame-independent (fixed size arena)
- Provide smooth scene transitions and cleanup when entering/exiting matches

**Success Criteria**:

- Players can seamlessly enter and exit match mode
- Camera behavior is predictable and consistent (no unexpected movement)
- Arena boundaries are clearly visible through border lines
- Collision walls prevent player escape without visible mesh
- All Three.js objects properly cleaned up on match exit (no memory leaks)
- Border lines disappear completely when returning to overworld

### Scope

**V1 Scope** (Current Session):

- SceneStateService for managing OVERWORLD/PVE_MATCH states with callbacks
- MatchModule to orchestrate match environment spawning/cleanup
- Fixed rectangular arena (40 width x 25 depth) with invisible collision walls
- Faint orange glowing border lines at ground level (40% opacity)
- Diablo II-style asymmetric fixed camera (position offset from center, always looks at arena center)
- Frozen camera system (disable reactive updates, mouse rotation, and zoom during matches)
- Manual cleanup system for border lines in MatchAreaWalls.destroy()
- CollisionComponent support for mesh-less collision via explicit shape parameters

---

## Architecture

### System Context

The combat system follows an event-driven architecture with clear separation between state management (SceneStateService), scene coordination (GameScene), and domain modules (MatchModule). The system uses Vue's reactivity for state changes and Three.js for 3D rendering.

**Components**:

- **SceneStateService**: Manages game state transitions (OVERWORLD ↔ PVE_MATCH) with callback registration system
- **MatchModule**: Orchestrates match environment spawning (walls, camera anchor, grid) and cleanup on state changes
- **MatchAreaWalls**: GameObject prefab that creates 4 invisible collision walls with visual border lines at ground level
- **Camera System**: Composables (useCamera, useCameraController) with freezeReactiveUpdates flag to disable Vue reactivity during matches
- **CollisionComponent**: Supports two modes - mesh-derived collision OR explicit shape parameters (shape + shapeParams with half-extents)
- **CleanupRegistry**: Manages Three.js object disposal and prevents memory leaks

**Key Dependencies**:

- **Three.js 0.180.0**: 3D rendering engine (imperative, not TresJS)
- **Rapier3D WASM**: Physics engine for collision detection
- **Vue 3 Composition API**: Reactivity system for state management
- **Pinia**: State management with persistence

**Reference Implementations**:

- **Existing Ground prefab** (`src/game/prefabs/Ground.ts`): Collision-only GameObject pattern, explicit shape parameters
- **Existing PhysicsService** (`src/game/services/PhysicsService.ts`): registerStatic() API for collision bodies

---

## DO / DON'T Guidelines

**✅ DO**:

- Always freeze camera reactive updates when entering match mode (freezeReactiveUpdates = true)
- Manually clean up border lines in MatchAreaWalls.destroy() to prevent persistence after match
- Use half-extents convention for CollisionComponent shapeParams (divide full dimensions by 2)
- Register all Three.js objects with CleanupRegistry for automatic disposal
- Use fixed arena dimensions (not dynamic based on player-NPC distance)
- Position camera at anchor point but make it look at arena center (separate position vs lookAt)

**❌ DO NOT**:

- Skip cleanup of border lines (they won't be removed automatically by scene-level CleanupRegistry)
- Use reactive camera updates during matches (causes unwanted camera following)
- Make arena size dynamic (must be consistent every time)
- Use full dimensions for shapeParams (always use half-extents to match Rapier convention)
- Enable mouse rotation or zoom during match mode (camera must be completely locked)
- Use changeTarget() for fixed camera positioning (manually set position and lookAt instead)

---

## Notes & Learnings

**Design Decisions**:

- **2025-10-30**: Fixed arena size (40x25) instead of dynamic sizing - ensures consistent gameplay and camera framing
- **2025-10-30**: Rectangular arena instead of circular - simpler collision math (4 walls instead of 16 segments)
- **2025-10-30**: Manual border line cleanup - scene-level CleanupRegistry only runs on full scene destroy, not GameObject destroy
- **2025-10-30**: Half-extents convention for shapeParams - matches Rapier's internal representation, prevents confusion
- **2025-10-30**: Frozen camera system - prevents Vue reactivity from overriding manual camera positioning during matches
- **2025-10-30**: Arena center at NPC position - provides consistent anchor point for camera and walls

**Technical Discoveries**:

- TransformComponent.position/rotation are Vector3/Euler objects, not arrays - must use getPositionArray() / getRotationArray()
- GameObject.destroy() only calls component destroy methods, doesn't trigger scene-level CleanupRegistry
- Camera watchEffect must check freezeReactiveUpdates flag to prevent reactive updates during matches
- GameScene.update() must skip camera.update() when frozen to prevent following behavior
- Border lines registered with scene CleanupRegistry persist after GameObject destroy (need manual cleanup)

**Performance**:

- Border line creation: ~5ms for 4 lines (minimal overhead)
- Arena collision registration: ~10ms for 4 static bodies
- Camera freeze/unfreeze: <1ms (instant state change)

**References**:

- Flow Framework: `.flow/framework/DEVELOPMENT_FRAMEWORK.md`
- Example Dashboard: `.flow/framework/examples/DASHBOARD.md`
- Example Task Files: `.flow/framework/examples/phase-2/task-3.md`
- Project CLAUDE.md: `CLAUDE.md` and `client_rune_dictionary/CLAUDE.md`

---

## Development Phases

### Phase 3: Bug Fixes ⏳

**Strategy**: Identify and resolve critical bugs that block feature development or break existing functionality
**Goal**: Resolve critical bugs blocking feature development

**Tasks**: See [phase-3/](phase-3/) directory for detailed task files
