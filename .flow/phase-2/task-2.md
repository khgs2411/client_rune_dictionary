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

### ⏳ Iteration 1: WebSocket Event Integration

**Goal**: Connect HUD to WebSocket match events and sync basic match state

**Status**: ⏳ PENDING

---

#### Action Items

- [ ] [TBD] - Define during brainstorming
- [ ] Subscribe to WebSocket match events (match.start, match.update, match.end)
- [ ] Update matchStore with incoming event data
- [ ] Connect TurnTimer to match.turnTimer events
- [ ] Connect StatusPanel HP/MP to character state updates
- [ ] Test real-time HUD updates with server events

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
