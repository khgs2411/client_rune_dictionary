# Multiplayer System Usage Guide

This guide shows how to use the multiplayer system with `SyncMovementComponent`, `RemotePlayerComponent`, and `MultiplayerService`.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Scene                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              MultiplayerService                        │ │
│  │  • Manages WebSocket routing                           │ │
│  │  • Routes messages to/from components                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▲                                 │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐             │
│         │                                      │             │
│  ┌──────▼───────────┐              ┌──────────▼──────────┐  │
│  │  Local Player    │              │  Remote Player 1    │  │
│  │  GameObject      │              │  GameObject         │  │
│  │                  │              │                     │  │
│  │  • Transform     │              │  • Transform        │  │
│  │  • Mesh          │              │  • Mesh             │  │
│  │  • SyncMovement  │◄─sends pos───┤  • RemotePlayer    │  │
│  └──────────────────┘              └─────────────────────┘  │
│                                                              │
│                                     ┌─────────────────────┐ │
│                                     │  Remote Player 2    │ │
│                                     │  GameObject         │ │
│                                     │                     │ │
│                                     │  • Transform        │ │
│                                     │  • Mesh             │ │
│                                     │  • RemotePlayer    │ │
│                                     └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Add MultiplayerService to Scene

```typescript
// In your scene (e.g., PlaygroundScene.ts)
import { MultiplayerService } from '@/game/services/MultiplayerService';

export class PlaygroundScene extends GameScene<YourModuleRegistry> {
  protected services = {
    interaction: new InteractionService(),
    vfx: new VFXModule(),
    physics: new PhysicsService(),
    multiplayer: new MultiplayerService(), // Add this
  };
}
```

## Step 2: Create Local Player with SyncMovementComponent

```typescript
import { GameObject } from '@/game/GameObject';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { SyncMovementComponent } from '@/game/components/multiplayer/SyncMovementComponent';
import { useWebSocketStore } from '@/stores/websocket.store';

// Inside your scene's addSceneObjects() or similar:
const wsStore = useWebSocketStore();

const localPlayer = new GameObject({ id: 'local-player' })
  .addComponent(new TransformComponent({ position: [0, 1, 0] }))
  .addComponent(new GeometryComponent({ type: 'capsule', params: [0.3, 1.8, 8, 16] }))
  .addComponent(new MaterialComponent({ color: 0x00ff00 }))
  .addComponent(new MeshComponent())
  .addComponent(
    new SyncMovementComponent({
      playerId: wsStore.clientData?.id || 'unknown',
      updateRate: 100, // 10 updates/sec (default)
      positionThreshold: 0.1, // Only sync if moved > 0.1 units
      syncRotation: true, // Also sync rotation
    }),
  );

// Add to GameObjectManager
const gameObjects = this.getModule('gameObjects') as GameObjectManager;
gameObjects.add(localPlayer);
```

## Step 3: Create Remote Players with RemotePlayerComponent

```typescript
import { RemotePlayerComponent } from '@/game/components/multiplayer/RemotePlayerComponent';

// Listen for server event that sends list of players in area
// Example using RxJS (topsyde-utils)
const rx = useRxjs(['multiplayer']);

rx.$on('multiplayer', (event) => {
  if (event.cta === 'area.players') {
    const players = event.data as Array<{ id: string; username: string; position: [number, number, number] }>;

    players.forEach((player) => {
      // Skip local player
      if (player.id === wsStore.clientData?.id) return;

      // Create remote player GameObject
      const remotePlayer = new GameObject({ id: player.id })
        .addComponent(new TransformComponent({ position: player.position }))
        .addComponent(new GeometryComponent({ type: 'capsule', params: [0.3, 1.8, 8, 16] }))
        .addComponent(new MaterialComponent({ color: 0xff0000 })) // Different color for others
        .addComponent(new MeshComponent())
        .addComponent(
          new RemotePlayerComponent({
            playerId: player.id,
            username: player.username,
            initialPosition: player.position,
            interpolationSpeed: 0.1, // Smooth interpolation
          }),
        );

      gameObjects.add(remotePlayer);
    });
  }
});
```

## Step 4: Handle Player Leaving

```typescript
// Listen for player disconnect event
rx.$on('multiplayer', (event) => {
  if (event.cta === 'player.left') {
    const playerId = event.data.playerId;

    // Remove from GameObjectManager
    gameObjects.remove(playerId);
  }
});
```

## Advanced Usage

### Force Position Sync (Teleport, Respawn)

```typescript
// Get SyncMovementComponent from local player
const syncComp = localPlayer.getComponent(SyncMovementComponent);
if (syncComp) {
  syncComp.forceSync(); // Immediately sends position update
}
```

### Teleport Remote Player (No Interpolation)

```typescript
// Get RemotePlayerComponent
const remoteComp = remotePlayer.getComponent(RemotePlayerComponent);
if (remoteComp) {
  remoteComp.teleport(new Vector3(10, 1, 10)); // Instant position change
}
```

### Check if Remote Player is Moving (for animations)

```typescript
const remoteComp = remotePlayer.getComponent(RemotePlayerComponent);
if (remoteComp && remoteComp.isMoving()) {
  // Play walk animation
} else {
  // Play idle animation
}
```

### Detect Disconnected Players

```typescript
// Check time since last update
const remoteComp = remotePlayer.getComponent(RemotePlayerComponent);
if (remoteComp && remoteComp.getTimeSinceLastUpdate() > 5) {
  // Player hasn't sent update in 5 seconds - probably disconnected
  console.warn(`Player ${remoteComp.getUsername()} might be disconnected`);
}
```

### Change Update Rate at Runtime

```typescript
const syncComp = localPlayer.getComponent(SyncMovementComponent);
if (syncComp) {
  // Reduce bandwidth in crowded areas
  syncComp.setUpdateRate(200); // 5 updates/sec instead of 10

  // Increase responsiveness in combat
  syncComp.setUpdateRate(50); // 20 updates/sec
}
```

### Change Interpolation Speed

```typescript
const remoteComp = remotePlayer.getComponent(RemotePlayerComponent);
if (remoteComp) {
  // Smoother but more lag
  remoteComp.setInterpolationSpeed(0.05);

  // More responsive but jittery
  remoteComp.setInterpolationSpeed(0.3);
}
```

## Server-Side Implementation

Your server (in `server_rune_matchmaking`) should:

1. **Receive position updates** from clients:

```typescript
// Server receives message
{
  type: 'player.position',
  content: {
    playerId: 'player-123',
    position: { x: 10, y: 1, z: 5 },
    rotation: { x: 0, y: 1.57, z: 0 },
    timestamp: 1234567890
  }
}
```

2. **Broadcast to other players in same area**:

```typescript
// Server broadcasts to all clients in area except sender
clients.forEach((client) => {
  if (client.id !== senderId) {
    client.send({
      type: 'player.position',
      content: positionData,
    });
  }
});
```

3. **Send player list when client joins area**:

```typescript
// When player enters area
client.send({
  type: 'area.players',
  content: area.players.map((p) => ({
    id: p.id,
    username: p.username,
    position: p.position,
  })),
});
```

4. **Broadcast player left event**:

```typescript
// When player disconnects
clients.forEach((client) => {
  client.send({
    type: 'player.left',
    content: { playerId: disconnectedPlayerId },
  });
});
```

## WebSocket Message Flow

```
┌──────────────┐                  ┌──────────────┐                  ┌──────────────┐
│    Client    │                  │    Server    │                  │   Client 2   │
│ (Local)      │                  │  (Bun.js)    │                  │  (Remote)    │
└──────┬───────┘                  └──────┬───────┘                  └──────┬───────┘
       │                                  │                                  │
       │  1. player.position              │                                  │
       │  { id, pos, timestamp }          │                                  │
       ├─────────────────────────────────►│                                  │
       │                                  │                                  │
       │                                  │  2. Broadcast to area            │
       │                                  │  player.position                 │
       │                                  ├─────────────────────────────────►│
       │                                  │                                  │
       │                                  │  3. RemotePlayerComponent        │
       │                                  │     interpolates movement        │
       │                                  │                                  │
```

## Performance Tuning

### For 100 Players in Area

- **Update Rate**: 100ms (10 Hz) - Good balance
- **Position Threshold**: 0.1 units - Skip redundant updates
- **Interpolation Speed**: 0.1 - Smooth movement

**Bandwidth Estimate:**

- 10 updates/sec × 20 bytes/update = 200 bytes/sec per player
- 100 players × 200 bytes/sec = 20 KB/sec per client (totally manageable!)

### For Turn-Based Combat (Layering)

When entering combat, disable position syncing for non-combat players:

```typescript
// Entering combat
const syncComp = localPlayer.getComponent(SyncMovementComponent);
if (syncComp) {
  syncComp.setUpdateRate(1000); // 1 update/sec (minimal)
}

// Hide non-combat remote players
nonCombatPlayers.forEach((player) => {
  gameObjects.remove(player.id);
});
```

## Debugging

Enable WebSocket debugger in settings:

```typescript
const config = useGameConfigStore();
config.debug.showWebSocketDebugger = true; // Enable debug console
```

Check multiplayer service status:

```typescript
const multiplayer = context.services.multiplayer;
console.log('Remote players:', multiplayer.getRemotePlayerCount());
console.log('Player IDs:', multiplayer.getRemotePlayerIds());
console.log('Connected:', multiplayer.isReady());
```

## Next Steps

1. ✅ Add MultiplayerService to your scene
2. ✅ Create local player with SyncMovementComponent
3. ✅ Listen for server player list events
4. ✅ Create remote players with RemotePlayerComponent
5. ✅ Implement server-side broadcasting
6. 🚀 Test with multiple clients!

## Notes

- **Trust-based movement**: Server doesn't validate physics (client-authoritative)
- **Anti-cheat**: Server tracks positions for combat verification
- **Mobile-first**: Low bandwidth usage (20 KB/sec for 100 players)
- **Extensible**: Easy to add more sync data (health, animations, etc.)
- **Slim**: No over-engineering, just what you need
