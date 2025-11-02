# Task 2: WebSocket Match Events & Match Loop System

**Status**: 🚧 IN PROGRESS
**Phase**: [Phase 2 - Combat System Reimplementation](../DASHBOARD.md#phase-2-combat-system-reimplementation)
**Purpose**: Connect Match HUD to real-time WebSocket events and implement the complete match loop (ATB system, turn system, action system)

---

## Task Overview

Build the complete match loop infrastructure by connecting the HUD components from Task 1 to live WebSocket events from the matchmaking server. Implement the ATB (Active Time Battle) system, turn-based action flow, and synchronize all HUD elements (timer, status bars, action bar) with server state.

**Why This Task**: Task 1 created the visual HUD with placeholder data. This task brings it to life by implementing the underlying match logic and real-time synchronization. Without this, the HUD is just static UI - players need actual turn-based combat with ATB timing, action execution, and state updates.

**Dependencies**:

- **Requires**: Task 1 (Match UI Components) - needs TurnTimer.vue, StatusPanel.vue, ActionBar.vue components
- **Blocks**: Future combat mechanics tasks - need working match loop before adding abilities, damage calculation, etc.

**Estimated Complexity**: High (4-5 iterations expected)

---

## Iterations

### 🚧 Iteration 1: WebSocket Event Integration

**Goal**: Connect HUD to WebSocket match events and sync basic match state

**Status**: 🚧 IMPLEMENTING

**Brainstorming Status**: ✅ COMPLETE

**Note**: WebSocket connection bug moved to Phase 3 Task 1 for separate investigation. This task will continue with event integration design.

---

#### Implementation - Iteration 1: WebSocket Event Integration

**Status**: 🚧 IMPLEMENTING (Started 2025-11-01)

**Action Items**: See consolidated Action Items section below

**Implementation Notes**:

- Created `useMatchState()` composable with 10 event handlers following MVC Service pattern
- Pinia store exposes composable as `gameState` - refs are auto-unwrapped at component level
- WebSocket routing uses switch/case with type casting (zero runtime overhead)
- Components access state via: `matchStore.gameState.player?.health` (optional chaining for safety)
- Excluded `client.leave.channel` event (handled in WebSocket store, not match-specific)
- ActionBar integration deferred - needs turn state awareness for button enabling/disabling

**Files Modified**:

- Created: `src/common/match-events.types.ts` (10 event interfaces + discriminated union)
- Created: `src/composables/useMatchState.ts` (composable with event handlers)
- Modified: `src/common/match.types.ts` (added readiness + timer fields)
- Modified: `src/stores/match.store.ts` (removed mutation methods, added routing, integrated composable)
- Modified: `src/components/match/TurnTimer.vue` (reads from gameState.timer)
- Modified: `src/components/match/MatchHUD.vue` (reads from gameState.player/npc for StatusPanel props)

**Verification**:

Manual testing with live WebSocket connection required - connect to matchmaking server and verify:

- TurnTimer updates from `match.state.update` events
- StatusPanel health bars update from `match.health.update` events
- StatusPanel ATB bars fill from `match.atb.readiness.update` events
- Turn state changes reflect in TurnTimer ("Your Turn" vs "Enemy Turn")

---

#### Brainstorming Session - WebSocket Event Integration Strategy (Extended)

**Focus**: Design WebSocket event handling, state management, and HUD integration for match loop

**Subjects to Discuss** (tackle one at a time):

1. ✅ **Message Handling Approach** - Class vs Composable vs Casting for WebSocketStructuredMessage processing
2. ✅ **Store Composable Pattern** - Should we create a composable for game state logic to keep Pinia store as simple blackboard?
3. ✅ **Interface Refactoring** - Now that we understand server events, do we refactor current interfaces?
4. ✅ **Store Architecture Alignment** - Do we change existing architecture to fit incoming events better?
5. ✅ **Server Event Structure Review** - Do server events need more data or are they structured well?

**Previous Initial Subjects** (first brainstorming round - all resolved):

- ✅ WebSocket Event Registration
- ✅ WebSocket Event Structure
- ✅ Match Store Schema
- ✅ HUD Data Binding
- ✅ Error Handling & Reconnection
- ✅ State Synchronization

**Resolved Subjects**:

---

##### ✅ Subject 1: Message Handling Approach

**Decision**: Use TypeScript interface casting (Option 3)

**Rationale**:

- Zero runtime overhead - casting is compile-time only, completely erased in JavaScript
- No object instantiation overhead (class would create objects per message)
- No Vue reactivity overhead (composable would set up refs/computed unnecessarily)
- Messages are processed once, extracted, and routed to store - no need for behavior or reactivity
- Type-safe with proper interfaces for each event payload

**Pattern**:

```ts
if (message.type === 'match.turn.start') {
  const payload = message as MatchTurnStartEvent;
  updateTurnState(payload.content);
}
```

**Resolution Items**: (Type D - Action Items)

- Create TypeScript interfaces for all 11 event types
- Use type guards for message routing (if/switch on message.type)
- Cast to specific event interface when handling each message type

---

##### ✅ Subject 2: Store Composable Pattern

**Decision**: Create `useMatchState()` composable for granular combat state (MVC Service pattern)

**Rationale**:

- **Separation of concerns**: Store handles high-level lifecycle (matchId, isMatchActive, matchState), composable handles granular combat data (health, ATB, turn, timer, logs)
- **Scale**: Handles tens of events/second without bloating store
- **Reactivity preserved**: Store exposes composable, components access via `computed(() => matchStore.gameState.atb)` - no overhead
- **Testability**: Composable logic testable without Pinia dependencies
- **MVC analogy**: Store = Controller, Composable = Service, Component = View
- **Single instance**: Composable only instantiated inside store, never called directly by components

**Pattern**:

```ts
// useMatchState.ts - composable with event handlers
export function useMatchState() {
  const player = ref<I_PlayerParticipant>();
  const npc = ref<I_NPCParticipant>();

  function handleHealthUpdate(content) { ... }
  function handleATBUpdate(content) { ... }

  return { player, npc, handleHealthUpdate, handleATBUpdate, ... };
}

// match.store.ts - store instantiates and exposes
const gameState = useMatchState();
return { matchId, matchState, gameState }; // gameState is composable
```

**Resolution Items**: (Type D - Action Items)

- Create `useMatchState()` composable with refs for player, npc, turn, atb, timer
- Create specific event handler methods in composable (handleHealthUpdate, handleATBUpdate, etc.)
- Update match store to instantiate composable once and expose as `gameState` property
- Route incoming WebSocket events from store to composable handlers

---

##### ✅ Subject 3: Interface Refactoring

**Decision**: Keep UI-friendly client interfaces, transform server payloads in composable handlers

**Rationale**:

- **Composable is the transformation layer** - absorbs server structure complexity
- **Single transformation point** - composable handlers transform once (e.g., ATB entityId map → player.readiness/npc.readiness)
- **Semantic store structure** - components read clean objects: `player.readiness`, not `atbData['27'].readiness`
- **Server structure irrelevant to UI** - event interfaces match server for type safety, but composable normalizes to UI-friendly refs
- **Components stay simple** - just `computed(() => matchStore.gameState.player.readiness)`

**Pattern**:

```ts
// Event interface matches server (type safety)
interface MatchATBUpdateEvent {
  content: {
    atbData: { [entityId: string]: { readiness: number } };
  };
}

// Composable transforms to UI-friendly structure
function handleATBUpdate(content) {
  player.value.readiness = content.atbData[player.value.entityId].readiness;
  npc.value.readiness = content.atbData[npc.value.entityId].readiness;
}

// Component consumes clean structure
const playerReadiness = computed(() => matchStore.gameState.player.readiness);
```

**Resolution Items**: (Type D - Action Items)

- Add missing timer fields to `I_TimerConfig`: `active`, `remaining`, `elapsed`, `percentage`
- Add `readiness` field to `I_PlayerParticipant` and `I_NPCParticipant` interfaces
- Rename turn fields if needed: `currentTurnEntityId`, `turnCounter` (or keep existing names)
- Transform ATB entityId map to player/npc readiness in composable handler

---

##### ✅ Subject 4: Store Architecture Alignment

**Decision**: Remove store mutation methods, route WebSocket events directly to composable handlers

**Rationale**:

- **Single responsibility**: Store = lifecycle (matchId, isMatchActive, matchState), Composable = combat state (player, npc, turn, atb, timer)
- **WebSocket is only data source**: All game state updates come from server events, no manual updates needed
- **Simpler mental model**: Thin routing layer `message.type → gameState.handleEvent(message.content)` without redundant wrapper methods
- **Unidirectional data flow**: Server → WebSocket → Composable → Components (components never mutate)
- **Dead code elimination**: Methods like `updatePlayerHealth()` would just call `gameState.handleHealthUpdate()` - no added value

**Pattern**:

```ts
// match.store.ts - thin routing only
websocket.register('match.store', {
  data: async (_ws, message) => {
    switch (message.type) {
      case 'match.health.update':
        gameState.handleHealthUpdate(message.content);
        break;
      case 'match.atb.readiness.update':
        gameState.handleATBUpdate(message.content);
        break;
    }
  },
});
```

**Exception**: Keep `setInitialMatchState()` for HTTP match creation response (lifecycle, not combat state)

**Resolution Items**: (Type D - Action Items)

- Remove redundant store methods: `updateGameState()`, `updatePlayerHealth()`, `updateNPCHealth()`, `updateTurnState()`, `updateATBState()`
- Keep lifecycle methods: `setInitialMatchState()`, `confirmMatchConnection()`, `endMatch()`, `leaveMatch()`, `$reset()`
- Implement WebSocket routing switch/case that maps event types to composable handlers
- Components read via computed properties, never call mutation methods

---

##### ✅ Subject 5: Server Event Structure Review

**Decision**: Accept server events as-is, no changes requested

**Rationale**:

- **Battle-tested structure**: Events come from working implementation that already existed
- **Full match loop coverage**: Events cover match lifecycle, turn flow, ATB updates, health/damage, and match results
- **Client-server control**: We control both sides - can add fields quickly if gaps discovered during implementation
- **YAGNI principle**: Don't request changes before discovering actual need
- **Faster iteration**: Start implementing immediately, discover needs organically

**Resolution Items**: (Type D - Action Items)

- Use current server event structure without modifications
- Document any missing data discovered during implementation for future server updates

---

##### ✅ Subject 1 (Initial): WebSocket Event Registration

**Decision**: Store-Level Registration (Option 2)

**Rationale**:

- Performance: Vue's reactivity batching means single store mutation triggers one render cycle vs multiple component handlers triggering separate renders
- Cleanup: Centralized handler registration/unregistration in store lifecycle
- Match store already has mutation methods ready (`updateATBState()`, `updateTurnState()`, etc.)
- Single source of truth prevents race conditions between component updates

**Action Items**:

- [ ] Register WebSocket match event handlers in match store (or dedicated service)
- [ ] Route incoming events to appropriate store mutation methods
- [ ] Components use computed properties to watch store state reactively

---

##### ✅ Subject 2: WebSocket Event Structure

**Decision**: Document as-needed with iterative refinement (Option 2 Extended)

**Rationale**:

- Start with core events needed for MVP (turn start/end, ATB updates, state changes)
- Document event types and payloads as we implement features that consume them
- Since we control the backend, refine event structure to be lean and optimized for client needs
- Avoid over-engineering upfront documentation for events we may not need

**Action Items**:

- [ ] Document core events as we implement: `match.turn.start`, `match.turn.end`, `match.atb.readiness.update`, `match.state.update`
- [ ] Review server payloads during implementation and refine to remove unnecessary data
- [ ] Create TypeScript interfaces for events as we encounter them

---

##### ✅ Subject 3: Match Store Schema

**Decision**: Use existing match store schema and refine as needed (Option 4)

**Rationale**:

- `match.store.ts` already has `I_GameState` with player, npc, turn, atb, timer structure
- Store already has mutation methods ready: `updateATBState()`, `updateTurnState()`, `updatePlayerHealth()`, etc.
- Zero upfront cost - start implementing immediately with existing structure
- Refine schema during implementation when gaps are discovered (aligns with Subject 2's as-needed approach)

**Action Items**:

- [ ] Use existing `I_GameState` interface as baseline
- [ ] Add computed getters if components need derived data (e.g., time remaining from timestamp)
- [ ] Adjust schema if server events reveal mismatches during implementation

---

##### ✅ Subject 4: HUD Data Binding

**Decision**: Direct store access with computed properties (Option 1)

**Rationale**:

- Simple and direct - no extra abstraction layers
- Minimal overhead aligns with performance focus
- Vue 3's computed properties are already optimized for reactive updates
- Components directly declare their data dependencies (clear and explicit)

**Action Items**:

- [ ] Each HUD component calls `useMatchStore()` and creates computed properties for needed data
- [ ] Use optional chaining for safety: `computed(() => matchStore.gameState?.timer.duration)`
- [ ] Components automatically re-render when their computed dependencies change

---

##### ✅ Subject 5: Error Handling & Reconnection

**Decision**: MVP approach - defer reconnection logic to later phase (Option 4)

**Rationale**:

- Focus on core match loop functionality first (Iteration 1 scope)
- Avoid complexity of state recovery and reconnection logic
- Assume stable connection for happy path implementation
- Reconnection/recovery can be added as separate task in future phase when core system is proven

**Action Items**:

- [ ] Implement happy path only (assume connection stays alive)
- [ ] Add basic console logging if connection drops (for debugging)
- [ ] Create future task for reconnection logic after core match loop is complete

---

##### ✅ Subject 6: State Synchronization

**Decision**: MVP approach - trust server events, add validation if issues arise (Option 5)

**Rationale**:

- Start simple: apply events as they arrive without ordering logic
- Since we control both client and server, can ensure proper event ordering at source
- Add synchronization complexity only if desync issues are discovered during testing
- Focus Iteration 1 on core functionality, not edge case handling

**Action Items**:

- [ ] Apply server events to store immediately without validation
- [ ] Add console logging during development to detect any ordering issues
- [ ] If desync bugs appear, revisit with sequence numbers or periodic full state sync

---

---

#### Action Items

(Consolidated from Resolution Items by `/flow-brainstorm-review` - 2025-11-01)

- [x] Create TypeScript interfaces for all 10 match event types in `src/common/match-events.types.ts`
- [x] Define discriminated union type for type-safe WebSocket message routing
- [x] Add timer fields to `I_TimerConfig` in `src/common/match.types.ts`: `active`, `remaining`, `elapsed`, `percentage`
- [x] Add `readiness: number` field to `I_PlayerParticipant` interface
- [x] Add `readiness: number` field to `I_NPCParticipant` interface
- [x] Update turn field names to match server: `currentTurnEntityId`, `turnCounter` (kept existing: `currentEntityId`, `number`)
- [x] Create `src/composables/useMatchState.ts` with refs for: `player`, `npc`, `turn`, `atb`, `timer`
- [x] Implement `handleMatchCreated(content)` in useMatchState - initialize match with player/npc data
- [x] Implement `handleMatchStateChange(content)` - update match lifecycle state
- [x] Implement `handleHealthUpdate(content)` - update player or npc health
- [x] Implement `handleATBUpdate(content)` - transform entityId map to player/npc readiness
- [x] Implement `handleTurnStart(content)` - update current turn entity and turn number
- [x] Implement `handleTurnEnd(content)` - clear turn state or reset
- [x] Implement `handleStateUpdate(content)` - sync timer, turn counter, current entity
- [x] Implement `handleDamageDealt(content)` - process damage event (logging only)
- [x] Implement `handleMatchVictory(content)` - process victory/defeat result
- [x] Implement `handleMatchEnd(content)` - finalize match state
- [x] Instantiate `useMatchState()` composable once in match.store.ts
- [x] Expose composable as `gameState` property in store return object
- [x] Remove redundant store methods: `updateGameState()`, `updatePlayerHealth()`, `updateNPCHealth()`, `updateTurnState()`, `updateATBState()`
- [x] Keep lifecycle methods: `setInitialMatchState()`, `confirmMatchConnection()`, `endMatch()`, `leaveMatch()`, `$reset()`
- [x] Implement WebSocket routing switch/case for 10 match events (excluded `client.leave.channel` - handled elsewhere)
- [x] Update `TurnTimer.vue` to read timer from `matchStore.gameState.timer` via computed
- [x] Update `MatchHUD.vue` to read player/npc data from `matchStore.gameState.player/npc` (StatusPanel uses props)
- [x] Use optional chaining in all computed properties: `computed(() => matchStore.gameState.player?.health)`
- [ ] Document any missing event data discovered during implementation (ActionBar turn state integration pending)

---

#### Event Documentation Reference

Provided manually by the user:

```ts
{
  "type": "match.state.change",
  "content": {
    "matchId": "ff270ad5-1e3a-450a-9434-89b117a286a7",
    "previousState": "READY",
    "currentState": "STARTING",
    "reason": "Creating game state",
    "timestamp": "2025-11-01T13:44:53.055Z"
  },
  "channel": "ff270ad5-1e3a-450a-9434-89b117a286a7",
  "timestamp": "2025-11-01T13:44:53.055Z"
}
{
  "client": {
    "id": "27",
    "name": "tal"
  },
  "type": "match.created",
  "content": {
    "matchId": "ff270ad5-1e3a-450a-9434-89b117a286a7",
    "channelName": "PVE Match(1)"
  },
  "channel": "ff270ad5-1e3a-450a-9434-89b117a286a7"
}
{
  "type": "match.atb.readiness.update",
  "content": {
    "matchId": "ff270ad5-1e3a-450a-9434-89b117a286a7",
    "atbData": {
      "27": {
        "readiness": 4.25531914893617
      },
      "npc_22c38734-9cf5-428e-af74-0dc7def7fb65": {
        "readiness": 1.7543859649122806
      }
    },
    "timestamp": "2025-11-01T13:44:53.160Z"
  },
  "channel": "ff270ad5-1e3a-450a-9434-89b117a286a7",
  "timestamp": "2025-11-01T13:44:53.160Z"
}
{
  "client": {
    "id": "27",
    "name": "tal"
  },
  "type": "client.leave.channel",
  "content": {
    "message": "You left the channel"
  },
  "channel": "ff270ad5-1e3a-450a-9434-89b117a286a7"
}
 {
  "type": "match.state.update",
  "content": {
    "matchId": "fb480022-447a-4165-a8e2-8421c71d8e7e",
    "gameState": {
      "currentTurnEntityId": "29",
      "turnCounter": 1,
      "timer": {
        "active": true,
        "remaining": 1659,
        "elapsed": 1341,
        "percentage": 44.7,
        "duration": 3000,
        "warningThreshold": 80,
        "fallbackAction": "pass"
      }
    },
    "timestamp": "2025-11-01T13:48:51.317Z"
  },
  "channel": "fb480022-447a-4165-a8e2-8421c71d8e7e",
  "timestamp": "2025-11-01T13:48:51.317Z"
}
{
  "type": "match.turn.start",
  "content": {
    "matchId": "fb480022-447a-4165-a8e2-8421c71d8e7e",
    "entityId": "29",
    "turnNumber": 1,
    "timestamp": "2025-11-01T13:48:49.977Z"
  },
  "channel": "fb480022-447a-4165-a8e2-8421c71d8e7e",
  "timestamp": "2025-11-01T13:48:49.977Z"
}
{
  "type": "match.turn.end",
  "content": {
    "matchId": "7a2802ee-aab5-48cc-9cd5-d4adbbb3da28",
    "entityId": "29",
    "turnNumber": 1,
    "timestamp": "2025-11-01T13:49:41.400Z"
  },
  "channel": "7a2802ee-aab5-48cc-9cd5-d4adbbb3da28",
  "timestamp": "2025-11-01T13:49:41.400Z"
}
{
  "type": "match.damage.dealt",
  "content": {
    "matchId": "5c8362cf-c36e-4d12-8478-cbb870653c62",
    "attackerId": "npc_c3d8b0c4-08d5-4dc9-b0cf-1eccc666b073",
    "targetId": "32",
    "damage": 33,
    "message": "AI Opponent attacks tal for 33 damage! tal health: 0 tal has been defeated!",
    "timestamp": "2025-11-01T14:10:26.563Z"
  },
  "channel": "5c8362cf-c36e-4d12-8478-cbb870653c62",
  "timestamp": "2025-11-01T14:10:26.566Z"
}
 {
  "type": "match.health.update",
  "content": {
    "matchId": "5c8362cf-c36e-4d12-8478-cbb870653c62",
    "entityId": "32",
    "health": 0,
    "maxHealth": 100,
    "timestamp": "2025-11-01T14:10:26.563Z"
  },
  "channel": "5c8362cf-c36e-4d12-8478-cbb870653c62",
  "timestamp": "2025-11-01T14:10:26.566Z"
}
{
  "type": "match.victory",
  "content": {
    "matchId": "5c8362cf-c36e-4d12-8478-cbb870653c62",
    "result": "victory",
    "winnerId": "npc_c3d8b0c4-08d5-4dc9-b0cf-1eccc666b073",
    "entityId": "npc_c3d8b0c4-08d5-4dc9-b0cf-1eccc666b073",
    "message": "AI Opponent attacks tal for 33 damage! tal health: 0 tal has been defeated!",
    "timestamp": "2025-11-01T14:10:26.563Z"
  },
  "channel": "5c8362cf-c36e-4d12-8478-cbb870653c62",
  "timestamp": "2025-11-01T14:10:26.566Z"
}
 {
  "type": "match.victory",
  "content": {
    "matchId": "5c8362cf-c36e-4d12-8478-cbb870653c62",
    "result": "defeat",
    "winnerId": "npc_c3d8b0c4-08d5-4dc9-b0cf-1eccc666b073",
    "entityId": "32",
    "message": "AI Opponent attacks tal for 33 damage! tal health: 0 tal has been defeated!",
    "timestamp": "2025-11-01T14:10:26.563Z"
  },
  "channel": "5c8362cf-c36e-4d12-8478-cbb870653c62",
  "timestamp": "2025-11-01T14:10:26.566Z"
}
{
  "type": "match.end",
  "content": {
    "matchId": "5c8362cf-c36e-4d12-8478-cbb870653c62",
    "winnerId": "npc_c3d8b0c4-08d5-4dc9-b0cf-1eccc666b073",
    "timestamp": "2025-11-01T14:10:26.563Z"
  },
  "channel": "5c8362cf-c36e-4d12-8478-cbb870653c62",
  "timestamp": "2025-11-01T14:10:26.566Z"
}
```

---

### 🚧 Iteration 1.5: MatchHUD Components UI Adjustment

**Goal**: Adjust MatchHUD component layout and styling based on testing feedback

**Status**: 🚧 IMPLEMENTING

---

#### Implementation - Iteration 1.5: MatchHUD Components UI Adjustment

**Status**: 🚧 IN PROGRESS (Started 2025-11-02)

**Action Items**: See consolidated action items and brainstorming subjects below

**Implementation Notes**:
- Starting with Turn Timer improvements (Subject 1)
- Will proceed sequentially through all 4 subject areas
- Manual testing required after each component modification

**Files Modified**:
[Will be updated as work progresses]

**Verification**:
Manual testing with live WebSocket connection to verify:
- Turn timer no longer blinks with smooth transitions
- ATB bars smoothly reach 100% with client prediction
- Turn timer counts down smoothly to 0 with client prediction
- Progress bar colors are consistent and reusable across components

---

#### Action Items

(Consolidated from Resolution Items by `/flow-brainstorm-review` - 2025-11-01)

**Turn Timer Improvements (Subject 1):**
- [ ] Import `watchThrottled` from VueUse in TurnTimer.vue
- [ ] Create throttled ref for `timeRemaining` (update max once per 500ms)
- [ ] Update computed properties to use throttled value instead of direct store access
- [ ] Change CSS transition from `duration-100` to `duration-500`
- [ ] Add `will-change: width` to progress bar element for rendering optimization

**ATB Progress Prediction (Subject 2):**
- [ ] Import `useRafFn` from VueUse for 60fps update loop
- [ ] Track last 2-3 server ATB updates with timestamps in StatusPanel or composable
- [ ] Calculate fill rate (readiness change / time delta) from server update history
- [ ] Create local predicted readiness refs for player and NPC (extrapolate between updates)
- [ ] Cap predicted values at 100% to prevent overshoot
- [ ] Sync predicted values to server values when `match.atb.readiness.update` arrives
- [ ] Bind StatusPanel ATB bars to predicted refs instead of direct store values

**Turn Timer Countdown Prediction (Subject 3):**
- [ ] Add local countdown ref in TurnTimer.vue (starts at duration when turn begins)
- [ ] Use `useRafFn` or `useInterval` from VueUse for local countdown loop
- [ ] Start countdown when `match.turn.start` detected (via watching turn state)
- [ ] Decrement local timer based on elapsed delta time
- [ ] Sync local timer to server `timer.remaining` when `match.state.update` arrives
- [ ] Add drift correction logic (blend if <1s difference, snap if ≥1s)
- [ ] Stop countdown when turn ends or timer reaches 0
- [ ] Bind display to local countdown ref instead of throttled server value

**Reusable Progress Bar Colors (Subject 4):**
- [ ] Create `src/composables/useProgressBarColor.ts` composable
- [ ] Define color stops for each bar type (health, mana, timer, atb)
- [ ] Return computed color based on percentage thresholds (e.g., >75% = healthy, 25-75% = warning, <25% = critical)
- [ ] Support both Tailwind class output (e.g., `'bg-primary'`) and inline style output (e.g., `'background: linear-gradient(...)'`)
- [ ] Update StatusPanel to use composable for HP/Mana bars
- [ ] Update TurnTimer to use composable for timer bar color
- [ ] Consider ATB bar color usage (may always be primary, or vary by readiness state)

---

#### Brainstorming Session - MatchHUD UI Improvements & Client Prediction

**Focus**: Fix visual issues and implement client-side prediction for smooth UI updates

**Subjects to Discuss** (tackle one at a time):

1. ✅ **Turn Timer UI Blinking Issue** - How to fix rapid blinking and improve visual appearance
2. ✅ **Client Prediction for ATB Progress** - ATB never reaches 100% due to server latency, need client-side interpolation
3. ✅ **Client Prediction for Turn Timer** - Timer doesn't drop to 0 due to server latency, need client-side countdown
4. ✅ **Reusable Gradient/Color Logic** - Extract HP bar gradient effect for reuse across mana, turn timer, and ATB bars

**Resolved Subjects**:

---

##### ✅ Subject 1: Turn Timer UI Blinking Issue

**Decision**: Use Value Stabilization + Transition Smoothing (Option A)

**Root Cause Analysis**:
- Rapid WebSocket updates (every 100-250ms) trigger unnecessary computed recalculations
- Short CSS transition duration (100ms) can't keep up with update frequency
- Component recalculates even when values haven't meaningfully changed (network jitter: 5001ms → 4998ms → 5002ms)
- Multiple derived computeds cascade from single timer update, potentially triggering multiple render cycles

**Solution Approach**:
- Use VueUse's `watchThrottled` to stabilize `timeRemaining` updates (max 1 update per 500ms)
- Increase CSS transition duration to `duration-300` or `duration-500` for smoother visual changes
- Add `will-change: width` CSS property to optimize browser rendering performance

**Resolution Items**:
- [ ] Import `watchThrottled` from VueUse in TurnTimer.vue
- [ ] Create throttled ref for `timeRemaining` (update max once per 500ms)
- [ ] Update computed properties to use throttled value instead of direct store access
- [ ] Change CSS transition from `duration-100` to `duration-500`
- [ ] Add `will-change: width` to progress bar element for rendering optimization

---

##### ✅ Subject 2: Client Prediction for ATB Progress

**Decision**: Use Predictive Extrapolation with Cap (Option 2)

**Problem**: ATB readiness bars never visually reach 100% due to server latency. Bars jump from ~95% to turn start, creating jarring UX.

**Solution Approach**:
- Calculate ATB fill rate using last 2-3 server updates (handles variable speed/tempo stats per character)
- Use VueUse's `useRafFn` for RAF-based smooth extrapolation at 60fps
- Extrapolate forward between server updates, capped at 100% to prevent overshoot
- Reset/sync to server value when new `match.atb.readiness.update` event arrives

**Why This Works**:
- ATB system has variable fill rates (different character speed/tempo from research/atb/)
- Accounts for different characters filling at different speeds
- 60fps smooth animation feels native
- Safe cap at 100% prevents prediction overshoot

**Resolution Items**:
- [ ] Import `useRafFn` from VueUse for 60fps update loop
- [ ] Track last 2-3 server ATB updates with timestamps in StatusPanel or composable
- [ ] Calculate fill rate (readiness change / time delta) from server update history
- [ ] Create local predicted readiness refs for player and NPC (extrapolate between updates)
- [ ] Cap predicted values at 100% to prevent overshoot
- [ ] Sync predicted values to server values when `match.atb.readiness.update` arrives
- [ ] Bind StatusPanel ATB bars to predicted refs instead of direct store values

---

##### ✅ Subject 3: Client Prediction for Turn Timer

**Decision**: Use Local Countdown with Server Sync (Option 1)

**Problem**: Turn timer countdown relies on server updates for remaining time. Due to network latency, timer never visually reaches 0 before turn ends (jumps from "2s" or "1s" to turn end).

**Solution Approach**:
- Start local countdown when `match.turn.start` event received
- Use VueUse's `useRafFn` or `useInterval` for smooth local countdown (can reuse RAF from Subject 2)
- Decrement local timer every second for display
- Sync/correct to server `timer.remaining` value when `match.state.update` arrives
- Handle correction gracefully (blend if difference is small, jump if large drift)

**Why This Works**:
- Turn timer is simpler than ATB (fixed duration, linear countdown)
- Gives immediate responsive feedback when turn starts
- Consistent with Subject 1's throttling approach (reduces server update noise)
- Reuses RAF pattern from Subject 2 (ATB prediction) for code consistency
- Server sync handles edge cases (pauses, time extensions) if added later

**Resolution Items**:
- [ ] Add local countdown ref in TurnTimer.vue (starts at duration when turn begins)
- [ ] Use `useRafFn` or `useInterval` from VueUse for local countdown loop
- [ ] Start countdown when `match.turn.start` detected (via watching turn state)
- [ ] Decrement local timer based on elapsed delta time
- [ ] Sync local timer to server `timer.remaining` when `match.state.update` arrives
- [ ] Add drift correction logic (blend if <1s difference, snap if ≥1s)
- [ ] Stop countdown when turn ends or timer reaches 0
- [ ] Bind display to local countdown ref instead of throttled server value

---

##### ✅ Subject 4: Reusable Gradient/Color Logic

**Decision**: Create Composable Function (Option 1)

**Problem**: HP bar gradient effect (green → yellow → red based on percentage) needs to be reused across multiple bars (health, mana, turn timer, ATB) but is currently hardcoded in one component.

**Solution Approach**:
- Create `useProgressBarColor(value, max, barType)` composable in `src/composables/`
- Returns computed reactive color classes or inline styles based on percentage
- Supports different bar types: `'health'`, `'mana'`, `'timer'`, `'atb'`
- Each type has its own color scheme (e.g., health: green→yellow→red, mana: blue→cyan→purple)
- Can return both Tailwind classes AND inline gradient styles for flexibility

**Why This Works**:
- Fits Vue 3 Composition API pattern already in use
- Reactive by default (works with computed values)
- Flexible output (Tailwind classes or inline styles)
- Easy to customize per bar type
- Centralized logic without forcing component abstraction
- Simple usage: `const barColor = useProgressBarColor(health, maxHealth, 'health')`

**Resolution Items**:
- [ ] Create `src/composables/useProgressBarColor.ts` composable
- [ ] Define color stops for each bar type (health, mana, timer, atb)
- [ ] Return computed color based on percentage thresholds (e.g., >75% = healthy, 25-75% = warning, <25% = critical)
- [ ] Support both Tailwind class output (e.g., `'bg-primary'`) and inline style output (e.g., `'background: linear-gradient(...)'`)
- [ ] Update StatusPanel to use composable for HP/Mana bars
- [ ] Update TurnTimer to use composable for timer bar color
- [ ] Consider ATB bar color usage (may always be primary, or vary by readiness state)

---

---

### ⏳ Iteration 2: Turn System Implementation

**Goal**: Implement turn-based action flow with 10-second countdown timer

**Status**: ⏳ PENDING

---

#### Action Items

- [ ] [TBD] - Define during brainstorming
- [ ] Implement turn start/end events
- [ ] Start 10-second countdown when turn begins
- [ ] Update TurnTimer component with countdown
- [ ] Handle turn timeout (auto-pass or default action)
- [ ] Disable/enable ActionBar based on turn state
- [ ] Test turn flow (player turn → enemy turn → repeat)

---

### ⏳ Iteration 3: ATB System Implementation

**Goal**: Implement Active Time Battle progress tracking and turn order calculation

**Status**: ⏳ PENDING

---

#### Action Items

- [ ] [TBD] - Define during brainstorming
- [ ] Implement ATB progress calculation (0-100% fill)
- [ ] Update StatusPanel ATB bars with character progress
- [ ] Calculate turn order based on ATB completion
- [ ] Emit ATB updates to server
- [ ] Test ATB bar visual updates

---

### ⏳ Iteration 4: Action System Implementation

**Goal**: Implement action execution and communicate with server

**Status**: ⏳ PENDING

---

#### Action Items

- [ ] [TBD] - Define during brainstorming
- [ ] Connect ActionBar buttons to action handlers
- [ ] Send action events to server (attack, pass, run)
- [ ] Handle action responses from server
- [ ] Update HUD based on action results (HP changes, status effects)
- [ ] Implement action validation (can't act on enemy turn)
- [ ] Test action flow end-to-end

---

## Task Notes

**Discoveries**: (To be filled during work)

**Decisions**: (To be filled during work)

**References**:

- Task 1 HUD components: `src/components/match/MatchHUD.vue`, `TurnTimer.vue`, `StatusPanel.vue`, `ActionBar.vue`
- WebSocket integration: `src/composables/useWebSocketConnection.ts`
- Match store: `src/stores/match.store.ts` (may need updates)
- ATB research: `research/atb/` directory
- Server match events: Check matchmaking server documentation

---

## Technical Considerations

**ATB System** (from research):

- ATB progress fills 0% → 100% based on character speed/tempo
- When ATB reaches 100%, character's turn begins
- Turn timer starts (10 seconds countdown)
- Player must choose action before timeout

**Turn Flow**:

1. ATB bars fill for all characters
2. First character to reach 100% gets turn
3. Turn timer starts (10s countdown)
4. Player/AI chooses action
5. Action executes, updates sent to server
6. Turn ends, ATB resets for that character
7. Repeat

**WebSocket Event Structure** (anticipated):

- `match.start` - Match begins, initial state
- `match.update` - State updates (HP, ATB, status)
- `match.turnStart` - Character turn begins
- `match.turnEnd` - Turn ends
- `match.action` - Action executed
- `match.end` - Match complete

**State Synchronization**:

- Server is source of truth
- Client HUD reflects server state
- Optimistic updates for player actions
- Rollback if server rejects action
