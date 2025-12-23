# Sprite Sheet System Guide

This guide explains how to create animated sprite characters in RUNE using the streamlined sprite sheet system.

## Quick Start

### Single-Texture (All animations in one file)

```typescript
import { registerSpriteSheet, CharacterSprite } from '../game/sprites';

// 1. Register sprite sheet
registerSpriteSheet({
  id: 'knight',
  texture: '/sprites/knight.png',
  framesPerRow: 6,
  totalRows: 8,           // 2 animations × 4 directions
  size: [1, 1.5],
  directional: true,
  animations: [
    { name: 'idle', frameCount: 4, fps: 6 },
    { name: 'walk', frameCount: 6, fps: 10 },
  ],
  defaultAnimation: 'idle',
});

// 2. Create character
const knight = new CharacterSprite({
  id: 'knight-1',
  spriteSheetId: 'knight',
  position: [5, 0, 3],
  direction: 'down',
});
```

### Multi-Texture (Each animation in separate file)

```typescript
import { registerSpriteSheet, CharacterSprite } from '../game/sprites';

// 1. Register with texture array
registerSpriteSheet({
  id: 'mage',
  texture: [
    { id: 'idle', src: '/sprites/mage_idle.png' },
    { id: 'walk', src: '/sprites/mage_walk.png' },
    { id: 'attack', src: '/sprites/mage_attack.png' },
  ],
  framesPerRow: 8,
  totalRows: 4,           // 4 directions per file
  size: [1, 1.5],
  directional: true,
  animations: [
    { textureId: 'idle', name: 'idle', frameCount: 4, fps: 6 },
    { textureId: 'walk', name: 'walk', frameCount: 6, fps: 10 },
    { textureId: 'attack', name: 'attack', frameCount: 8, fps: 14, loop: false },
  ],
  defaultAnimation: 'idle',
});

// 2. Create character (same API!)
const mage = new CharacterSprite({
  id: 'mage-1',
  spriteSheetId: 'mage',
  position: [0, 0, 0],
});
```

---

## Controlling Animations

```typescript
const animator = character.getComponent(DirectionalSpriteAnimator);

// Play animations (direction is automatic)
animator.play('walk');    // Plays 'walk-down' since facing down
animator.play('idle');    // Plays 'idle-down'

// Change direction (animation updates automatically)
animator.setDirection('left');  // Now plays 'walk-left'

// Set direction from movement vector
animator.setDirectionFromVector(velocityX, velocityZ);

// Control playback
animator.pause();
animator.resume();
animator.stop();
```

---

## Sprite Sheet Layouts

### Single-Texture: 4-Directional Character

All animations in one file. Each animation takes 4 rows (down, left, right, up):

```
Row 0: idle-down   [frame0] [frame1] [frame2] [frame3]
Row 1: idle-left   [frame0] [frame1] [frame2] [frame3]
Row 2: idle-right  [frame0] [frame1] [frame2] [frame3]
Row 3: idle-up     [frame0] [frame1] [frame2] [frame3]
Row 4: walk-down   [frame0] [frame1] [frame2] [frame3] [frame4] [frame5]
Row 5: walk-left   [frame0] [frame1] [frame2] [frame3] [frame4] [frame5]
...
```

### Multi-Texture: Separate Files per Animation

Each animation in its own file. Each file has 4 rows (one per direction):

**mage_idle.png:**
```
Row 0: idle-down   [frame0] [frame1] [frame2] [frame3]
Row 1: idle-left   [frame0] [frame1] [frame2] [frame3]
Row 2: idle-right  [frame0] [frame1] [frame2] [frame3]
Row 3: idle-up     [frame0] [frame1] [frame2] [frame3]
```

**mage_walk.png:**
```
Row 0: walk-down   [frame0] [frame1] ... [frame5]
Row 1: walk-left   [frame0] [frame1] ... [frame5]
Row 2: walk-right  [frame0] [frame1] ... [frame5]
Row 3: walk-up     [frame0] [frame1] ... [frame5]
```

### Explicit Row Mapping

When your sprite sheet doesn't follow the standard sequential layout, use explicit `row` mapping:

```
Row 0: (unused)
Row 1: idle-right  [frame0] [frame1] ... [frame5]   <- We want this for idle
Row 2: (unused)
Row 3: (unused)
Row 4: walk-right  [frame0] [frame1] ... [frame5]   <- We want this for walk
Row 5-8: (other animations)
```

**Non-directional (simplest case):**
```typescript
registerSpriteSheet({
  id: 'player',
  texture: '/sprites/player.png',
  framesPerRow: 6,
  totalRows: 9,
  size: [1, 1.5],
  directional: false,  // No direction expansion
  animations: [
    { name: 'idle', row: 1, frameCount: 6, fps: 6 },   // Explicit row 1 (0-indexed)
    { name: 'walk', row: 4, frameCount: 6, fps: 10 },  // Explicit row 4 (0-indexed)
  ],
  defaultAnimation: 'idle',
});
```

**Directional with explicit rows:**
```typescript
registerSpriteSheet({
  id: 'player',
  texture: '/sprites/player.png',
  framesPerRow: 6,
  totalRows: 9,
  size: [1, 1.5],
  directional: true,
  animations: [
    // Idle: only 'right' direction available (left will auto-flip)
    { name: 'idle', row: 1, frameCount: 6, fps: 6, direction: 'right' },

    // Walk: only 'right' direction available (left will auto-flip)
    { name: 'walk', row: 4, frameCount: 6, fps: 10, direction: 'right' },
  ],
  defaultAnimation: 'idle',
});
```

**Mixed: some explicit, some sequential:**
```typescript
registerSpriteSheet({
  id: 'player',
  texture: '/sprites/player.png',
  framesPerRow: 6,
  totalRows: 12,
  size: [1, 1.5],
  directional: true,
  animations: [
    // Explicit row mapping for idle (only right direction)
    { name: 'idle', row: 1, frameCount: 6, fps: 6, direction: 'right' },

    // Sequential expansion for walk (all 4 directions starting at row 4)
    // Omit 'row' to use sequential calculation
    { name: 'walk', frameCount: 6, fps: 10 },  // Expands to rows 4,5,6,7
  ],
  defaultAnimation: 'idle',
});
```

---

## Configuration Reference

### `registerSpriteSheet(config)` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | string | required | Unique identifier |
| `texture` | string \| TextureSource[] | required | Single path or array of `{id, src}` |
| `framesPerRow` | number | required | Columns in sprite sheet |
| `totalRows` | number | required | Total rows in sprite sheet |
| `size` | [w, h] | required | Size in world units |
| `directional` | boolean | false | Has direction variants |
| `directionOrder` | SpriteDirection[] | ['down','left','right','up'] | Order of directions in sheet |
| `animations` | array | required | Animation definitions |
| `defaultAnimation` | string | 'idle' | Animation to auto-play |
| `anchor` | [x, y] | [0.5, 0] | Anchor point (0.5,0 = bottom-center) |

### Animation Definition

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | required | Animation name |
| `frameCount` | number | required | Frames in this animation |
| `fps` | number | required | Playback speed |
| `loop` | boolean | true | Loop animation |
| `textureId` | string | - | **Required for multi-texture**: references texture in array |
| `row` | number | - | Explicit row index (0-based). Overrides sequential calculation |
| `direction` | SpriteDirection | - | Direction this row represents (for directional sprites) |

### TextureSource (for multi-texture)

| Option | Type | Description |
|--------|------|-------------|
| `id` | string | Unique ID referenced by animations |
| `src` | string | Path to texture file |
| `columns` | number | Optional: override framesPerRow for this texture |
| `rows` | number | Optional: override totalRows for this texture |

---

## Helper Functions

### `registerMultiTextureCharacter()`

Quick way to register a character where each animation follows a naming pattern:

```typescript
import { registerMultiTextureCharacter } from '../game/sprites';

// Files: /sprites/hero_idle.png, /sprites/hero_walk.png, /sprites/hero_attack.png
registerMultiTextureCharacter('hero', '/sprites/hero', [
  { name: 'idle', frameCount: 4, fps: 6 },
  { name: 'walk', frameCount: 6, fps: 10 },
  { name: 'attack', frameCount: 8, fps: 14, loop: false },
]);
```

### `registerFullCharacter()`

Quick way to register a single-texture character with standard RPG animations:

```typescript
import { registerFullCharacter } from '../game/sprites';

// Registers: idle, walk, run, attack, hurt, death
registerFullCharacter('warrior', '/sprites/warrior.png', {
  size: [1, 1.5],
  framesPerRow: 8,
});
```

---

## How Multi-Texture Works

When you switch animations, the system automatically:

1. **Preloads all textures** on component init (for smooth playback)
2. **Swaps the texture** when animation changes to one using a different file
3. **Maintains direction** - if you're facing left, switching from `idle` to `walk` plays `walk-left`

```typescript
// Playing 'idle' (uses mage_idle.png)
animator.play('walk');  // Swaps to mage_walk.png, plays 'walk-down'
animator.setDirection('left');  // Still mage_walk.png, plays 'walk-left'
animator.play('attack');  // Swaps to mage_attack.png, plays 'attack-left'
```

---

## Direction Flip Fallback

When a direction isn't available, the animator automatically uses a mirrored version:

```typescript
// Sprite sheet only has 'right' direction
registerSpriteSheet({
  id: 'player',
  texture: '/sprites/player.png',
  framesPerRow: 6,
  totalRows: 9,
  size: [1, 1.5],
  directional: true,
  animations: [
    { name: 'idle', row: 1, frameCount: 6, fps: 6, direction: 'right' },
    { name: 'walk', row: 4, frameCount: 6, fps: 10, direction: 'right' },
  ],
});

// At runtime:
animator.setDirection('right');  // Uses 'idle-right', no flip
animator.setDirection('left');   // Uses 'idle-right' + flipX (auto-mirrored!)
```

**Fallback priority:**

1. Exact match: `walk-left`
2. Flip fallback: `walk-right` with `flipX = true`
3. Diagonal fallback: `walk-down-left` → `walk-down-right` flipped
4. Base animation: `walk` (no direction suffix)

**Checking flip state:**
```typescript
animator.isFlippedX();           // true if currently using flipped sprite
sprite.isFlippedX();             // Same, on SpriteComponent level
```

---

## Component Reference

### DirectionalSpriteAnimator

```typescript
const animator = gameObject.getComponent(DirectionalSpriteAnimator);

// Playback
animator.play('walk');      // Play animation (adds direction suffix, auto-flips if needed)
animator.stop();            // Stop and reset
animator.pause();           // Pause at current frame
animator.resume();          // Resume from pause

// Direction
animator.setDirection('left');                  // Auto-flips if 'left' not available
animator.setDirectionFromVector(vx, vz);        // 4-directional
animator.setDirectionFromVector(vx, vz, true);  // 8-directional
animator.getDirection();
animator.isFlippedX();      // Check if currently using flipped sprite

// State
animator.getIsPlaying();
animator.getCurrentAnimation();
animator.getCurrentFrame();
animator.hasAnimation('run');
animator.getAnimationNames();
animator.getAvailableDirections();
animator.isMultiTexture();   // Check if using multiple texture files
```

### SpriteComponent (Low-level)

```typescript
const sprite = gameObject.getComponent(SpriteComponent);

// Frame control
sprite.setFrame(5);
sprite.setFrameByPosition(2, 1);
sprite.getFrame();

// Texture swapping (for multi-texture)
await sprite.preloadTextures(['/path1.png', '/path2.png']);
sprite.swapTextureSync('/path1.png');  // Instant if preloaded
await sprite.swapTexture('/path2.png'); // Async if not preloaded
sprite.getCurrentTexturePath();
sprite.isTexturePreloaded('/path.png');

// Appearance
sprite.setOpacity(0.5);
sprite.setTint(0xff0000);
sprite.setSize(2, 3);

// Horizontal flip (used by animator for direction fallback)
sprite.setFlipX(true);   // Flip horizontally
sprite.setFlipX(false);  // Normal orientation
sprite.isFlippedX();     // Check current flip state
```

---

## Performance Tips

### Multi-Texture Sprites

- All textures are **preloaded on init**, so there's no loading delay when switching animations
- Texture swapping is instant via `swapTextureSync()` 
- Each texture file should be kept reasonably sized (1024×1024 or smaller for mobile)

### General Tips

- Use power-of-2 texture dimensions (256, 512, 1024)
- Keep frame counts reasonable (4-12 frames per animation)
- Share sprite sheets across identical characters (they reference the same cached textures)

---

## File Structure

```
src/game/
├── sprites.ts                          # Main exports (import from here)
├── common/
│   ├── sprite.types.ts                 # Base sprite types
│   └── spritesheet.types.ts            # Sprite sheet definition types
├── components/rendering/
│   ├── SpriteComponent.ts              # Base sprite rendering + texture swap
│   ├── BillboardComponent.ts           # Camera-facing
│   ├── SpriteAnimationComponent.ts     # Basic animation
│   └── DirectionalSpriteAnimator.ts    # Directional + multi-texture
├── prefabs/
│   ├── CharacterSprite.ts              # Registry-based prefab (recommended)
│   └── SpriteCharacter.ts              # Manual config prefab
└── utils/
    ├── SpriteSheetRegistry.ts          # Sprite sheet registry
    ├── spriteSheets.config.ts          # Your sprite definitions
    └── TextureCache.ts                 # Texture caching
```

---

## Migration Guide

### From Manual Animation Definitions

Before:
```typescript
new SpriteCharacter({
  id: 'knight',
  texture: '/sprites/knight.png',
  spriteSheet: { columns: 6, rows: 8 },
  animations: [
    { name: 'idle-down', startFrame: 0, endFrame: 3, fps: 6 },
    { name: 'idle-left', startFrame: 6, endFrame: 9, fps: 6 },
    // ... 16 more definitions ...
  ],
});
```

After (single texture):
```typescript
registerSpriteSheet({
  id: 'knight',
  texture: '/sprites/knight.png',
  framesPerRow: 6,
  totalRows: 8,
  directional: true,
  animations: [
    { name: 'idle', frameCount: 4, fps: 6 },
    { name: 'walk', frameCount: 6, fps: 10 },
  ],
});

new CharacterSprite({ id: 'knight-1', spriteSheetId: 'knight' });
```

After (multi texture):
```typescript
registerSpriteSheet({
  id: 'knight',
  texture: [
    { id: 'idle', src: '/sprites/knight_idle.png' },
    { id: 'walk', src: '/sprites/knight_walk.png' },
  ],
  framesPerRow: 6,
  totalRows: 4,
  directional: true,
  animations: [
    { textureId: 'idle', name: 'idle', frameCount: 4, fps: 6 },
    { textureId: 'walk', name: 'walk', frameCount: 6, fps: 10 },
  ],
});

new CharacterSprite({ id: 'knight-1', spriteSheetId: 'knight' });
```
