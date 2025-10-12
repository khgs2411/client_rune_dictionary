# CollisionService Usage Guide

The CollisionService provides automatic collision detection and boundary enforcement for Three.js objects in your scene.

## Basic Concept

1. **Mark objects as "collidable"** using the fluent builder API
2. **Objects with collision automatically enforce boundaries** - they push each other apart when overlapping
3. **Static vs Dynamic** - Static objects are immovable walls, dynamic objects can be pushed
4. **Optional wireframe visualization** - See collision bounds per-object with custom colors

## Quick Start

### Example 1: Static Wall (Immovable)

```typescript
// In your SceneModule's start() method
async start(context: I_ModuleContext): Promise<void> {
  const wallMesh = new Mesh(new BoxGeometry(4, 2, 1), new MeshStandardMaterial());
  wallMesh.position.set(0, 1, -5);
  context.scene.add(wallMesh);
  context.lifecycle.register(wallMesh);

  // Register collision - this object will NOT move when hit
  context.services.collision
    .register('wall-1', wallMesh)
    .withBox()        // Use AABB box collision (fastest)
    .static()         // Immovable
    .build();         // Complete registration

  this.initialized(context.sceneName);
}
```

### Example 2: Dynamic Player (Movable)

```typescript
// In your CharacterMeshModule
async start(context: I_ModuleContext): Promise<void> {
  const playerMesh = new Mesh(new SphereGeometry(0.5), new MeshStandardMaterial());
  context.scene.add(playerMesh);
  context.lifecycle.register(playerMesh);

  // Register collision - this object WILL be pushed by collisions
  context.services.collision
    .register('player', playerMesh)
    .withSphere()     // Use sphere collision (good for characters)
    .dynamic()        // Can be pushed
    .withCallbacks({
      onCollisionEnter: (other) => {
        console.log('Player hit:', other.id);
      },
    })
    .build();

  this.initialized(context.sceneName);
}
```

## Complete API Reference

### Shape Types

```typescript
// AABB Box (fastest, recommended for most objects)
.withBox()

// Sphere (fast, good for round objects and characters)
.withSphere()
```

### Static vs Dynamic

```typescript
// Static - Object never moves (walls, obstacles)
.static()

// Dynamic - Object can be pushed by collisions (players, NPCs, items)
.dynamic()
```

### Collision Layers

Use layers to control which objects collide with each other:

```typescript
// Player on layer 1 (binary: 0001)
context.services.collision
  .register('player', playerMesh)
  .withBox()
  .withLayer(0b0001) // Binary notation
  .build();

// Walls on layers 1 and 2 (binary: 0011)
// This wall collides with both layer 1 (players) and layer 2 (enemies)
context.services.collision.register('wall', wallMesh).withBox().withLayer(0b0011).static().build();

// Enemies on layer 2 only (binary: 0010)
// This enemy only collides with walls, NOT with players
context.services.collision.register('enemy', enemyMesh).withBox().withLayer(0b0010).build();
```

**Layer logic:** Objects collide if `(layer1 & layer2) !== 0`

### Wireframe Visualization

Show collision bounds for specific objects:

```typescript
// Green wireframe (default)
context.services.collision
  .register('player', playerMesh)
  .withSphere()
  .withWireframe() // Shows green collision bounds
  .build();

// Custom color wireframe
context.services.collision
  .register('enemy', enemyMesh)
  .withBox()
  .withWireframe(0xff0000) // Red wireframe
  .build();

// Multiple colored wireframes for different object types
context.services.collision
  .register('player', playerMesh)
  .withSphere()
  .withWireframe(0x00ff00) // Green for player
  .build();

context.services.collision
  .register('wall', wallMesh)
  .withBox()
  .static()
  .withWireframe(0xffff00) // Yellow for walls
  .build();

context.services.collision
  .register('enemy', enemyMesh)
  .withBox()
  .withWireframe(0xff0000) // Red for enemies
  .build();
```

**Notes:**

- Per-object wireframes work independently of global `debugDraw`
- Wireframes update automatically as objects move
- Use different colors to distinguish object types
- Sphere collision shows 3 rings (XY, XZ, YZ planes)

### Collision Callbacks

```typescript
context.services.collision
  .register('npc', npcMesh)
  .withBox()
  .dynamic()
  .withCallbacks({
    // Called once when collision starts
    onCollisionEnter: (other) => {
      console.log(`NPC collided with: ${other.id}`);
    },

    // Called every frame while colliding
    onCollisionStay: (other) => {
      // Example: Push objects apart faster
    },

    // Called once when collision ends
    onCollisionExit: (other) => {
      console.log(`NPC stopped colliding with: ${other.id}`);
    },
  })
  .build();
```

### Bounds Customization

```typescript
import { Vector3 } from 'three';

context.services.collision
  .register('custom', mesh)
  .withBox()
  .withBoundsScale(1.2) // Make collision bounds 20% larger
  .withBoundsOffset(new Vector3(0, 0.5, 0)) // Offset bounds upward
  .build();
```

## Complete Example: Scene with Player and Walls

```typescript
// In SceneObjectsModule.ts (or similar)
export class SceneObjectsModule extends SceneModule implements I_SceneModule {
  private meshes: Mesh[] = [];

  async start(context: I_ModuleContext): Promise<void> {
    // Create walls
    const wallConfigs = [
      { id: 'wall-north', pos: [0, 1, -10] },
      { id: 'wall-south', pos: [0, 1, 10] },
      { id: 'wall-east', pos: [10, 1, 0] },
      { id: 'wall-west', pos: [-10, 1, 0] },
    ];

    wallConfigs.forEach(({ id, pos }) => {
      const wall = new Mesh(
        new BoxGeometry(2, 2, 20),
        new MeshStandardMaterial({ color: 0x808080 }),
      );
      wall.position.set(pos[0], pos[1], pos[2]);
      context.scene.add(wall);
      context.lifecycle.register(wall);
      this.meshes.push(wall);

      // Register as static collidable
      context.services.collision.register(id, wall).withBox().static().build();
    });

    // Create dynamic obstacles (can be pushed)
    const boxMesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshStandardMaterial({ color: 0xff0000 }),
    );
    boxMesh.position.set(5, 0.5, 0);
    context.scene.add(boxMesh);
    context.lifecycle.register(boxMesh);
    this.meshes.push(boxMesh);

    context.services.collision
      .register('red-box', boxMesh)
      .withBox()
      .dynamic()
      .withCallbacks({
        onCollisionEnter: (other) => {
          console.log('Red box hit:', other.id);
        },
      })
      .build();

    this.initialized(context.sceneName);
  }

  async destroy(): Promise<void> {
    // Unregister collisions
    context.services.collision.unregister('wall-north');
    context.services.collision.unregister('wall-south');
    context.services.collision.unregister('wall-east');
    context.services.collision.unregister('wall-west');
    context.services.collision.unregister('red-box');
  }
}
```

## Integrating with Character Controller

To make your character respect collision boundaries, you need to register the character mesh:

```typescript
// In CharacterMeshModule.ts
export class CharacterMeshModule extends SceneModule implements I_SceneModule {
  private characterMesh!: Mesh;

  async start(context: I_ModuleContext): Promise<void> {
    // Create character mesh
    this.characterMesh = new Mesh(
      new CapsuleGeometry(0.3, 1.0),
      new MeshStandardMaterial({ color: 0x00ff00 }),
    );
    context.scene.add(this.characterMesh);
    context.lifecycle.register(this.characterMesh);

    // Register collision for character
    context.services.collision
      .register('player', this.characterMesh)
      .withSphere() // Sphere is good for characters
      .dynamic() // Player can be pushed by collisions
      .withLayer(0b0001) // Player layer
      .withCallbacks({
        onCollisionEnter: (other) => {
          // Play collision sound, show damage, etc.
          console.log('Player collided with:', other.id);
        },
      })
      .build();

    this.initialized(context.sceneName);
  }

  update(delta: number): void {
    // Sync character mesh with character controller position
    const pos = this.characterController.getPosition();
    this.characterMesh.position.copy(pos);
    this.characterMesh.position.y = 1; // Adjust height

    // Collision service automatically enforces boundaries each frame!
    // If character walks into a wall, the mesh gets pushed back
  }

  async destroy(): Promise<void> {
    context.services.collision.unregister('player');
  }
}
```

## Debug Visualization

To see collision bounds (green wireframe boxes):

```typescript
// In GameScene constructor or config
protected services = {
  interaction: new InteractionService(),
  collision: new CollisionService({ debugDraw: true }), // Enable debug
  vfx: new VFXModule(),
};

// Or toggle at runtime
this.services.collision.setDebugDraw(true);
```

## Common Patterns

### Pattern 1: Room with Walls

```typescript
// Create 4 walls around the player
const roomSize = 20;
const wallHeight = 3;
const wallThickness = 0.5;

// North wall
context.services.collision.register('wall-n', northWallMesh).withBox().static().build();

// Repeat for south, east, west...
```

### Pattern 2: NPC that Avoids Player

```typescript
// NPC on different layer than player
context.services.collision
  .register('npc', npcMesh)
  .withSphere()
  .dynamic()
  .withLayer(0b0010) // Layer 2
  .withCallbacks({
    onCollisionEnter: (other) => {
      if (other.id === 'player') {
        // Move away from player
        this.npcAI.flee(other.object3D.position);
      }
    },
  })
  .build();
```

### Pattern 3: Collectible Items (No Boundary Enforcement)

If you want to detect collision but NOT push objects apart, use the interaction service instead:

```typescript
// Use InteractionService for non-physical interactions
context.services.interaction
  .register('coin', coinMesh)
  .withHoverGlow()
  .withClickVFX('COLLECTED!')
  .build();

// CollisionService is for physical boundaries only!
```

## Performance Tips

1. **Use layers aggressively** - Reduces collision checks
2. **Prefer boxes over spheres** - AABB is faster
3. **Use static for immovable objects** - Saves computation
4. **Limit dynamic objects** - Each dynamic object increases checks

## Troubleshooting

### Objects pass through each other

- Make sure both objects are registered with collision
- Check layer compatibility: `(layer1 & layer2) !== 0`
- Increase `boundsScale` if collision bounds are too small
- Enable debug draw to visualize bounds

### Character gets stuck

- Character might be colliding with ground - use layers to exclude ground
- Reduce `boundsScale` to make collision bounds smaller
- Check for overlapping static objects at spawn point

### Performance issues

- Too many dynamic objects - consider making some static
- Use spatial partitioning (not implemented yet, but planned)
- Reduce collision checks with layer filtering
