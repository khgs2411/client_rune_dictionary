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

**Status**: 🚧 IN PROGRESS

**Brainstorming Status**: ✅ COMPLETE

**Note**: WebSocket connection bug moved to Phase 3 Task 1 for separate investigation. This task will continue with event integration design.

---

#### Implementation - Iteration 1: WebSocket Event Integration

**Status**: 🚧 IN PROGRESS (2025-11-01)

**Action Items**: See Action Items section below (derived from brainstorming subjects)

**Implementation Notes**:
[To be filled during work]

**Files Modified**:
[To be filled as work progresses]

**Verification**:
[To be filled - how work was verified]

---

#### Brainstorming Session - WebSocket Event Integration Strategy

**Focus**: Design WebSocket event handling, state management, and HUD integration for match loop

**Subjects to Discuss** (tackle one at a time):

1. ✅ **WebSocket Event Registration** - Who registers and how are events transmitted to UI components?
2. ✅ **WebSocket Event Structure** - What events does the matchmaking server send? Event naming conventions? Payload format?
3. ✅ **Match Store Schema** - What data needs to be stored in matchStore?
4. ✅ **HUD Data Binding** - How to connect reactive matchStore data to TurnTimer, StatusPanel, ActionBar components?
5. ✅ **Error Handling & Reconnection** - What happens if WebSocket disconnects during match? How to handle reconnection?
6. ✅ **State Synchronization** - How to ensure client state matches server state? What if events arrive out of order?

**Resolved Subjects**:

---

##### ✅ Subject 1: WebSocket Event Registration

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

(Consolidated from brainstorming resolutions by `/flow-brainstorm-review`)

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

**Event Registration & Routing**:
- [x] Register WebSocket match event handlers in match store (or dedicated service)
- [ ] Route incoming events to appropriate store mutation methods

**Event Documentation & Interfaces**:
- [x] Document core events as implemented: `match.turn.start`, `match.turn.end`, `match.atb.readiness.update`, `match.state.update`
- [ ] Create TypeScript interfaces for events as encountered
- [ ] Review server payloads during implementation and refine to remove unnecessary data

**Store Schema**:
- [x] Use existing `I_GameState` interface as baseline
- [ ] Add computed getters if components need derived data (e.g., time remaining from timestamp)
- [ ] Adjust schema if server events reveal mismatches during implementation

**Component Data Binding**:
- [ ] Each HUD component calls `useMatchStore()` and creates computed properties for needed data
- [ ] Use optional chaining for safety: `computed(() => matchStore.gameState?.timer.duration)`

**Happy Path Implementation**:
- [x] Implement happy path only (assume connection stays alive)
- [ ] Apply server events to store immediately without validation
- [x] Add basic console logging if connection drops (for debugging)
- [x] Add console logging during development to detect any ordering issues

**Future Work** (defer to separate iterations/tasks):
- [ ] Create future task for reconnection/error handling after core match loop is complete
- [ ] If desync bugs appear, revisit with sequence numbers or periodic full state sync

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
