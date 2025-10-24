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

**Last Updated**: 2025-10-24

**Current Work**:
- **Phase**: [Phase 2 - Match Instantiation & Initialization](#phase-2-match-instantiation--initialization-) 🚧 IN PROGRESS (Brainstorming)
- **Task**: Not started (concept-based phases, no tasks yet)
- **Iteration**: Not started

**Completion Status**:
- Phase 1: ✅ 100% | Phases 2-18: ⏳ 0%

**Progress Overview**:
- ✅ **Phase 1**: Analysis & Planning (verified & frozen)
- 🚧 **Phase 2**: Match Instantiation & Initialization ← **YOU ARE HERE** (Brainstorming)
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

**Primary**: Manual integration testing with live WebSocket server
- Start matchmaking server (`bun run serve` in `server_rune_matchmaking`)
- Start frontend dev server (`bun run dev` in `client_rune_dictionary`)
- Test full combat flow from match creation to completion

**Secondary**: Simulation scripts for event handler logic
- Mock WebSocket events in composables/__test__/
- Verify Pinia state updates correctly for each event type
- Use Bun test runner (`bun test`)

**Focus**: Integration over unit tests (game development prioritizes end-to-end flow)

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

### Phase 1: Analysis & Planning ✅

**Status**: COMPLETE
**Completed**: 2025-10-19

**Purpose**: Understand old system, design new architecture, create development plan

**Completion Criteria**:
- Comprehensive analysis of deprecated match system completed ✅ (done via Task agent)
- Architecture design documented in PLAN.md ✅ (completed above)
- All phases, tasks, and iterations defined ✅ (below)
- Ready to begin Phase 2 implementation

---

#### Task 1: Analyze Deprecated System ✅

**Status**: COMPLETE
**Completed**: 2025-10-19

**Summary**: Used Task agent to explore `src_deprecated/` and generated comprehensive analysis documents:
- `deprecated_match_system_analysis.md` (8000+ words)
- `deprecated_match_files_summary.md` (file paths, dependencies)
- `deprecated_event_flow_detailed.md` (2500+ lines, step-by-step flow)

**Key Findings**:
- Server-authoritative turn-based/ATB hybrid
- 8 WebSocket event types
- Pinia + RxJS for state coordination
- Timer interpolation for smooth countdown
- Thin client architecture (no combat logic frontend)

---

#### Task 2: Design New Architecture ✅

**Status**: COMPLETE
**Completed**: 2025-10-19

**Summary**: Created architecture design above in this PLAN.md file.

**Deliverables**:
- High-level component diagram
- Data flow diagrams
- Module/Component breakdown for Three.js integration
- Event routing specification
- UI component hierarchy

---

### Phase 2: Match Instantiation & Initialization 🚧

**Status**: IN PROGRESS (Brainstorming)

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

#### ⏳ Task 1: Refactor Backend `/match/pve` Endpoint (PENDING)

**Objective**: Update backend endpoint to return full initial state in HTTP response instead of minimal data

**Why This Blocks Frontend**: Frontend implementation depends on receiving complete structured initial state (player, npc, turn, atb, timer) from the backend. Current endpoint returns minimal data, causing race conditions and requiring additional WebSocket events.

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
- [ ] Extract player participant data from `match.getParticipants()`
- [ ] Extract NPC participant data from `match.getParticipants()`
- [ ] Get turn state from `gameState.turnManager`
- [ ] Get ATB readiness from `gameState.atbManager`
- [ ] Structure response with `state` object containing player/npc/turn/atb/timer
- [ ] Update response format to use `success: true` and `data` wrapper
- [ ] Test endpoint returns complete state

**Files to Modify**:
- `server_rune_matchmaking/src/components/match/match.controller.ts` (pve method, lines 41-72)

**Estimated Time**: 30-60 minutes

---

### **Implementation Tasks:**

#### Task 1: Match State Management ⏳

**Purpose**: Create Pinia store and state management for match lifecycle

---

##### Iteration 1: Create Match Store ⏳

**Goal**: Implement Pinia store with persistence for match state

**Action Items**:
- [ ] Create `src/stores/match.store.ts`
- [ ] Define store structure: `{ currentMatchId, currentChannelId, channelName, matchState, isConnectedToMatch, gameState, matchResult }`
- [ ] Add `pinia-plugin-persistedstate` configuration
- [ ] Define TypeScript interfaces for state types (PlayerParticipant, NPCParticipant, TurnState, ATBState, TimerConfig, MatchResult)
- [ ] Export store composable

**Verification**: Store can be imported and state persists across page refreshes

---

##### Iteration 2: Match Creation Composable ⏳

**Goal**: Implement composable for creating PvE matches

**Action Items**:
- [ ] Create `src/composables/useMatchCreation.ts`
- [ ] Implement `createPveMatch()` function
- [ ] Make POST request to `/match/pve` with `whoami` payload
- [ ] Handle HTTP 200 OK → populate match.store.ts with response data
- [ ] Handle HTTP 4xx/5xx → show error message, stay in LOBBY
- [ ] Parse `success: false` responses and display error message
- [ ] Return loading state, error state, and success callback

**Verification**: Calling `createPveMatch()` successfully populates store and handles errors

---

#### Task 2: Match UI Components ⏳

**Purpose**: Create UI components for match flow

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
