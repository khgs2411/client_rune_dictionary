# Systems Deep-Dive

Systems are accessed via `context.getService(name)` and provide shared functionality across all GameObjects and SceneModules.

---

## InteractionSystem

Handles raycasting and user input events.

### Registration

```typescript
const interaction = context.getService('interaction');

interaction.register(mesh, {
  onClick: (event) => { /* handle click */ },
  onDoubleClick: (event) => { /* handle double click */ },
  onHoverStart: (mesh) => { /* cursor entered */ },
  onHoverEnd: (mesh) => { /* cursor left */ },
});
```

### Raycasting

The system automatically raycasts on mouse move and dispatches to registered handlers.

```typescript
// Manual raycast if needed
const hits = interaction.raycast(pointer);
```

### Layers

Objects can be excluded from raycasting:

```typescript
mesh.layers.set(LAYERS.NO_RAYCAST);
```

---

## PhysicsSystem

Facade over Rapier3D WASM physics engine.

**IMPORTANT**: Never use raw Rapier API. Always use PhysicsSystem.

### Static Bodies

For environment objects that don't move:

```typescript
const physics = context.getService('physics');

physics.registerStaticFromMesh(gameObject.id, mesh, {
  showDebug: true,  // Show wireframe collider
  colliderType: 'trimesh',  // or 'box', 'sphere', 'capsule'
});
```

### Kinematic Bodies

For objects you move programmatically (players, NPCs):

```typescript
physics.registerKinematic(gameObject.id, mesh, {
  colliderType: 'capsule',
  height: 1.8,
  radius: 0.3,
});

// Move kinematic body
physics.setKinematicPosition(gameObject.id, new Vector3(x, y, z));
```

### Collision Detection

```typescript
physics.onCollisionStart(gameObject.id, (other) => {
  console.log(`Collided with ${other.id}`);
});

physics.onCollisionEnd(gameObject.id, (other) => {
  console.log(`Stopped colliding with ${other.id}`);
});
```

### Debug Visualization

Toggle in gameConfig store:

```typescript
const gameConfig = useGameConfigStore();
gameConfig.showPhysicsDebug = true;
```

---

## VFXSystem

Visual effects management.

### Emissive Glow

```typescript
const vfx = context.getService('vfx');

// Apply glow
vfx.applyEmissive(mesh, 0xff0000, 0.5);  // color, intensity

// Remove glow
vfx.removeEmissive(mesh);

// Pulse effect
vfx.pulseEmissive(mesh, 0xff0000, {
  minIntensity: 0.2,
  maxIntensity: 0.8,
  duration: 1000,
});
```

### Camera Effects

```typescript
// Screen shake
vfx.cameraShake({
  intensity: 0.5,
  duration: 200,
  decay: true,
});

// Flash
vfx.screenFlash(0xffffff, 100);
```

### Particles

```typescript
const emitter = vfx.createParticleEmitter({
  position: new Vector3(0, 1, 0),
  count: 50,
  lifetime: 1000,
  color: 0xffff00,
  size: 0.1,
  velocity: new Vector3(0, 2, 0),
  spread: 0.5,
});

// Later
emitter.stop();
emitter.dispose();
```

### Tooltips

```typescript
vfx.showTooltip(mesh, 'Training Dummy', {
  offset: new Vector2(0, 50),
  duration: 3000,  // auto-hide
});

vfx.hideTooltip(mesh);
```

---

## SceneState

State machine for game flow.

### States

| State | Description |
|-------|-------------|
| `OVERWORLD` | Normal gameplay |
| `MATCH_REQUEST` | Combat target selected |
| `MATCH` | In active combat |
| `PAUSED` | Game paused |
| `DIALOGUE` | In conversation |

### API

```typescript
const state = context.getService('state');

// Transition
state.transition('MATCH_REQUEST');

// Query
if (state.current === 'OVERWORLD') { ... }

// Lifecycle hooks
state.onEnter('MATCH', () => {
  // Disable movement
  // Show combat UI
});

state.onExit('MATCH', () => {
  // Re-enable movement
  // Hide combat UI
});
```

### Guards

Prevent invalid transitions:

```typescript
state.addGuard('OVERWORLD', 'MATCH', () => {
  // Return false to block transition
  return player.health > 0;
});
```

---

## GameObjectsManager

Coordinates GameObject lifecycle.

### Adding Objects

```typescript
const manager = this.getModule('gameObjects') as GameObjectsManager;

const dummy = new TrainingDummy({ id: 'dummy-1', position: [5, 0, 0] });
manager.add(dummy);
```

### Querying

```typescript
// By ID
const obj = manager.get('dummy-1');

// By type
const dummies = manager.getByType(TrainingDummy);

// By tag
const enemies = manager.getByTag('enemy');
```

### Removal

```typescript
manager.remove('dummy-1');  // Calls destroy(), cleanup handled

manager.clear();  // Remove all
```

### Iteration

```typescript
manager.forEach((gameObject) => {
  gameObject.update(delta);
});
```