# Collision Wireframe Examples

Visual examples showing how to use `.withWireframe()` for collision debugging.

## Basic Example: Single Object

```typescript
// Show green wireframe around a box
context.services.collision
  .register('debug-box', boxMesh)
  .withBox()
  .static()
  .withWireframe() // Default green (0x00ff00)
  .build();
```

## Color-Coded Object Types

```typescript
// In your SceneModule

// Player - Green sphere
context.services.collision
  .register('player', playerMesh)
  .withSphere()
  .dynamic()
  .withWireframe(0x00ff00) // Green
  .build();

// Walls - Yellow boxes
const walls = ['wall-n', 'wall-s', 'wall-e', 'wall-w'];
walls.forEach((id, index) => {
  context.services.collision
    .register(id, wallMeshes[index])
    .withBox()
    .static()
    .withWireframe(0xffff00) // Yellow
    .build();
});

// Enemies - Red boxes
enemies.forEach((enemy, index) => {
  context.services.collision
    .register(`enemy-${index}`, enemy.mesh)
    .withBox()
    .dynamic()
    .withWireframe(0xff0000) // Red
    .build();
});

// Collectibles - Cyan spheres (no collision enforcement, just detection)
collectibles.forEach((item, index) => {
  context.services.collision
    .register(`item-${index}`, item.mesh)
    .withSphere()
    .dynamic()
    .withWireframe(0x00ffff) // Cyan
    .withCallbacks({
      onCollisionEnter: (other) => {
        if (other.id === 'player') {
          collectItem(item);
        }
      },
    })
    .build();
});
```

## Development vs Production

```typescript
// Toggle wireframes based on environment
const isDevelopment = import.meta.env.DEV;

context.services.collision
  .register('player', playerMesh)
  .withSphere()
  .dynamic()
  .withWireframe(isDevelopment ? 0x00ff00 : undefined) // Only in dev
  .build();

// Or use a debug flag
const showCollisionBounds = this.settings.debug?.showCollisionBounds ?? false;

if (showCollisionBounds) {
  context.services.collision
    .register('player', playerMesh)
    .withSphere()
    .dynamic()
    .withWireframe(0x00ff00)
    .build();
} else {
  context.services.collision.register('player', playerMesh).withSphere().dynamic().build();
}
```

## Dynamic Wireframe Colors (Advanced)

```typescript
// Change color based on collision state
export class EnemyModule extends SceneModule {
  private enemyId = 'enemy-1';

  async start(context: I_ModuleContext): Promise<void> {
    const enemyMesh = this.createEnemy();
    context.scene.add(enemyMesh);

    // Register with yellow wireframe initially
    context.services.collision
      .register(this.enemyId, enemyMesh)
      .withBox()
      .dynamic()
      .withWireframe(0xffff00) // Yellow when idle
      .withCallbacks({
        onCollisionEnter: (other) => {
          if (other.id === 'player') {
            // Unregister and re-register with red color
            this.updateWireframeColor(context, 0xff0000);
          }
        },
        onCollisionExit: (other) => {
          if (other.id === 'player') {
            // Back to yellow
            this.updateWireframeColor(context, 0xffff00);
          }
        },
      })
      .build();
  }

  private updateWireframeColor(context: I_ModuleContext, color: number): void {
    const collidable = context.services.collision.get(this.enemyId);
    if (!collidable) return;

    // Unregister and re-register with new color
    context.services.collision.unregister(this.enemyId);
    context.services.collision
      .register(this.enemyId, collidable.object3D)
      .withBox()
      .dynamic()
      .withWireframe(color)
      .build();
  }
}
```

## Visual Testing Scene

```typescript
// Create a test scene with all collision types visible

export class CollisionTestScene extends GameScene {
  protected addSceneObjects(): void {
    const objects = [
      // Box collision - Green
      {
        id: 'box-test',
        geometry: new BoxGeometry(2, 2, 2),
        position: [-5, 1, 0],
        color: 0x00ff00,
        shape: 'box' as const,
      },
      // Sphere collision - Blue
      {
        id: 'sphere-test',
        geometry: new SphereGeometry(1),
        position: [0, 1, 0],
        color: 0x0000ff,
        shape: 'sphere' as const,
      },
      // Static wall - Yellow
      {
        id: 'wall-test',
        geometry: new BoxGeometry(10, 3, 0.5),
        position: [0, 1.5, -5],
        color: 0xffff00,
        shape: 'box' as const,
        isStatic: true,
      },
    ];

    objects.forEach((obj) => {
      const mesh = new Mesh(obj.geometry, new MeshStandardMaterial({ color: obj.color }));
      mesh.position.set(...obj.position);
      context.scene.add(mesh);
      context.lifecycle.register(mesh);

      const builder = context.services.collision.register(obj.id, mesh);

      if (obj.shape === 'box') {
        builder.withBox();
      } else {
        builder.withSphere();
      }

      if (obj.isStatic) {
        builder.static();
      } else {
        builder.dynamic();
      }

      builder
        .withWireframe(obj.color) // Match mesh color
        .build();
    });
  }
}
```

## Comparison: Global vs Per-Object

```typescript
// Global debug draw (all objects same color)
protected services = {
  interaction: new InteractionService(),
  collision: new CollisionService({ debugDraw: true }), // All green
  vfx: new VFXModule(),
};

// Per-object wireframes (custom colors)
context.services.collision
  .register('player', playerMesh)
  .withSphere()
  .withWireframe(0x00ff00)  // Green player
  .build();

context.services.collision
  .register('enemy', enemyMesh)
  .withBox()
  .withWireframe(0xff0000)  // Red enemy
  .build();

// BEST: Mix both (global off, selective per-object)
protected services = {
  collision: new CollisionService({ debugDraw: false }), // Global off
};

// Only show wireframes for objects you're debugging
context.services.collision
  .register('problem-box', mesh)
  .withBox()
  .withWireframe(0xff00ff)  // Magenta highlight
  .build();
```

## Performance Note

Wireframes have minimal performance impact:

- Only updates when bounds change (object moves)
- Uses efficient LineSegments geometry
- Sphere wireframes: 3 circles with 32 segments each
- Box wireframes: 12 edges

Safe to leave enabled during development, but remove for production builds.
