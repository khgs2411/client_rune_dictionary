# Combat System Reimplementation - Development Plan

> **📖 Framework Guide**: See `.flow/DEVELOPMENT_FRAMEWORK.md` for complete workflow patterns and conventions

**Created**: 2025-10-19
**Version**: V1
**Status**: Phase 2 - Match Instantiation & Initialization ⏳
**Last Updated**: 2025-10-19

---

## Overview

### Purpose

Reimplement the combat/match system from the deprecated 2D PrimeVue application into the new 3D Three.js architecture. The system is a **server-authoritative turn-based/ATB hybrid** with real-time WebSocket communication for multiplayer combat.

### Goals

1. **Preserve Core Logic**: Maintain the same combat flow, state transitions, and WebSocket event handling from the old system
2. **Modernize Architecture**: Adapt to new Three.js game engine using Module pattern, GameObject/Component pattern, and modern composables
3. **Enhance Visualization**: Create 3D battle arena with character meshes, health indicators, damage effects, and ATB visualizations
4. **Mobile-First**: Ensure touch-friendly action buttons and responsive UI for mobile devices
5. **Maintain Multiplayer**: Keep server-authoritative design with WebSocket event coordination via RxJS

### Scope

**In Scope (V1)**:
- PvE combat (player vs NPC)
- Real-time WebSocket event handling for 8 core event types
- 3D battle visualization (character meshes, health bars, floating damage numbers)
- Action panel with attack/defend/special abilities
- Turn timer with client-side interpolation
- Combat log for action history
- Match result screen with statistics
- Reconnection support via persisted Pinia state

**Out of Scope (V2/Later)**:
- PvP matchmaking and combat
- Advanced visual effects (particle systems, screen shake, complex animations)
- Item system integration
- Skill/ability customization UI
- Character progression and leveling
- Tournament/ranked modes
- Spectator mode

### Success Criteria

- Player can initiate PvE match via REST API
- Combat flow matches old system: turn start → action selection → damage calculation → health update → turn end
- WebSocket events properly routed and update Pinia state
- 3D battle arena displays characters, health bars, and damage numbers
- Turn timer smoothly counts down between server updates
- Match completion shows statistics and returns player to lobby
- Mobile-responsive action buttons and UI
- Graceful disconnect/reconnect handling

---

## 📋 Progress Dashboard

**Last Updated**: 2025-10-25

**Recent Changes**:
- 🚧 Started implementation of Iteration 0 - Game Mode Controls & Visibility Management (2025-10-25)
- 🎨 Completed brainstorming for Iteration 0 - 6 subjects resolved (2025-10-25)
- 📦 Archived Phase 2 Task 1 (5 iterations) to `.flow/ARCHIVE.md` (2025-10-25)
- 📦 Archived Phase 1 (2 tasks) to `.flow/ARCHIVE.md` (2025-10-25)
- 🚧 Started Task 2: Match UI Components (2025-10-25)
- 📝 Moved Iteration 4 from Task 1 to Task 2 as Iteration 0 (Game Mode Controls & Camera) (2025-10-25)

**Current Work**:
- **Phase**: [Phase 2 - Match Instantiation & Initialization](#phase-2-match-instantiation--initialization-) 🚧 IMPLEMENTING
- **Task**: [Task 2 - Match UI Components](#task-2-match-ui-components-) 🚧 IN PROGRESS
- **Iteration**: [Iteration 0 - Game Mode Controls & Visibility Management](#iteration-0-game-mode-controls--visibility-management-)

**Completion Status**:
- Phase 1: ✅ 100% | Phase 2 Task 1: ✅ 100% (5/5 iterations) | Phase 2 Task 2: 🚧 0% (0/4 iterations) | Phases 3-18: ⏳ 0%

**Archived Content**:
- Phase 1 (2 tasks) → See `.flow/ARCHIVE.md`
- Phase 2 Task 1 (5 iterations) → See `.flow/ARCHIVE.md`

**Progress Overview**:
- 🚧 **Phase 2**: Match Instantiation & Initialization ← **YOU ARE HERE**
  - 🚧 Task 2: Match UI Components (0/4 iterations) ← **YOU ARE HERE**
    - 🚧 Iteration 0: Game Mode Controls & Visibility Management ← **IMPLEMENTING NOW**
    - ⏳ Iteration 1: Match.vue State Machine
    - ⏳ Iteration 2: WebSocket Event Handler
    - ⏳ Iteration 3: Error Handling UI
- ⏳ **Phase 3**: PvE Match Flow
- ⏳ **Phase 4**: Match Lifecycle Management
- ⏳ **Phase 5**: Aborting/Leaving a Match
- ⏳ **Phase 6**: Match Data & State Persistence
- ⏳ **Phase 7**: WebSocket Event Registration
- ⏳ **Phase 8**: Turn-Based Combat Flow
- ⏳ **Phase 9**: Combat Actions & Abilities
- ⏳ **Phase 10**: Damage Calculation & Health Updates
- ⏳ **Phase 11**: Turn Timer System
- ⏳ **Phase 12**: Match Victory & Defeat Conditions
- ⏳ **Phase 13**: Match Result & Statistics
- ⏳ **Phase 14**: Combat Visualization (3D)
- ⏳ **Phase 15**: Real-time State Synchronization
- ⏳ **Phase 16**: Error Handling & Edge Cases
- ⏳ **Phase 17**: Mobile & Responsive Considerations
- ⏳ **Phase 18**: Integration & Testing

**V1 Target**: Fully functional PvE combat with 3D visualization

**V2 Deferred**: PvP, advanced VFX, item integration, character customization

---

## Architecture

### High-Level Design

The combat system follows a **thin client, server-authoritative** model:

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vue 3)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   Match.vue      │────────▶│  BattleArena.vue │            │
│  │  State Machine   │         │  3D Visualization│            │
│  │  (View Layer)    │         │  (Three.js)      │            │
│  └────────┬─────────┘         └──────────────────┘            │
│           │                                                     │
│           │ Watches Pinia State                                │
│           │                                                     │
│  ┌────────▼─────────────────────────────────────┐             │
│  │         match.store.ts (Pinia)               │             │
│  │  - GameState (health, turn, action count)    │             │
│  │  - MatchResult (post-match stats)            │             │
│  │  - TimerInfo (turn duration config)          │             │
│  │  - Persisted for reconnection support        │             │
│  └────────▲─────────────────────────────────────┘             │
│           │                                                     │
│           │ Updates State                                      │
│           │                                                     │
│  ┌────────┴─────────────────────────────────────┐             │
│  │  useMatchWebsocketEventHandler.ts            │             │
│  │  Routes 8 event types → Pinia + RxJS         │             │
│  └────────▲─────────────────────────────────────┘             │
│           │                                                     │
│           │ Receives Events                                    │
│           │                                                     │
│  ┌────────┴─────────────────────────────────────┐             │
│  │       websocket.store.ts (Pinia)             │             │
│  │  WebSocket connection management             │             │
│  └────────▲─────────────────────────────────────┘             │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ WebSocket (wss://topsyde-gaming.duckdns.org:3000)
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    BACKEND (Matchmaking Server)                 │
├─────────────────────────────────────────────────────────────────┤
│  - Server-authoritative combat logic                            │
│  - 6 damage formulas (OSRS, Linear, Power, Difference, Speed,  │
│    Tempo)                                                        │
│  - ATB (Active Time Battle) system with 100ms ticks            │
│  - MongoDB persistence for match state                          │
│  - WebSocket broadcasting (turn events, damage, health, timer)  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. State Management (Pinia Stores)

**match.store.ts** (NEW - to be created):
- `GameState`: Current combat state (player/NPC health, turn info, action count, ATB readiness)
- `MatchResult`: Post-match statistics (winner, turns, damage dealt/received)
- `TimerInfo`: Turn duration configuration from server
- Persisted via `pinia-plugin-persistedstate` for reconnection support

**websocket.store.ts** (EXISTS):
- WebSocket connection management
- Client data storage (username, clientId)
- Connection state (connected, disconnected, error)

#### 2. WebSocket Event Handler (Composable)

**useMatchWebsocketEventHandler.ts** (NEW - to be created):

Routes 8 event types from server → Pinia state + RxJS events:

| Event Type | Source | Action | Updates |
|------------|--------|--------|---------|
| `match.created` | Server | Initialize match state | GameState (players, NPCs, initial health) |
| `turn.start` | Server | New turn begins | GameState (currentTurn, isPlayerTurn, availableActions) |
| `turn.end` | Server | Turn complete | GameState (reset action state) |
| `damage.dealt` | Server | Damage calculation result | Trigger floating damage numbers in UI |
| `health.update` | Server | Health changed | GameState (player/NPC health) |
| `match.ended` | Server | Combat complete | MatchResult (winner, stats), transition to result screen |
| `action.invalid` | Server | Action rejected | Show error message to player |
| `timer.update` | Server | Turn timer sync | TimerInfo (timeRemaining, turnDuration) |

#### 3. Match Orchestration (Composable)

**useMatch.ts** (NEW - to be created):

High-level match lifecycle management:
- `createPveMatch()`: REST API call to `/match/pve` endpoint
- `leaveMatch()`: Gracefully disconnect and cleanup
- `sendAction(actionType, targetId)`: Emit RxJS event to server via WebSocket
- `resetMatchState()`: Clear Pinia state after match ends
- Coordinates with event handler and Pinia store

#### 4. 3D Battle Arena (Three.js Scene)

**BattleArenaScene** (NEW - extends `GameScene`):

3D scene for combat visualization:
- Two character meshes (player on left, NPC on right)
- Health bar meshes above characters (3D planes with dynamic width)
- ATB readiness indicator bars (optional, cosmetic)
- Floating damage number system (3D TextGeometry or HTML overlays)
- Camera positioned to frame both combatants
- Lighting for dramatic effect

**Modules**:
- `CombatantModule`: Manages player/NPC character meshes
- `HealthBarModule`: Dynamic health bar visualization synced with Pinia state
- `FloatingTextModule`: Damage numbers that rise and fade
- `CombatCameraModule`: Fixed camera framing both characters

#### 5. UI Components (Vue)

**Match.vue** (NEW - to be created):

State machine view layer with 3 states:
- `LOBBY`: Waiting for match (shows "Find Match" button)
- `IN_PROGRESS`: Active combat (renders BattleArena + GameActions + TurnTimer + GameLog)
- `FINISHED`: Post-match (renders MatchResult)

Watches `match.store.ts` for state transitions.

**BattleArena.vue** (NEW - to be created):

3D visualization component:
- Mounts BattleArenaScene into canvas
- Watches Pinia state for health changes → triggers floating damage numbers
- Handles engine lifecycle (start, update, cleanup)

**GameActions.vue** (NEW - to be created):

Action button panel:
- Attack, Defend, Special Ability buttons
- Enabled only during player's turn (`isPlayerTurn === true`)
- Mobile-responsive (collapsible on small screens)
- Emits RxJS events via `useMatch.sendAction()`

**TurnTimer.vue** (NEW - to be created):

Client-side smooth countdown timer:
- Receives server updates every 250ms via `timer.update` event
- Client interpolates smoothly between updates (eliminates jitter)
- Visual progress bar + numeric countdown
- Pauses when not player's turn

**MatchResult.vue** (NEW - to be created):

Post-match statistics screen:
- Winner announcement
- Damage dealt vs received
- Turns survived
- Actions taken
- "Return to Lobby" button

**GameLog.vue** (NEW - to be created):

Combat event log:
- Scrollable list of combat actions (attacks, damage, turn changes)
- Auto-scrolls to bottom on new events
- Mobile-friendly (collapsible)

### Data Flow

#### Combat Flow (End-to-End)

```
1. Player clicks "Find PvE Match"
   → useMatch.createPveMatch() (REST API call)
   → Server creates match, connects WebSocket
   → Server broadcasts match.created event

2. WebSocket handler receives match.created
   → Updates match.store.ts (GameState initialized)
   → RxJS emits event
   → Match.vue transitions to IN_PROGRESS state

3. Server broadcasts turn.start
   → WebSocket handler updates match.store.ts (isPlayerTurn = true)
   → GameActions buttons enabled

4. Player clicks "Attack" button
   → GameActions.vue calls useMatch.sendAction('attack', npcId)
   → RxJS event sent to server via WebSocket

5. Server calculates damage
   → Server broadcasts damage.dealt + health.update
   → WebSocket handler updates match.store.ts (NPC health reduced)
   → BattleArena.vue watches health change → triggers floating damage number

6. Server broadcasts turn.end
   → WebSocket handler updates match.store.ts (isPlayerTurn = false)
   → GameActions buttons disabled

7. Cycle repeats until health reaches 0

8. Server broadcasts match.ended
   → WebSocket handler updates match.store.ts (MatchResult populated)
   → Match.vue transitions to FINISHED state
   → MatchResult.vue displays stats
```

#### Timer Interpolation Flow

```
1. Server broadcasts timer.update (every 250ms)
   → WebSocket handler updates match.store.ts (TimerInfo)

2. TurnTimer.vue watches TimerInfo
   → Client calculates elapsed time since last server update
   → Smoothly counts down using requestAnimationFrame
   → When timer reaches 0, expects turn.end event from server
```

### Technology Stack

- **Frontend**: Vue 3 (Composition API), TypeScript, Vite 7
- **3D Rendering**: Three.js 0.180.0 (imperative, not TresJS)
- **State Management**: Pinia with `pinia-plugin-persistedstate`
- **Realtime Communication**: WebSocket via `websocket.store.ts`
- **Event Coordination**: RxJS observables from `topsyde-utils`
- **HTTP API**: Axios for REST calls (`/match/pve`, `/match/leave`)
- **UI Styling**: Reka UI + Tailwind CSS 4.1
- **Backend**: Bun + topsyde-utils framework (matchmaking server)

### Design Decisions from Old System

1. **Server-Authoritative**: All combat logic server-side (prevents cheating, authoritative source of truth)
2. **Event-Driven**: WebSocket events trigger state updates, UI watches state (reactive chain)
3. **State Isolation**: Pinia for persistent state, local component state for animations
4. **Timer Interpolation**: Client smooths between server updates (better UX, no jitter)
5. **ATB Visualization**: Cosmetic readiness bars, actual logic is server-side turn-based
6. **Persistence**: Pinia state persisted for reconnection support (localStorage)
7. **Thin Client**: Frontend is display layer only, no combat calculations

---

## Testing Strategy

### Methodology

**Primary**: Manual integration testing with iterative code review
- User will manually test features as they are implemented
- User will review code iteratively during development
- Start matchmaking server (`bun run serve` in `server_rune_matchmaking`)
- Start frontend dev server (`bun run dev` in `client_rune_dictionary`)
- Test full combat flow from match creation to completion

**Focus**: Integration over unit tests (game development prioritizes end-to-end flow)
- No automated tests for this phase
- Iterative manual verification by user

### Test Files Location

- `src/composables/__test__/` - Composable unit tests (useMatch, useMatchWebsocketEventHandler)
- Manual testing via development server (most common)

### Naming Convention

- `{composableName}.test.ts` (e.g., `useMatch.test.ts`, `useMatchWebsocketEventHandler.test.ts`)

### When to Create

- For event handler logic (critical path, complex routing)
- For timer interpolation math (verify correctness)
- Skip tests for simple UI components (manually verify instead)

### Tooling

- **Test Runner**: Bun's built-in test runner (`bun test`)
- **Assertions**: Bun's expect API
- **Mocking**: Manual mocks for WebSocket/Pinia (no library needed)

---

## Development Plan

### Phase 2: Match Instantiation & Initialization 🎨

**Status**: READY FOR IMPLEMENTATION (Brainstorming complete, pre-implementation tasks done)

**Purpose**: Understand and implement how matches are created and initialized

---

### **Brainstorming Session - Match Instantiation & Initialization**

**Focus**: Design the client-side architecture for creating and initializing matches based on the deprecated system analysis

**Subjects to Discuss** (tackle one at a time):

1. ✅ **Match Request Flow** - How does a player request a new match? What UI triggers it? What WebSocket event is sent?
2. ✅ **Match Creation Data** - What data is needed to create a match? (character selection, game mode, difficulty, etc.)
3. ✅ **Initial Match State** - What is the initial state when a match starts? What data structures need to be initialized?
4. ✅ **Match Creation Confirmation** - How does the client know a match was successfully created? What WebSocket events signal success/failure?

**Resolved Subjects**:

---

### ✅ Subject 1: Match Request Flow

**Decision**:

The match request flow follows a **REST API → WebSocket confirmation** pattern:

1. **UI Trigger**: Match.vue in `LOBBY` state displays "Find PvE Match" button
2. **API Call**: Button click triggers POST request to `/match/pve` endpoint (Axios via REST API)
3. **Server Processing**: Backend creates match instance and establishes WebSocket connection
4. **Confirmation**: Server broadcasts `match.created` WebSocket event with match data
5. **State Transition**: WebSocket event handler updates Pinia store → Match.vue transitions to `IN_PROGRESS` state

**Key Characteristics**:
- **Hybrid approach**: REST for creation (idempotent, easy error handling), WebSocket for real-time updates
- **Server-authoritative**: Backend controls match creation and broadcasts confirmation
- **Event-driven state**: `match.created` event triggers UI state machine transition

**Resolution Type**: B (Immediate Documentation)

**Rationale**: This is an architectural pattern confirmation. The flow is already documented in the Architecture section (lines 271-279). No code needs to be written yet - we're establishing the design pattern that will guide implementation in future iterations.

**References**:
- Architecture → Combat Flow (lines 271-279)
- Architecture → Key Components → Match.vue (lines 218-225)
- Backend `/match/pve` endpoint confirmed available in server_rune_matchmaking workspace

---

### ✅ Subject 2: Match Creation Data

**Decision**:

**V1 uses a systems-first, minimal data approach** - focusing on combat infrastructure, not RPG progression.

**Match Creation Request**:
```typescript
POST /match/pve
Body: {
  whoami: {
    id: string,      // From websocket.store.clientId
    name: string     // From websocket.store.username
  }
}
```

**What Client Provides**:
- Player identity only (`whoami` object)
- No character stats, equipment, or customization
- No difficulty selection or NPC choice

**What Server Generates** (per match.service.ts:28-37):
- Player combatant with **randomly generated stats** (via `MatchParticipant.FromEntity()`)
- NPC combatant with **randomly generated stats** (via `NPCManager.GenerateMatchParticipant({})`)
- Match instance, WebSocket channel, timer configuration
- **No persistence**: Stats generated fresh each match, discarded after

**V1 Philosophy**:
- **Systems-first, not gameplay-first**: Build combat mechanics infrastructure before RPG content layer
- **Intentionally shallow**: Random stats, no progression, no rewards
- **Infrastructure validation**: Proves WebSocket flow, state sync, 3D visualization work correctly
- **Content deferred**: Persistent characters, overworld NPCs, progression, rewards come later

**Future Enhancements** (when adding RPG layer):
- Persistent character stats and equipment
- Overworld NPCs to interact with and challenge
- Match rewards (XP, gold, items)
- NPC variety and difficulty scaling

**Resolution Type**: B (Immediate Documentation)

**Rationale**: This confirms the minimal data contract for V1. Backend already implements this pattern (match.controller.ts:41-72). No code changes needed - we're documenting the existing design and explicitly separating systems development from content development.

**References**:
- Backend: `server_rune_matchmaking/src/components/match/match.controller.ts` (pve method, lines 41-72)
- Backend: `server_rune_matchmaking/src/components/match/match.service.ts` (createPVE method, lines 28-37)
- WebSocket store for player identity: `websocket.store.ts` (clientId, username)

---

### ✅ Subject 3: Initial Match State

**Decision**:

**Initial match state will be delivered via HTTP response** (not WebSocket) to avoid race conditions and guarantee delivery.

**Revised Backend Interface** (to be implemented):

```typescript
POST /match/pve → HTTP Response
{
  success: true,
  data: {
    matchId: string,
    channelId: string,
    channelName: string,

    state: {
      player: {
        entityId: string,
        name: string,
        health: number,
        maxHealth: number,
        stats: {
          attack: number,
          defense: number,
          speed: number,
          // Additional stats as needed
        }
      },

      npc: {
        entityId: string,
        name: string,
        health: number,
        maxHealth: number,
        stats: {
          attack: number,
          defense: number,
          speed: number,
        }
      },

      turn: {
        number: 1,                    // Always starts at 1
        currentEntityId: string,      // Who goes first
        isPlayerTurn: boolean         // Convenience flag
      },

      atb: {
        playerReadiness: 0,           // Initial readiness (0-100 or 0-1000)
        npcReadiness: 0
      },

      timer: {
        duration: number,             // ms per turn
        warningThreshold: number,     // % threshold for warning (e.g., 80)
        fallbackAction: 'pass' | 'skip'  // Action on timeout
      }
    }
  }
}
```

**Client State Structure** (match.store.ts):

```typescript
{
  // Match identifiers
  currentMatchId: string | null,
  currentChannelId: string | null,
  channelName: string | null,

  // UI state
  matchState: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED',
  isConnectedToMatch: boolean,

  // Game state (from HTTP response)
  gameState: {
    player: PlayerParticipant,
    npc: NPCParticipant,
    turn: TurnState,
    atb: ATBState,
    timer: TimerConfig
  } | null,

  // Match result (populated on MATCH_END event)
  matchResult: MatchResult | null
}
```

**Why HTTP Response over WebSocket?**

1. ✅ **Guaranteed delivery** - HTTP response is synchronous, no missed events
2. ✅ **No race conditions** - State available immediately when POST completes
3. ✅ **Simple reconnection** - Client stores matchId, can rejoin if disconnected
4. ✅ **RESTful design** - Match creation returns the created resource
5. ✅ **WebSocket for updates only** - Real-time events (TURN_START, HEALTH_UPDATE, DAMAGE_DEALT, ATB_TICK, MATCH_END)

**Named Structure (player/npc) vs Array:**
- Using named `player`/`npc` structure for PvE clarity
- Server-authoritative: client uses exactly what backend provides
- Extensible: easy to add fields (buffs, status effects, equipment) later

**ATB-Only Design:**
- No `combatMode` field - ATB is the only mode
- ATB readiness included from initial state (both start at 0)
- Round-robin completely removed from design

**Resolution Type**: B (Immediate Documentation)

**Rationale**: This defines the ideal initial state interface. Backend needs to be updated to return this structure in HTTP response. This is an architectural decision that prevents race conditions and simplifies client state management.

**Action Required**: Backend `/match/pve` endpoint needs refactoring to return full state in HTTP response instead of minimal data.

**References**:
- Current backend: `server_rune_matchmaking/src/components/match/match.controller.ts` (lines 41-72)
- Backend types: `server_rune_matchmaking/src/domains/match/match.types.ts`
- Deprecated frontend store structure: `src_deprecated/stores/match.store.ts`

---

### ✅ Subject 4: Match Creation Confirmation

**Decision**:

**Dual-signal confirmation approach** - HTTP response is primary, WebSocket event is secondary.

**Primary Confirmation: HTTP Response**

```typescript
POST /match/pve → 200 OK
{
  success: true,
  data: {
    matchId: string,
    channelId: string,
    channelName: string,
    state: { /* full initial state */ }
  }
}
```

**Client knows match created successfully when:**
- ✅ HTTP status `200 OK`
- ✅ Response body has `success: true`
- ✅ `matchId` is present (valid UUID)
- ✅ `state` object is populated with player/npc/turn/atb/timer data

**Secondary Confirmation: WebSocket Event**

```typescript
WebSocket: 'match created'
{
  matchId: string,
  channelName: string
}
```

**This signals:**
- ✅ WebSocket channel is established and ready
- ✅ Client can now send/receive real-time events
- ✅ Match is ready for gameplay

**Error Handling:**

```typescript
// HTTP Error Response
POST /match/pve → 400/500
{
  success: false,
  error: {
    code: string,              // e.g., 'MATCH_CREATION_FAILED'
    message: string,           // Human-readable error
    details?: any              // Optional error context
  }
}
```

**Client Error Handling:**
- ❌ HTTP 4xx/5xx → Show error message, remain in LOBBY state
- ❌ `success: false` → Parse error.message, display to user
- ❌ Missing `matchId` → Treat as failed creation
- ❌ WebSocket timeout (no 'match created' after 5s) → Show reconnect option

**State Transition Flow:**

```
1. User clicks "Find PvE Match"
   → matchState = 'LOBBY'
   → isConnectedToMatch = false
   → Show loading spinner

2. POST /match/pve sent

3a. Success Path: HTTP 200 OK received
   → Populate gameState from response.data.state
   → matchState = 'IN_PROGRESS' (tentative)
   → isConnectedToMatch = false (waiting for WS confirmation)

3b. Error Path: HTTP 4xx/5xx received
   → matchState = 'LOBBY'
   → Show error toast/message
   → Stop here (no match created)

4. WebSocket 'match created' received
   → isConnectedToMatch = true
   → matchState = 'IN_PROGRESS' (confirmed)
   → Match.vue renders BattleArena + GameActions

5. First TURN_START event
   → Gameplay begins
```

**Why Dual Signals?**

1. **HTTP = Data Authority**: Contains full state, guaranteed delivery, synchronous
2. **WebSocket = Channel Readiness**: Confirms real-time connection established
3. **Graceful Degradation**: Client has full state even if WebSocket is delayed/missed
4. **Clear Error Path**: HTTP errors prevent state population, easy to handle

**Resolution Type**: C (Auto-Resolved)

**Rationale**: This subject was answered by decisions in Subject 1 (Match Request Flow) and Subject 3 (Initial Match State). The confirmation mechanism is a natural consequence of:
- HTTP response returning full state (Subject 3)
- WebSocket event for channel acknowledgment (Subject 1)

No new design decisions needed - just documenting the confirmation flow.

**References**:
- Subject 1: Match Request Flow (HTTP + WebSocket pattern)
- Subject 3: Initial Match State (HTTP response structure)
- Backend: `server_rune_matchmaking/src/components/match/match.controller.ts` (lines 57, 61-68)

---

### **Pre-Implementation Tasks:**

#### ✅ Task 1: Add "After Action" Hook to topsyde-utils (COMPLETED)

**Objective**: Implement after-response lifecycle hook in topsyde-utils Application framework to allow WebSocket notifications AFTER HTTP response is sent

**Why This Blocked Frontend**: Current implementation sent WebSocket events BEFORE HTTP response returns, creating race condition where client might receive WebSocket confirmation before HTTP response completes. This violated the dual-signal pattern where HTTP is primary (guaranteed) and WebSocket is secondary (real-time notification).

**Implementation Approach**:

1. **Extended `I_ApplicationResponse` interface** (`topsyde_utils/src/types.ts`):
   ```typescript
   export interface I_ApplicationResponse<T = unknown> {
       status: boolean | number;
       data: T;
       error?: T;
       after_action?: Function; // ✅ New field
   }
   ```

2. **Updated Controller methods** (`topsyde_utils/src/server/controller.ts`):
   ```typescript
   public success<T>(data: T, after_action?: Function): I_ApplicationResponse<T> {
       return { status: true, data, after_action };
   }

   public failure<T>(data: T, after_action?: Function): I_ApplicationResponse<T> {
       return { status: false, data, after_action };
   }
   ```

3. **Implemented queueMicrotask timing** (`topsyde_utils/src/application.ts`):
   ```typescript
   public static Response<T>(data: T | I_ApplicationResponse<T>, after_action?: Function, status = 200, headers?: HeadersInit): Response {
       const response = isApplicationResponse(data) ? data : { status: true, data };
       const output = Response.json(response, RESPONSE_INIT(status, headers));
       Application.AfterAction(after_action);
       return output;
   }

   private static AfterAction(after_action: Function | undefined) {
       if (after_action) {
           queueMicrotask(() => {
               try {
                   after_action();
               } catch (error) {
                   console.error('[Application] After-action error:', error);
               }
           });
       }
   }
   ```

4. **Updated matchmaking server's main handler** (`server_rune_matchmaking/src/app.ts`):
   ```typescript
   const response = await Router.Call<ControllerResponse<any>>(request);
   return App.Response(response, response.after_action);
   ```

**Action Items**:
- [x] Design after-action hook API in topsyde-utils (Option 1: extend interface)
- [x] Implement hook in `Application.Response()` method with queueMicrotask
- [x] Update `Controller.success()` and `Controller.failure()` signatures
- [x] Add TypeScript types via `I_ApplicationResponse.after_action` field
- [x] Update `app.ts` to extract and pass `after_action` to `App.Response()`
- [ ] Publish new topsyde-utils version (USER ACTION REQUIRED)
- [ ] Update server_rune_matchmaking package.json to use new version (USER ACTION REQUIRED)
- [ ] Run `bun install` to update dependencies (USER ACTION REQUIRED)

**Files Modified**:
- `topsyde_utils/src/types.ts` (added after_action field to interface) ✅
- `topsyde_utils/src/application.ts` (implemented AfterAction with queueMicrotask) ✅
- `topsyde_utils/src/server/controller.ts` (updated success/failure signatures) ✅
- `server_rune_matchmaking/src/app.ts` (extract after_action from response) ✅

**Next Step**: User needs to publish topsyde-utils and update matchmaking server dependency

**Time Spent**: ~1 hour

---

#### ✅ Task 2: Refactor Backend `/match/pve` Endpoint (COMPLETED)

**Objective**: Update backend endpoint to return full initial state in HTTP response instead of minimal data

**Why This Was Blocking Frontend**: Frontend implementation depends on receiving complete structured initial state (player, npc, turn, atb, timer) from the backend. Old endpoint returned minimal data, causing race conditions and requiring additional WebSocket events.

**Current Behavior** (`server_rune_matchmaking/src/components/match/match.controller.ts:61-68`):
```typescript
return this.success({
  message: 'PVE match created',
  whoami: body.whoami,
  matchId: match.id,
  channelId: channel.id,
  match: match,              // Full Match object (needs extraction)
  timerInfo: gameState.turnManager.getTimerConfig(),
});
```

**Required Behavior** (from Subject 3 resolution):
```typescript
return this.success({
  success: true,
  data: {
    matchId: match.id,
    channelId: channel.id,
    channelName: channel.name,

    state: {
      player: {
        entityId: string,
        name: string,
        health: number,
        maxHealth: number,
        stats: { attack, defense, speed, ... }
      },
      npc: {
        entityId: string,
        name: string,
        health: number,
        maxHealth: number,
        stats: { attack, defense, speed, ... }
      },
      turn: {
        number: 1,
        currentEntityId: string,
        isPlayerTurn: boolean
      },
      atb: {
        playerReadiness: 0,
        npcReadiness: 0
      },
      timer: {
        duration: number,
        warningThreshold: number,
        fallbackAction: 'pass' | 'skip'
      }
    }
  }
});
```

**Action Items**:
- [x] Create service method `getInitialMatchState()` in `match.service.ts`
- [x] Extract player participant data from `match.getParticipants()`
- [x] Extract NPC participant data from `match.getParticipants()`
- [x] Get turn state from `gameState.turnManager`
- [x] Get ATB readiness from `gameState.atbManager.getProgressionPercentages()`
- [x] Structure response with `state` object containing player/npc/turn/atb/timer`
- [x] Update response format to use `success: true` and `data` wrapper
- [x] Move `client.send()` WebSocket call to after-action hook
- [ ] Test endpoint returns complete state and WebSocket fires after HTTP response (USER ACTION REQUIRED)

**Implementation**:

Service layer (`match.service.ts:44-114`):
```typescript
public getInitialMatchState(matchId: string) {
    const match = this.getMatchById(matchId);
    const gameState = GameStateStore.GetGameState(matchId);

    // Extract participants, turn state, ATB readiness, timer config
    // Return structured state object
    return { player, npc, turn, atb, timer };
}
```

Controller layer (`match.controller.ts:40-85`):
```typescript
private async pve(req: Request): Promise<I_ApplicationResponse> {
    const match = this.service.createPVE(...);
    const channel = ChannelManager.CreateChannel(...);
    channel.addMember(client);

    const initialState = this.service.getInitialMatchState(match.id);

    return this.success(
        {
            success: true,
            data: {
                matchId: match.id,
                channelId: channel.id,
                channelName: channel.name,
                state: initialState
            }
        },
        () => {
            // WebSocket notification sent AFTER HTTP response
            client.send({
                type: 'match.created',
                content: { matchId: match.id, channelName: channel.name },
                channel: match.id
            });
        }
    );
}
```

**Files Modified**:
- `server_rune_matchmaking/src/components/match/match.service.ts` (added getInitialMatchState method) ✅
- `server_rune_matchmaking/src/components/match/match.controller.ts` (MVC separation + after-action hook) ✅

**Next Step**: User needs to publish topsyde-utils, update dependencies, and test endpoint

**Time Spent**: ~30 minutes

---

### **Implementation Tasks:**

#### Task 2: Match UI Components 🚧

**Purpose**: Create UI components for match flow

---

##### Iteration 0: Game Mode Controls & Visibility Management 🚧

**Goal**: Control player movement and camera perspective during match - limit movement while in match + change camera perspective

**Status**: 🚧 IN PROGRESS (Implementing)

**Note**: Exception to normal numbering - moved from Task 1 to Task 2 as it relates to match mode UX

**Brainstorming Complete**: All 6 subjects resolved, architecture decisions documented, action items identified. No pre-implementation tasks needed - ready to implement.

---

### **Brainstorming Session - Match Mode Controls & Environment**

**Focus**: Design the architecture for match mode gameplay area, movement restrictions, camera control, and scene state management

**Subjects to Discuss** (tackle one at a time):

1. ✅ **Movement Limitation** - How and where in the code do we limit player movement during matches?
2. ✅ **Match Area Definition** - How do we create a 'match area' around the player?
3. ✅ **Grid System** - How do we apply a grid only to the match area (with size controls)?
4. ✅ **Scene State/Mode Management** - How do we shift scene state/mode between overworld and match?
5. ✅ **Camera Control** - How do we control the camera during matches?
6. ✅ **Match Module Architecture** - Do we need a match module to handle all match logic?

**Resolved Subjects**:

---

### ✅ Subject 1: Movement Limitation

**Decision**: Event-driven pattern using SceneStateService registry + KinematicMovementComponent state reaction

**Architecture**:

1. **SceneStateService Extension**:
   - Implement `register(id: string, callback: Function)` from `I_SceneService`
   - Implement `unregister(id: string)` from `I_SceneService`
   - Store registered listeners in a Map
   - Emit state changes to all registered listeners when `setState()` is called

2. **KinematicMovementComponent Integration**:
   - Register for state changes in `init()` method
   - Unregister in `destroy()` method
   - React to state changes by updating internal flags:
     - `enableJumping` (existing) - Disabled when NOT in OVERWORLD
     - `enableMovement` (new) - Disabled in MENU states
   - Movement logic already checks these flags before processing input

3. **State-based Movement Rules**:
   ```
   OVERWORLD → enableMovement: true, enableJumping: true ✅✅
   MATCH_INSTANTIATING → enableMovement: true, enableJumping: false ✅🚫
   PVE_MATCH → enableMovement: true, enableJumping: false ✅🚫
   MENU (future) → enableMovement: false, enableJumping: false 🚫🚫
   ```

**Why This Works**:
- ✅ Event-driven (no polling overhead)
- ✅ Decoupled (component reacts to service events)
- ✅ Scalable (other components can register too)
- ✅ Follows existing service pattern in GameScene
- ✅ Single source of truth (SceneStateService owns state)

**Implementation Details**:
- Callback signature: `(newState: E_SceneState) => void`
- Registration in KinematicMovementComponent.init()
- Unregistration in KinematicMovementComponent.destroy()
- State change logic updates both flags based on new state

**Resolution Type**: D (Iteration Action Items)

**Action Items Added**:
- Implement `register()` and `unregister()` in SceneStateService
- Add state change emission in `setState()` method
- Add `enableMovement` flag to KinematicMovementComponent
- Register KinematicMovementComponent for state changes in `init()`
- Add state-based movement control logic (OVERWORLD vs MATCH vs MENU)

**No Testing Required**: Behavior guaranteed by implementation logic

---

### ✅ Subject 2: Match Area Definition

**Decision**: Distance-gated interaction + invisible collision dome (360°) around both participants

**Architecture**:

1. **Distance-Based Interaction Gate**:
   - MatchComponent checks distance between player and target (NPC)
   - Match instantiation only allowed within threshold distance (e.g., 5 units)
   - Before distance check: No match creation possible
   - Within distance: Double-click triggers match

2. **Proximity Indication System** (NEW REQUIREMENT):
   - Visual feedback when player is close enough to interact
   - Options: Glow effect, outline shader, UI prompt, etc.
   - Indicates "you can start match now"
   - Applies to NPCs within interaction distance

3. **Match Area Dome Creation**:
   - **When**: After match instantiation confirmed (state → MATCH_INSTANTIATING)
   - **What**: Invisible 360° collision dome (hemisphere or full sphere)
   - **Where**: Centered between player and NPC positions
   - **Size**: Calculated based on distance between participants (e.g., diameter = distance * 2)
   - **Collision**: Static physics body prevents exit
   - **Visual**: Debug wireframes (toggleable via gameConfig)

4. **Dome Prefab**:
   - GameObject with:
     - TransformComponent (position, scale)
     - GeometryComponent (sphere geometry)
     - MaterialComponent (invisible or wireframe-only)
     - PhysicsComponent (static body, sphere collider)
   - Created dynamically on match start
   - Destroyed on match end

5. **Smooth Overworld Transition**:
   - Players remain in overworld scene (no scene switch)
   - Dome constrains movement area
   - State changes from OVERWORLD → MATCH_INSTANTIATING → PVE_MATCH
   - Camera shifts, grid appears, but same 3D space
   - Non-participants hidden (from Subject 1 original requirements)

**Why This Works**:
- ✅ No jarring scene transitions (stay in overworld)
- ✅ Physical boundaries prevent escaping match area
- ✅ Clear visual feedback (proximity + dome wireframes)
- ✅ Mathematically simple (distance checks, sphere positioning)
- ✅ Reusable prefab pattern
- ✅ Debug-friendly (wireframes toggleable)

**Implementation Details**:

**Distance Calculation**:
```typescript
// In MatchComponent
const distance = player.position.distanceTo(npc.position);
const MIN_INTERACTION_DISTANCE = 5; // units

if (distance > MIN_INTERACTION_DISTANCE) {
  console.warn('Too far to start match');
  return;
}
```

**Dome Positioning**:
```typescript
// Center point between player and NPC
const centerX = (player.position.x + npc.position.x) / 2;
const centerZ = (player.position.z + npc.position.z) / 2;
const centerY = 0; // Ground level

// Diameter based on distance + buffer
const diameter = distance * 2 + 5; // Extra space for movement
```

**Dome Prefab Structure**:
- `MatchAreaDome` extends GameObject
- Sphere geometry (radius = diameter / 2)
- Invisible material (or wireframe for debug)
- Static physics collider (prevents exit)
- Created in MatchComponent after successful match creation
- Destroyed in match leave flow

**Resolution Type**: D (Iteration Action Items)

**New Requirements Discovered**:
1. **Proximity Indication System** - Visual feedback for interaction distance
   - Could be: HoverGlow enhancement, UI distance indicator, outline shader
   - Should be generic (reusable for other interactions)

**Action Items Added**:
- Add distance check to MatchComponent before allowing match creation
- Implement proximity indication system (visual feedback when in range)
- Create MatchAreaDome prefab (invisible collision sphere)
- Calculate dome position (midpoint between player and NPC)
- Calculate dome size (based on participant distance + buffer)
- Spawn dome on match start (MATCH_INSTANTIATING state)
- Destroy dome on match end (return to OVERWORLD state)
- Add debug wireframe toggle for dome visualization

---

### ✅ Subject 3: Grid System

**Decision**: Tactical grid overlay for match area with position-to-grid coordinate mapping and ability range calculations

**Combat System Context** (Critical Design Driver):
- **Tactical ATB Hybrid**: Players move during ATB charge phase, freeze when turn activates
- **Grid-based ability ranges**: Melee hits adjacent cells, ranged hits distant cells
- **Positioning matters**: Players must strategically position during charge to be in range when turn activates
- **Real-time + Turn-based fusion**: Movement is real-time (during charge), targeting is grid-based (during turn)

**Architecture**:

1. **Grid Prefab - MatchGrid**:
   - GameObject with grid visualization
   - Only visible during PVE_MATCH state
   - Spawned with MatchAreaDome (same lifecycle)
   - Configurable cell size (e.g., 1x1 units per cell)
   - Covers entire dome area (circular grid)

2. **Grid Geometry**:
   - **Visual**: Three.js GridHelper or custom line geometry
   - **Size**: Matches dome diameter (e.g., if dome is 20 units diameter, grid is 20x20)
   - **Cell size**: Configurable (default 1 unit = 1 cell)
   - **Material**: Semi-transparent lines (white/gray, alpha 0.3)
   - **Position**: Ground level (Y = 0), centered with dome

3. **Grid Coordinate System**:
   - **World-to-Grid mapping**: Convert 3D position to grid coordinates
   - **Grid origin**: Center of dome = (0, 0) in grid space
   - **Cell coordinates**: Integer-based (e.g., player at grid position [3, -2])
   - **Conversion formula**:
     ```typescript
     gridX = Math.floor((worldX - gridOriginX) / cellSize)
     gridZ = Math.floor((worldZ - gridOriginZ) / cellSize)
     ```

4. **Grid Manager Service** (NEW):
   - Manages grid lifecycle (spawn/destroy with dome)
   - Provides position-to-grid conversion API
   - Provides grid-to-position conversion API (for ability targeting)
   - Calculates grid distance between positions
   - Validates ability ranges (is target in range?)

5. **Participant Grid Tracking**:
   - Each match participant tracks their current grid position
   - Updated every frame during movement (during charge phase)
   - Frozen when ATB turn activates (no movement = fixed grid position)
   - Server needs to know grid positions for ability validation

6. **Ability Range System** (Future - Combat Phase):
   - Abilities define range in grid cells (e.g., melee = 1 cell, fireball = 5 cells)
   - Range calculated using grid distance formula:
     ```typescript
     const gridDistance = Math.abs(targetGridX - casterGridX) + Math.abs(targetGridZ - casterGridZ)
     // Manhattan distance for tactical grid
     ```
   - UI highlights valid target cells when ability selected
   - Server validates range before executing ability

**Why This Works**:
- ✅ Grid tied to match area (dome boundary)
- ✅ Clear tactical positioning (visual grid overlay)
- ✅ Simple coordinate math (world ↔ grid conversion)
- ✅ Grid scales with dome size (flexible)
- ✅ Supports range-based abilities (melee vs ranged)
- ✅ Real-time movement + grid-based targeting fusion

**Implementation Details**:

**Grid Prefab Structure**:
```typescript
class MatchGrid extends GameObject {
  constructor(config: { centerX: number, centerZ: number, diameter: number, cellSize: number }) {
    // GridHelper or custom line geometry
    // Semi-transparent material
    // Position at ground level
  }

  worldToGrid(worldX: number, worldZ: number): { gridX: number, gridZ: number }
  gridToWorld(gridX: number, gridZ: number): { worldX: number, worldZ: number }
  getGridDistance(pos1, pos2): number
}
```

**Grid Manager Service**:
```typescript
class GridManagerService extends SceneService {
  private grid: MatchGrid | null = null;

  spawnGrid(centerX, centerZ, diameter, cellSize): MatchGrid
  destroyGrid(): void
  getParticipantGridPosition(participantId): { gridX, gridZ }
  isInRange(casterId, targetId, abilityRange): boolean
}
```

**Integration with Movement**:
- During ATB charge phase: `enableMovement = true`, grid position updates each frame
- When turn activates: `enableMovement = false`, grid position frozen
- Abilities use frozen grid position for range validation

**Resolution Type**: D (Iteration Action Items)

**Dependencies**:
- Subject 2 (MatchAreaDome) - Grid spawns with dome, uses same center/size
- Future: ATB system integration (charge/turn phases)
- Future: Ability system (range definitions, targeting UI)

**Action Items Added**:
- Create MatchGrid prefab (GridHelper or custom line geometry)
- Add configurable cell size parameter (default 1 unit)
- Implement worldToGrid() coordinate conversion
- Implement gridToWorld() coordinate conversion
- Implement getGridDistance() using Manhattan distance
- Create GridManagerService for lifecycle and API
- Spawn grid with dome on match start
- Destroy grid with dome on match end
- Track participant grid positions (update during movement)
- Add grid visibility toggle to gameConfig

**Future Work** (not this iteration):
- Ability range definitions in ability data
- Target cell highlighting during ability selection
- Server-side range validation
- Grid-based pathfinding for AI

---

#### Subject 4: Scene State/Mode Management ✅

**Question**: How do we manage state transitions during match flow? Do we need to enhance SceneStateService?

**Current Implementation Analysis**:

SceneStateService (src/game/services/SceneStateService.ts) already provides:
- ✅ State enum with all needed states (OVERWORLD, MATCH_INSTANTIATING, PVE_MATCH, MENU)
- ✅ `setState()` / `getState()` API for state transitions
- ✅ Convenience methods: `isOverworld()`, `isMatchInstantiating()`, `isPVEMatch()`
- ✅ RxJS integration via `useRxjs('scene:state')` for event-driven pattern
- ✅ `onStateChange` subscription mechanism (lines 57-66)
- ✅ Console logging for state transitions
- ✅ `reset()` method for cleanup

**Current Usage**:
- MatchComponent already uses setState() correctly (lines 96, 136, 149 in MatchComponent.ts)
- State transitions working: OVERWORLD → MATCH_INSTANTIATING → PVE_MATCH
- Error handling reverts to OVERWORLD

**Architectural Decision**: **MINIMAL ENHANCEMENT NEEDED**

**Rationale**:

1. **Current API is Sufficient for State Management**:
   - `setState()` provides clear, explicit state transitions
   - Helper methods (`isOverworld()`, etc.) improve readability
   - RxJS event system allows reactive subscriptions (Subject 1 pattern)

2. **Need to Add Service Registry Pattern**:
   - SceneStateService extends SceneService (implements I_SceneService)
   - I_SceneService interface defines `register()` / `unregister()` methods (optional)
   - Need to implement these methods for Subject 1 event-driven pattern
   - Components will register callbacks to react to state changes

3. **Who Triggers Transitions** (Clear Ownership):
   - **MatchComponent** triggers: OVERWORLD → MATCH_INSTANTIATING → PVE_MATCH
   - **MatchHUD leave button** (via RxJS) triggers: PVE_MATCH → OVERWORLD
   - **Error handlers** trigger: any state → OVERWORLD (rollback)
   - **No centralized orchestrator needed** - components own their transitions

4. **State Validation Already Working**:
   - MatchComponent checks `isOverworld()` before match creation (line 90)
   - Prevents invalid state transitions (e.g., starting match during match)

5. **Extension Path Clear** (if needed later):
   - Can add state transition guards (validate before setState)
   - Can add state history/stack (undo functionality)
   - Can add transition callbacks (onEnterMatch, onLeaveMatch)
   - **But YAGNI principle applies** - don't add until needed

**State Transition Flow** (Current Implementation):

```
┌────────────────────────────────────────────────────────────────┐
│                        State Lifecycle                          │
└────────────────────────────────────────────────────────────────┘

1. **Match Creation Initiated**:
   User double-clicks NPC → MatchComponent.handleMatchCreation()
   └─> stateService.setState(E_SceneState.MATCH_INSTANTIATING)

2. **Match Created Successfully**:
   API returns match data → MatchComponent.createPveMatch()
   └─> stateService.setState(E_SceneState.PVE_MATCH)

3. **Match Ended**:
   User clicks Leave → MatchHUD emits RxJS event
   └─> rxjs.$next('onStateChange', E_SceneState.OVERWORLD)
   └─> SceneStateService.onStateChange() receives event
   └─> stateService.setState(E_SceneState.OVERWORLD)

4. **Error Rollback**:
   API fails → MatchComponent.handleMatchCreationError()
   └─> stateService.setState(E_SceneState.OVERWORLD)

┌────────────────────────────────────────────────────────────────┐
│                    Reactive Subscribers                         │
└────────────────────────────────────────────────────────────────┘

Subject 1 Resolution (Event-Driven Pattern):
- KinematicMovementComponent subscribes to state changes
- Registers with SceneStateService.register()
- Receives callback on every setState() call
- Updates enableMovement/enableJumping based on new state
```

**Integration with Subject 1** (Movement Limitation):

SceneStateService already has the `register()` / `unregister()` methods defined in I_SceneService interface. KinematicMovementComponent will:
1. Call `context.getService('state').register(callback)` in init()
2. Callback receives new state and updates flags
3. Call `context.getService('state').unregister(callback)` in destroy()

**Why This Decision Is Correct**:
- ✅ **Simple**: Uses existing setState() API, no new methods
- ✅ **Clear Ownership**: Components trigger transitions they control
- ✅ **Event-Driven**: RxJS enables Vue ↔ Game coordination (MatchHUD → SceneStateService)
- ✅ **Testable**: State transitions explicit and traceable
- ✅ **Extensible**: Can add guards/callbacks later if needed
- ✅ **Follows YAGNI**: Don't add complexity until required

**Resolution Type**: D (Iteration Action Items)

**Action Items Added**:
- Implement `register(callback)` method in SceneStateService
  - Store callbacks in array
  - Callback signature: `(newState: E_SceneState, oldState: E_SceneState) => void`
- Implement `unregister(callback)` method in SceneStateService
  - Remove callback from array
- Update `setState()` to notify all registered callbacks
  - Call each callback with newState and oldState
- Components use this API for reactive state changes (Subject 1 integration)

**Conclusion**: SceneStateService core API is solid. Just needs registry pattern implementation to support event-driven components (Subject 1).

---

#### Subject 5: Camera Control ✅

**Question**: How do we control the camera during matches?

**Decision**: Fixed asymmetrical spectator camera using invisible GameObject anchor + animated transitions via enhanced useCamera API

**Architecture Overview**:

1. **Match Camera Anchor GameObject**:
   - Invisible GameObject positioned at desired camera viewpoint
   - Positioned to capture full match area (dome + grid from Subject 2/3)
   - Static position (no movement) = camera stays fixed
   - Created when match starts, destroyed when match ends

2. **Camera Target Switching**:
   - Enhance `useCamera.ts` with `changeTarget()` method
   - Method signature: `changeTarget(newTarget: Vector3, perspective: CameraPerspective, duration: number)`
   - Animates camera position smoothly from current to new target
   - Uses lerp/tween for smooth transition (duration controls speed)

3. **Camera Perspective Presets**:
   - Define camera configuration constants for different states:
     - `CAMERA_PRESET_OVERWORLD`: Follow player character (existing behavior)
     - `CAMERA_PRESET_MATCH_SPECTATE`: Fixed overhead/angled view of match area
   - Each preset defines: target position, angle, distance, FOV
   - Easy to switch between presets via `changeTarget()` method

4. **Mouse Input Control**:
   - Disable right-click camera rotation during match states
   - Mouse utility (`useCameraMouseInput.ts`) subscribes to SceneStateService (Subject 1/4 pattern)
   - When state !== OVERWORLD: prevent right-click down event from triggering rotation
   - Alternatively: Add `enabled` flag to `useCameraMouseInput` composable

5. **State Integration**:
   - Subscribe to SceneStateService state changes
   - OVERWORLD → PVE_MATCH: Call `changeTarget(matchAnchor, CAMERA_PRESET_MATCH_SPECTATE, 1000ms)`
   - PVE_MATCH → OVERWORLD: Call `changeTarget(playerCharacter, CAMERA_PRESET_OVERWORLD, 1000ms)`
   - Lock mouse controls during match states

**Implementation Details**:

**Camera Anchor GameObject**:
```typescript
// Created in MatchComponent or MatchModule when match starts
const matchCameraAnchor = new GameObject({
  id: 'match-camera-anchor',
  position: calculateCameraPosition(domeCenter, domeRadius)
});
// No mesh, no components - just a position reference
// Destroyed when match ends
```

**Enhanced useCamera API**:
```typescript
// Add to useCamera.ts
export interface I_CameraPerspective {
  angle: { horizontal: number, vertical: number };
  distance: number;
  fov?: number;
}

// New method
function changeTarget(
  newTarget: Vector3,
  perspective: I_CameraPerspective,
  duration: number
): Promise<void> {
  // Animate from current to new target over duration
  // Use lerp for position, slerp for rotation
  // Update controller.target, controller.angle, controller.distance
  // Return promise that resolves when animation complete
}

// Camera preset constants
export const CAMERA_PRESET_OVERWORLD: I_CameraPerspective = {
  angle: { horizontal: 0, vertical: Math.PI / 4 },
  distance: 10,
  fov: 75
};

export const CAMERA_PRESET_MATCH_SPECTATE: I_CameraPerspective = {
  angle: { horizontal: Math.PI / 4, vertical: Math.PI / 3 },
  distance: 15,
  fov: 60
};
```

**Mouse Input State Control**:
```typescript
// Option 1: Add enabled flag to useCameraMouseInput
export function useCameraMouseInput(
  rotation: CameraRotation,
  zoom: CameraZoom,
  enabled: Ref<boolean> // New parameter
): CameraMouseInput {
  // In handleMouseDown:
  mouse.on('down', (event: I_MouseEvent) => {
    if (!enabled.value) return; // Skip if disabled
    if (event.button === 2) {
      // ... pointer lock logic
    }
  });
}

// Option 2: Subscribe to SceneStateService in useCameraMouseInput
// Register callback that sets internal _enabled flag based on state
// Only allow rotation when state === OVERWORLD
```

**State Transition Flow**:
```
1. User double-clicks NPC → Match creation starts
2. MatchComponent.createPveMatch() succeeds
3. Create match camera anchor GameObject at calculated position
4. Call camera.changeTarget(anchorPosition, CAMERA_PRESET_MATCH_SPECTATE, 1000)
5. Camera smoothly animates to fixed spectator view (1 second duration)
6. Mouse rotation disabled (right-click does nothing)
7. Match proceeds with fixed camera

8. User clicks Leave Match → Match ends
9. Destroy match camera anchor GameObject
10. Call camera.changeTarget(playerPosition, CAMERA_PRESET_OVERWORLD, 1000)
11. Camera smoothly returns to follow player (1 second duration)
12. Mouse rotation re-enabled
```

**Why This Design Works**:
- ✅ **Leverages Existing Architecture**: useCamera already follows targets, just change the target
- ✅ **Smooth Transitions**: Animated camera movement feels professional
- ✅ **Simple GameObject Pattern**: Invisible anchor is clean and easy to manage
- ✅ **Preset System**: Easy to define and switch between camera configurations
- ✅ **State-Driven**: Integrates with SceneStateService (Subject 1/4 pattern)
- ✅ **Mouse Control Separation**: useCameraMouseInput can be enabled/disabled independently
- ✅ **No Complex Camera Manager**: No need for centralized camera orchestrator

**Resolution Type**: D (Iteration Action Items)

**Dependencies**:
- Subject 2 (Match Area Dome) - Camera position calculated from dome center/radius
- Subject 4 (SceneStateService) - State changes trigger camera transitions

**Action Items Added**:
- Create MatchCameraAnchor GameObject (invisible, position-only)
- Calculate camera anchor position based on dome geometry (Subject 2)
- Add `changeTarget()` method to useCamera.ts
  - Parameters: newTarget (Vector3), perspective (angle/distance/fov), duration (ms)
  - Implement lerp animation for smooth transition
  - Return Promise that resolves when complete
- Define camera perspective preset constants
  - CAMERA_PRESET_OVERWORLD (follow player)
  - CAMERA_PRESET_MATCH_SPECTATE (fixed overhead)
- Add enabled flag or state subscription to useCameraMouseInput
  - Disable right-click rotation when state !== OVERWORLD
  - Option A: enabled ref parameter
  - Option B: Subscribe to SceneStateService
- Integrate camera transitions into match flow
  - Match start: changeTarget(anchor, MATCH_SPECTATE, 1000)
  - Match end: changeTarget(player, OVERWORLD, 1000)
- Spawn/destroy camera anchor GameObject with match lifecycle

---

#### Subject 6: Match Module Architecture ✅

**Question**: Do we need a match module to handle all match logic?

**Decision**: **YES** - Lightweight MatchModule as match environment orchestrator, reacting to SceneStateService state changes

**Architecture Overview**:

**MatchModule Responsibilities** (Scene Infrastructure):
1. **Register with SceneStateService** (Subject 1/4 pattern)
   - Subscribe to state changes via `register(callback)`
   - React to OVERWORLD → PVE_MATCH transition (spawn environment)
   - React to PVE_MATCH → OVERWORLD transition (destroy environment)

2. **Match Environment Lifecycle**:
   - Spawn collision dome (Subject 2) when entering PVE_MATCH
   - Spawn grid overlay (Subject 3) inside dome
   - Create camera anchor GameObject (Subject 5) at calculated position
   - Trigger camera transition via `camera.changeTarget()`
   - Store references to spawned objects (dome, grid, anchor)
   - Destroy all match objects when returning to OVERWORLD

3. **Does NOT Handle**:
   - ❌ Match creation API calls (MatchComponent owns this)
   - ❌ Movement/jumping limitation (KinematicMovementComponent via Subject 1)
   - ❌ Mouse rotation control (useCameraMouseInput via Subject 4)
   - ❌ State transitions (MatchComponent/MatchHUD trigger these)
   - ❌ Combat logic (future - separate system)

**Why SceneStateService Over DataStore.match?**
- ✅ **Single Source of Truth**: SceneStateService = game state authority
- ✅ **Clear Separation**: Match store = data, Scene state = mode
- ✅ **Consistent Pattern**: All systems react to state (Subject 1: movement, Subject 5: camera, now Subject 6: environment)
- ✅ **Decoupling**: MatchModule doesn't care about match data, only mode transitions
- ✅ **Event-Driven**: State change → MatchModule reacts (no polling, no watchers)

**Match Environment Orchestration Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Match Start Sequence                          │
└─────────────────────────────────────────────────────────────────┘

1. User double-clicks NPC
   └─> MatchComponent.handleMatchCreation() fires

2. MatchComponent creates match via API
   └─> Updates DataStore.match with match data
   └─> SceneStateService.setState(E_SceneState.PVE_MATCH)

3. SceneStateService notifies all registered callbacks
   └─> MatchModule.onStateChange(PVE_MATCH, OVERWORLD) fires

4. MatchModule.enterMatch() executes:
   └─> Get player + NPC positions from scene
   └─> Calculate dome center (midpoint between participants)
   └─> Calculate dome radius (distance / 2 + buffer)
   └─> Spawn MatchAreaDome prefab at center with radius
   └─> Spawn MatchGrid prefab at dome center with radius
   └─> Create MatchCameraAnchor GameObject at calculated viewpoint
   └─> Call camera.changeTarget(anchor, MATCH_SPECTATE, 1000)
   └─> Store references: this.dome, this.grid, this.cameraAnchor

┌─────────────────────────────────────────────────────────────────┐
│                    Match End Sequence                            │
└─────────────────────────────────────────────────────────────────┘

5. User clicks Leave Match (MatchHUD)
   └─> Calls leave API
   └─> Clears DataStore.match via $reset()
   └─> Emits RxJS event: rxjs.$next('onStateChange', OVERWORLD)

6. SceneStateService receives RxJS event
   └─> SceneStateService.setState(E_SceneState.OVERWORLD)

7. SceneStateService notifies all registered callbacks
   └─> MatchModule.onStateChange(OVERWORLD, PVE_MATCH) fires

8. MatchModule.exitMatch() executes:
   └─> Destroy dome prefab (removes collision + mesh)
   └─> Destroy grid prefab
   └─> Destroy camera anchor GameObject
   └─> Call camera.changeTarget(playerPosition, OVERWORLD, 1000)
   └─> Clear references: this.dome = null, this.grid = null, etc.
```

**Implementation Details**:

**MatchModule Structure**:
```typescript
export class MatchModule extends SceneModule {
  private dome: MatchAreaDome | null = null;
  private grid: MatchGrid | null = null;
  private cameraAnchor: GameObject | null = null;

  async init(context: I_SceneContext): Promise<void> {
    await super.init(context);

    // Register with SceneStateService (Subject 1/4 pattern)
    const stateService = context.getService('state');
    stateService.register(this.onStateChange.bind(this));
  }

  private onStateChange(newState: E_SceneState, oldState: E_SceneState): void {
    if (newState === E_SceneState.PVE_MATCH && oldState === E_SceneState.OVERWORLD) {
      this.enterMatch();
    } else if (newState === E_SceneState.OVERWORLD && oldState === E_SceneState.PVE_MATCH) {
      this.exitMatch();
    }
  }

  private enterMatch(): void {
    // Get match data from store (for participant positions)
    const matchData = DataStore.match;

    // Calculate dome geometry
    const { center, radius } = this.calculateDomeGeometry(matchData);

    // Spawn match environment
    this.dome = new MatchAreaDome({ center, radius });
    this.grid = new MatchGrid({ center, radius, cellSize: 1 });
    this.cameraAnchor = new GameObject({
      id: 'match-camera-anchor',
      position: this.calculateCameraPosition(center, radius)
    });

    // Trigger camera transition
    const camera = this.context.camera;
    camera.changeTarget(
      this.cameraAnchor.position,
      CAMERA_PRESET_MATCH_SPECTATE,
      1000
    );

    // Add to scene
    const gameObjectsManager = this.context.getService('gameObjectsManager');
    gameObjectsManager.add(this.dome);
    gameObjectsManager.add(this.grid);
    gameObjectsManager.add(this.cameraAnchor);
  }

  private exitMatch(): void {
    // Destroy match environment
    const gameObjectsManager = this.context.getService('gameObjectsManager');
    if (this.dome) gameObjectsManager.remove(this.dome.id);
    if (this.grid) gameObjectsManager.remove(this.grid.id);
    if (this.cameraAnchor) gameObjectsManager.remove(this.cameraAnchor.id);

    // Trigger camera return
    const camera = this.context.camera;
    const character = this.context.character;
    camera.changeTarget(
      character.instance.position,
      CAMERA_PRESET_OVERWORLD,
      1000
    );

    // Clear references
    this.dome = null;
    this.grid = null;
    this.cameraAnchor = null;
  }

  async destroy(): Promise<void> {
    // Unregister from SceneStateService
    const stateService = this.context.getService('state');
    stateService.unregister(this.onStateChange.bind(this));

    // Clean up any remaining objects
    this.exitMatch();
  }
}
```

**Clear Separation of Concerns**:

| Responsibility | Owner | Trigger |
|----------------|-------|---------|
| Match creation API | MatchComponent | User double-click NPC |
| State transition (enter) | MatchComponent | API success |
| State transition (exit) | MatchHUD | User click Leave |
| Environment spawn | MatchModule | State → PVE_MATCH |
| Environment cleanup | MatchModule | State → OVERWORLD |
| Movement limitation | KinematicMovementComponent | State change |
| Mouse control lock | useCameraMouseInput | State change |
| Camera transition | MatchModule | State change (calls camera.changeTarget) |

**Why This Design Works**:
- ✅ **Event-Driven**: MatchModule reacts to state, doesn't poll or watch stores
- ✅ **Single Source of Truth**: SceneStateService drives all match mode behaviors
- ✅ **Decoupled**: MatchModule doesn't care about match data, only state transitions
- ✅ **Consistent Pattern**: Same register/callback pattern as Subject 1 (movement)
- ✅ **Clear Ownership**: MatchModule = environment lifecycle orchestrator
- ✅ **No Duplication**: Camera transition logic centralized in MatchModule
- ✅ **Easy Testing**: State change → expected environment changes

**Resolution Type**: D (Iteration Action Items)

**Dependencies**:
- Subject 1 (Movement Limitation) - Same SceneStateService.register() pattern
- Subject 2 (Match Area Dome) - MatchModule spawns dome prefab
- Subject 3 (Grid System) - MatchModule spawns grid prefab
- Subject 4 (Scene State Management) - MatchModule subscribes to state changes
- Subject 5 (Camera Control) - MatchModule triggers camera transitions

**Action Items Added**:
- Create MatchModule (extends SceneModule)
- Implement init() - register with SceneStateService
- Implement onStateChange(newState, oldState) callback
- Implement enterMatch() method:
  - Get match data from DataStore.match (for participant positions)
  - Calculate dome geometry (center = midpoint, radius = distance/2 + buffer)
  - Spawn MatchAreaDome prefab (Subject 2)
  - Spawn MatchGrid prefab (Subject 3)
  - Create MatchCameraAnchor GameObject (Subject 5)
  - Trigger camera.changeTarget(anchor, MATCH_SPECTATE, 1000)
  - Store references to spawned objects
- Implement exitMatch() method:
  - Destroy dome, grid, camera anchor GameObjects
  - Trigger camera.changeTarget(player, OVERWORLD, 1000)
  - Clear object references
- Implement destroy() - unregister from SceneStateService
- Add MatchModule to PlaygroundScene module registry
- Register MatchModule in PlaygroundScene.registerModules()

---

**Action Items**: See brainstorming session above - all action items are documented in resolved subjects (Subjects 1-6).

**Implementation Summary** (from brainstorming):

**Core Systems**:
- [x] SceneStateService: Implement register/unregister methods (Subject 4)
- [x] KinematicMovementComponent: Add state-based movement control (Subject 1)
- [x] MatchModule: Create environment orchestrator (Subject 6)

**Match Environment**:
- [x] MatchAreaDome prefab: Collision sphere with distance gating (Subject 2)
- [x] MatchGrid prefab: Tactical grid with coordinate conversion (Subject 3)
- [ ] Proximity indication system: Visual feedback for interaction range (Subject 2) **(Deferred to future iteration)**

**Camera System**:
- [x] useCamera: Add changeTarget() method with animation (Subject 5)
- [x] Camera presets: OVERWORLD and MATCH_SPECTATE configurations (Subject 5)
- [x] useCameraMouseInput: Disable rotation during match states (Subject 5)
- [x] MatchCameraAnchor: Invisible GameObject for fixed camera position (Subject 5)

**Integration**:
- [x] MatchModule integration: Spawn/destroy dome, grid, camera anchor on state changes (Subject 6)
- [x] PlaygroundScene: Register MatchModule in module registry (Subject 6)

**📋 Detailed Action Items**: All specific implementation steps are documented in the resolved subjects above (lines 976-1765). Refer to each subject's "Action Items Added" section for granular tasks.

**Verification**:
- SceneStateService notifies registered listeners on state change
- Movement disabled during MATCH states (no jumping)
- Match area dome prevents exit from match area
- Grid overlay visible during match, hidden in overworld
- Camera smoothly transitions between overworld and match perspectives
- Mouse rotation disabled during match
- All match environment objects cleaned up on match end

---

## 🎯 What's Next

**Brainstorming session complete!** Iteration 0 marked 🎨 READY FOR IMPLEMENTATION.

**Architecture Decisions Summary**:
- ✅ Event-driven pattern using SceneStateService registry
- ✅ Distance-gated interaction + collision dome for match area
- ✅ Tactical grid system with coordinate mapping
- ✅ Minimal SceneStateService enhancement (register/unregister)
- ✅ Fixed camera with animated transitions
- ✅ Lightweight MatchModule as environment orchestrator

**REQUIRED NEXT STEP**: Use `/flow-implement-start` to begin implementation.

**Before implementing**: Review your action items (see brainstorming subjects above, lines 976-1765) and ensure you understand the scope. If you discover new issues during implementation (scope violations), STOP and discuss with the user before proceeding.

**Implementation Order Suggestion**:
1. Start with SceneStateService register/unregister (foundation for everything else)
2. Update KinematicMovementComponent to use state-based control
3. Implement camera enhancements (changeTarget, presets, mouse control)
4. Create MatchModule with state subscription
5. Build prefabs (MatchAreaDome, MatchGrid, MatchCameraAnchor)
6. Integrate everything in MatchModule enter/exit methods

---

### **Implementation - Iteration 0: Game Mode Controls & Visibility Management**

**Status**: 🚧 IN PROGRESS

**Action Items**: See resolved brainstorming subjects above (lines 976-1765):
- Subject 1: Movement Limitation (SceneStateService + KinematicMovementComponent)
- Subject 2: Match Area Definition (MatchAreaDome prefab + distance gating)
- Subject 3: Grid System (MatchGrid prefab + GridManagerService)
- Subject 4: Scene State/Mode Management (register/unregister implementation)
- Subject 5: Camera Control (changeTarget, presets, mouse control)
- Subject 6: Match Module Architecture (MatchModule orchestrator)

**Implementation Notes**:

[Work in progress - document changes here as you implement]

**Files Modified**:

[Will be filled as work progresses]

**Verification**:

Per Testing Strategy (lines 356-376): Manual integration testing
- Start dev server: `bun run dev`
- Test match creation flow
- Verify movement limitation during match states
- Verify camera transitions (overworld ↔ match)
- Verify dome/grid spawn and cleanup
- Verify mouse rotation disabled during match

---

##### Iteration 1: Match.vue State Machine ⏳

**Goal**: Implement main match view with LOBBY/IN_PROGRESS/FINISHED states

**Action Items**:
- [ ] Create `src/views/Match.vue`
- [ ] Implement state machine watching `match.store.matchState`
- [ ] LOBBY state: Render "Find PvE Match" button
- [ ] IN_PROGRESS state: Render BattleArena + GameActions + TurnTimer + GameLog (placeholders for now)
- [ ] FINISHED state: Render MatchResult (placeholder for now)
- [ ] Handle button click → call `createPveMatch()`
- [ ] Show loading spinner during match creation

**Verification**: Match.vue transitions between states correctly

---

##### Iteration 2: WebSocket Event Handler ⏳

**Goal**: Implement WebSocket handler for match events

**Action Items**:
- [ ] Create `src/composables/useMatchWebsocketHandler.ts`
- [ ] Listen for `'match created'` event
- [ ] Update `isConnectedToMatch = true` when event received
- [ ] Confirm `matchState` transitions to `IN_PROGRESS`
- [ ] Handle WebSocket timeout (no event after 5s) → show reconnect option
- [ ] Export handler to be used in Match.vue

**Verification**: WebSocket event triggers state update and confirms connection

---

##### Iteration 3: Error Handling UI ⏳

**Goal**: Implement user-friendly error handling

**Action Items**:
- [ ] Create error toast/notification component (or use existing Reka UI)
- [ ] Display HTTP error messages
- [ ] Display `success: false` error messages
- [ ] Handle missing matchId scenario
- [ ] Add "Retry" button for failed match creation
- [ ] Add "Reconnect" option for WebSocket timeout

**Verification**: Errors are displayed clearly and user can retry

---

## 🎯 What's Next

**Brainstorming session complete!** Phase 2 marked 🎨 READY FOR IMPLEMENTATION.

### Summary of Completed Work

✅ **All 4 subjects resolved**:
1. Match Request Flow (REST API → WebSocket confirmation pattern)
2. Match Creation Data (minimal payload, server-generated stats)
3. Initial Match State (HTTP response with full state structure)
4. Match Creation Confirmation (dual-signal: HTTP primary, WebSocket secondary)

✅ **Pre-implementation tasks completed**:
1. After-action hook in topsyde-utils (queueMicrotask timing)
2. Backend `/match/pve` endpoint refactored (MVC separation, full state in HTTP response)

✅ **Implementation tasks structured**:
- Task 1: Match State Management (2 iterations)
- Task 2: Match UI Components (3 iterations)

### REQUIRED NEXT STEP

**Use `/flow-implement-start` to begin implementation.**

### Before Implementing

1. **Review action items**: Ensure you understand the scope of each iteration
2. **Check dependencies**:
   - ⚠️ USER ACTION REQUIRED: Publish topsyde-utils and update server dependencies
   - ⚠️ USER ACTION REQUIRED: Test backend endpoint returns complete state
3. **Scope boundary**: If you discover new issues during implementation, STOP and discuss with user before proceeding

### Implementation Order

Start with **Task 1, Iteration 1** (Create Match Store):
- Foundation for all other work
- Simple, no external dependencies
- Can be verified independently

Then proceed to **Task 1, Iteration 2** (Match Creation Composable), then **Task 2** iterations.

---

### Phase 3: PvE Match Flow ⏳

**Status**: PENDING

**Purpose**: Understand player vs environment combat flow

**Key Concepts**:
- What triggers a PvE match?
- How is the NPC opponent selected/configured?
- What data does the client receive about the NPC?
- How does PvE differ from PvP (if at all)?

---

### Phase 4: Match Lifecycle Management ⏳

**Status**: PENDING

**Purpose**: Understand match state transitions and lifecycle

**Key Concepts**:
- What are the possible match states? (waiting, in-progress, paused, ended, etc.)
- What triggers state transitions?
- How does match completion work?
- What cleanup is needed when a match ends?

---

### Phase 5: Aborting/Leaving a Match ⏳

**Status**: PENDING

**Purpose**: Understand how players can exit matches gracefully

**Key Concepts**:
- Can players leave mid-match?
- What happens to match state when a player disconnects?
- Is there a forfeit mechanism?
- How are abandoned matches handled?

---

### Phase 6: Match Data & State Persistence ⏳

**Status**: PENDING

**Purpose**: Understand what match data needs to be stored and where

**Key Concepts**:
- What match data needs to persist across page refreshes?
- What data is temporary (session-only)?
- How does reconnection work?
- What match history is kept?

---

### Phase 7: WebSocket Event Registration ⏳

**Status**: PENDING

**Purpose**: Understand how the client subscribes to match-related events

**Key Concepts**:
- What WebSocket events exist for matches?
- When does the client register/unregister for events?
- How are events routed to the right handlers?
- What happens if events arrive out of order?

---

### Phase 8: Turn-Based Combat Flow ⏳

**Status**: PENDING

**Purpose**: Understand the turn-by-turn combat mechanics

**Key Concepts**:
- How are turns determined/sequenced?
- What can a player do on their turn?
- How does turn timing work?
- What happens when a turn ends?

---

### Phase 9: Combat Actions & Abilities ⏳

**Status**: PENDING

**Purpose**: Understand available player actions during combat

**Key Concepts**:
- What actions can players take? (attack, defend, special abilities, etc.)
- How are actions validated?
- What data is sent to server for an action?
- How does the client know if an action succeeded or failed?

---

### Phase 10: Damage Calculation & Health Updates ⏳

**Status**: PENDING

**Purpose**: Understand how damage is calculated and health changes

**Key Concepts**:
- Where is damage calculated? (client vs server)
- What factors affect damage?
- How are health updates communicated?
- How do buffs/debuffs work?

---

### Phase 11: Turn Timer System ⏳

**Status**: PENDING

**Purpose**: Understand time limits and countdown mechanics

**Key Concepts**:
- Is there a turn timer?
- How is timer state synchronized between client/server?
- What happens when time runs out?
- How does client-side interpolation work?

---

### Phase 12: Match Victory & Defeat Conditions ⏳

**Status**: PENDING

**Purpose**: Understand how matches end and winners are determined

**Key Concepts**:
- What are the win/loss conditions?
- How is match completion communicated?
- What end-of-match data is provided?
- How does the client transition out of combat?

---

### Phase 13: Match Result & Statistics ⏳

**Status**: PENDING

**Purpose**: Understand post-match data and statistics

**Key Concepts**:
- What statistics are tracked during a match?
- How are results calculated?
- What data is shown to the player after match ends?
- Are results persisted server-side?

---

### Phase 14: Combat Visualization (3D) ⏳

**Status**: PENDING

**Purpose**: Understand what needs to be visualized in 3D

**Key Concepts**:
- What visual elements represent the match state?
- How are characters/combatants displayed?
- What UI overlays are needed?
- How do visual effects sync with game state?

---

### Phase 15: Real-time State Synchronization ⏳

**Status**: PENDING

**Purpose**: Understand how client and server stay in sync

**Key Concepts**:
- What state is authoritative? (client vs server)
- How often does state sync occur?
- How are conflicts/desync handled?
- What happens during network lag?

---

### Phase 16: Error Handling & Edge Cases ⏳

**Status**: PENDING

**Purpose**: Understand failure modes and recovery

**Key Concepts**:
- What can go wrong during a match?
- How are errors communicated to the player?
- Can matches be recovered after errors?
- What validation exists?

---

### Phase 17: Mobile & Responsive Considerations ⏳

**Status**: PENDING

**Purpose**: Understand mobile-specific requirements

**Key Concepts**:
- How do touch controls work for combat?
- What UI adjustments are needed for mobile?
- How is performance optimized for mobile?
- Are there mobile-specific features or limitations?

---

### Phase 18: Integration & Testing ⏳

**Status**: PENDING

**Purpose**: Verify all match concepts work together

**Key Concepts**:
- How to test the full match flow end-to-end?
- What are the critical integration points?
- How to simulate various scenarios?
- What manual testing is required?

---

## Notes & Considerations

### From Old System Analysis

1. **Server Timing**: Server broadcasts `timer.update` every 250ms, client interpolates smoothly between updates
2. **Event Order**: Server guarantees `damage.dealt` is sent before `health.update` (rely on this ordering)
3. **ATB System**: Backend supports ATB mode, but V1 uses turn-based (ATB visualization is cosmetic)
4. **Authentication**: WebSocket uses `sec-websocket-protocol` header with `clientId-username` format
5. **Reconnection**: Pinia state persistence allows reconnect mid-match (server must support state sync)

### Potential Challenges

1. **Three.js Text Rendering**: TextGeometry is complex, consider HTML overlays for floating damage numbers (easier)
2. **Health Bar Synchronization**: Watch Pinia state carefully, avoid race conditions with multiple updates
3. **Timer Drift**: Client clock may drift from server, reset on each `timer.update` event
4. **Mobile Performance**: Three.js can be heavy on mobile, optimize geometry and materials
5. **State Transitions**: Match.vue state machine must handle edge cases (disconnect during transition)

### Future Enhancements (V2)

- **PvP Combat**: Matchmaking, player vs player battles
- **Advanced VFX**: Particle systems, screen shake, hit sparks, impact effects
- **Character Models**: Replace capsule placeholder with actual rigged character models
- **Animations**: Attack animations, idle animations, death animations
- **Sound Effects**: Hit sounds, ability sounds, victory music
- **Item System Integration**: Equip weapons/armor, use consumables during combat
- **Skill Customization**: Unlock and equip abilities, skill trees
- **Combat Modes**: Boss battles, team battles (2v2), tournament mode
- **Spectator Mode**: Watch other players' matches
- **Combat Replays**: Record and playback matches

---

## References

### Old System Files (src_deprecated)

**Pinia Store**:
- `src_deprecated/stores/match.store.ts` - Reference for GameState structure

**Composables**:
- `src_deprecated/composables/useMatch.ts` - Match lifecycle management
- `src_deprecated/components/match/useMatchWebsocketEventHandler.ts` - Event routing (502 lines)

**Vue Components**:
- `src_deprecated/views/Match.vue` - State machine (443 lines)
- `src_deprecated/components/match/BattleArena.vue` - 2D visualization (1244 lines)
- `src_deprecated/components/match/GameActions.vue` - Action buttons
- `src_deprecated/components/match/TurnTimer.vue` - Timer component
- `src_deprecated/components/match/MatchResult.vue` - Result screen
- `src_deprecated/components/match/GameLog.vue` - Combat log

**API**:
- `src_deprecated/api/match.api.ts` - REST API client (if exists)

### Analysis Documents (Generated)

- `/tmp/deprecated_match_system_analysis.md` - Comprehensive 8000+ word analysis
- `/tmp/deprecated_match_files_summary.md` - File paths and dependencies
- `/tmp/deprecated_event_flow_detailed.md` - 2500+ line step-by-step flow

### Backend Reference

- `server_rune_matchmaking/src/domains/match/` - Match controller and services
- `server_rune_matchmaking/src/domains/combat/` - Combat calculation logic
- `server_rune_matchmaking/src/domains/turn/` - Turn management
- `server_rune_matchmaking/CLAUDE.md` - Backend architecture documentation

### Framework Documentation

- `.flow/DEVELOPMENT_FRAMEWORK.md` - Flow framework patterns
- `client_rune_dictionary/CLAUDE.md` - Frontend architecture guide
- `web/CLAUDE.md` - Multi-service architecture overview

---

**End of Plan**
