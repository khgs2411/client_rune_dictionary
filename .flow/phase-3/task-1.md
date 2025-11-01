# Task 1: WebSocket Connection Bug

**Status**: ⏳ PENDING
**Phase**: [Phase 3 - Bug Fixes](../DASHBOARD.md#phase-3-bug-fixes)
**Purpose**: Resolve critical server-side WebSocket broadcast issue preventing match events from reaching client

---

## Task Overview

After a certain period of time (or after leaving and rejoining a match), match-related events stop being sent from the backend to the client, even though the WebSocket connection remains alive (ping/pong and non-match events continue working).

**Why This Task**: This is a blocking bug that prevents the match system from functioning. Without match events (`match.atb.readiness.update`, `match.turn.start`, `match.state.update`, etc.), the client cannot update the HUD or respond to game state changes.

**Dependencies**:

- **Blocks**: Task 2 - WebSocket Match Events & Match Loop System (Phase 2) - cannot implement event handling until events are being sent

**Estimated Complexity**: Medium (1-2 iterations expected)

---

## Iterations

### ⏳ Iteration 1: Diagnose and Fix Channel Broadcast Bug

**Goal**: Identify root cause and fix why match events stop being broadcast from server

**Status**: ⏳ PENDING

---

#### Action Items

- [ ] Restart backend server with added logging (channel membership + broadcast member count)
- [ ] Reproduce bug: leave match → start new match
- [ ] Analyze server logs to identify root cause:
  - Is client added to new channel successfully?
  - Does channel have correct member count when broadcasting?
  - Are broadcasts being called with correct channel ID?
- [ ] Implement fix based on findings
- [ ] Verify fix: repeat leave/rejoin cycle, confirm events arrive
- [ ] Document root cause and solution

---

## Task Notes

**Discoveries**: (To be filled during work)

**Decisions**: (To be filled during work)

**References**:

- Server logging added:
  - `server_rune_matchmaking/src/components/match/match.service.ts:133-138` (channel membership logging)
  - `server_rune_matchmaking/src/domains/match/match.broadcaster.ts:28` (broadcast with member count)
- Related files:
  - `server_rune_matchmaking/src/facades/channel.manager.ts` (channel management)
  - `server_rune_matchmaking/src/websocket/relay.ts` (WebSocket relay)
- Phase 2 Task 2 pre-implementation task documenting this issue

---

## Technical Considerations

**Issue Details** (from Phase 2 Task 2 pre-implementation investigation):

- **Symptom**: After a certain period of time (or after leaving and rejoining a match), match-related events are NOT being SENT from backend to client
- **Evidence**: Chrome DevTools shows events ARE NOT arriving at client (backend not sending)
- **Important Notes**:
  - WebSocket connection IS alive (ping/pong works, `client.leave.channel` events work)
  - Non-match events ARE being sent successfully
  - Only match-specific events (`match.atb.readiness.update`, `match.turn.start`, etc.) stop being sent

**Server-Side Components**:

- `MatchBroadcaster.broadcastToMatch()` - Gets channel and calls `channel.broadcast()`
- `Relay.GetChannel(matchId)` - Retrieves channel by match ID
- `Channel.addMember(client)` - Adds client to channel membership
- `Channel.broadcast(message, options)` - Sends to all members (excluding optional clients)

**Hypotheses to Test**:

1. Client not being added to new channel after leaving previous match
2. Channel being deleted but not recreated properly
3. Channel exists but has 0 members when broadcasting
4. Client WebSocket subscription state mismatched with server channel membership

**Debugging Code Added**:

- Server: `src/components/match/match.service.ts:133-138` - Logs client addition to channel with success/failure and member count
- Server: `src/domains/match/match.broadcaster.ts:28` - Logs broadcast attempts with channel member count
