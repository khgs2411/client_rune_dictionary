# Product Requirements Document
## RUNE RPG - Top-Down Camera Pivot (Realm of the Mad God Style)

**Version:** 2.0  
**Date:** December 21, 2025  
**Status:** Ready for Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Goals](#2-project-goals)
3. [What Changes vs What Stays](#3-what-changes-vs-what-stays)
4. [Technical Specifications](#4-technical-specifications)
5. [Camera System Modifications](#5-camera-system-modifications)
6. [Character Movement Modifications](#6-character-movement-modifications)
7. [New Sprite System](#7-new-sprite-system)
8. [Combat Modal System](#8-combat-modal-system)
9. [Asset Requirements](#9-asset-requirements)
10. [Implementation Phases](#10-implementation-phases)
11. [File Change Summary](#11-file-change-summary)
12. [Testing & Validation](#12-testing--validation)

---

## 1. Executive Summary

### 1.1 The Pivot

Transform the current third-person RPG client into a **top-down action RPG** inspired by Realm of the Mad God:

- Fixed top-down camera locked to player
- Screen-relative WASD movement
- 2D pixel/stylized sprites for all entities
- 3D ground plane with simple geometry
- Modal-based turn combat (ATB system preserved)
- Full multiplayer support retained

### 1.2 Visual Reference

**Target Aesthetic:** Realm of the Mad God meets vibrant cel-shaded colors
- Top-down ~70° camera angle
- Pixel art sprites (characters, enemies, props)
- Clean, readable, colorful
- Simple tiled or textured ground

### 1.3 Why This Approach

| Aspect | Benefit |
|--------|---------|
| **Preserves framework** | GameScene, Engine, all services stay intact |
| **Minimal code changes** | Only camera lock + movement direction changes |
| **Mobile-friendly** | Top-down + WASD maps perfectly to virtual joystick |
| **Low asset barrier** | 2D sprites are fast to create/generate |
| **Combat untouched** | Same ATB system, just displayed in modal |

### 1.4 Estimated Effort

**~2-3 weeks** for a solo developer (vs 4+ weeks for FPS approach)

---

## 2. Project Goals

### 2.1 Primary Goals

1. **Lock camera to top-down view** - Fixed angle, follows player
2. **Screen-relative movement** - W=up, S=down, A=left, D=right
3. **Sprite-based entities** - 2D billboard sprites for all characters/objects
4. **Combat modal overlay** - Turn-based ATB in Vue overlay
5. **Preserve multiplayer** - See other players as sprites

### 2.2 Non-Goals (Out of Scope for MVP)

- Procedural world generation
- Inventory/equipment system
- Complex NPC AI
- Multiple zones/areas
- Chat system

### 2.3 Success Criteria

- [ ] Camera locked at top-down angle, follows player smoothly
- [ ] WASD moves player in screen directions (W=up on screen)
- [ ] Sprites render and billboard correctly
- [ ] Enemies can be clicked/approached to trigger combat
- [ ] Combat modal displays with full ATB functionality
- [ ] Combat resolves and returns to world
- [ ] Other players visible as sprites
- [ ] Mobile joystick works with new movement

---

## 3. What Changes vs What Stays

### 3.1 STAYS EXACTLY AS-IS (No Changes)

| Category | Files | Reason |
|----------|-------|--------|
| **Engine** | `Engine.ts` | Core Three.js setup unchanged |
| **Scene Framework** | `GameScene.ts`, `ModuleRegistry.ts`, `CleanupRegistry.ts` | Perfect as-is |
| **All Services** | `PhysicsSystem.ts`, `InteractionSystem.ts`, `VFXSystem.ts`, `NetworkingSystem.ts`, `GameObjectsManager.ts`, `Spawner.ts`, `SceneState.ts` | No changes needed |
| **Component System** | `GameObject.ts`, `GameComponent.ts` | Core ECS unchanged |
| **All Existing Components** | `TransformComponent.ts`, `GeometryComponent.ts`, `MaterialComponent.ts`, `MeshComponent.ts`, `CollisionComponent.ts`, `HoverGlowComponent.ts`, `ClickVFXComponent.ts`, etc. | Still useful |
| **All Stores** | `auth.store.ts`, `websocket.store.ts`, `match.store.ts`, `scene.store.ts`, `config.store.ts`, `settings.store.ts` | State management unchanged |
| **All API Clients** | `api/*` | Server communication unchanged |
| **Combat Composables** | `useMatchState.ts`, `useMatchActions.ts`, `useATBPrediction.ts` | Combat logic unchanged |
| **All UI Components** | `components/ui/*` | Reusable UI library |
| **Existing Match Components** | `ActionBar.vue`, `StatusPanel.vue`, `TurnTimer.vue` | Reuse in combat modal |
| **Views** | `Login.vue`, `Scene.vue` | Entry points unchanged |
| **Router** | `router/*` | Navigation unchanged |
| **Joystick** | `useJoystick.ts`, `VirtualJoystick.vue` | Mobile controls work as-is |

### 3.2 MODIFY (Small Changes)

| File | Change Required | Effort |
|------|-----------------|--------|
| `config.store.ts` | Add top-down camera config values | Tiny |
| `useCameraController.ts` | Add `topDownMode` flag, lock angles when enabled | Small |
| `useCharacterMovement.ts` | Add `screenRelative` mode for WASD | Small |
| `PlaygroundScene.ts` | Enable top-down mode, use sprite prefabs | Medium |
| `RemotePlayer.ts` | Use sprite instead of mesh for remote players | Small |
| `Game.vue` | Add CombatModal with reactive visibility | Small |
| `MatchHUD.vue` | Hide during modal combat (conditional) | Tiny |
| `composables.types.ts` | Add new interface types (isTopDown, etc.) | Tiny |

### 3.3 CREATE (New Files)

| File | Purpose | Effort |
|------|---------|--------|
| `SpriteComponent.ts` | Billboard sprite rendering component | Medium |
| `SpriteAnimationComponent.ts` | Frame-based sprite animation (optional MVP) | Small |
| `EnemySprite.ts` | Enemy sprite prefab with MatchComponent | Medium |
| `PlayerSprite.ts` | Player sprite prefab | Medium |
| `CombatModal.vue` | Full-screen combat overlay (reactive to match.store) | Large |
| `EnemyDisplay.vue` | Enemy sprite + animations in combat | Medium |
| `CombatBackground.vue` | Combat scene background | Small |
| `index.ts` (sprites) | Barrel export for sprite prefabs | Tiny |
| `index.ts` (combat) | Barrel export for combat components | Tiny |

---

## 4. Technical Specifications

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue Application                         │
├─────────────────────────────────────────────────────────────┤
│  Game.vue                                                    │
│  └── Scene.vue                                               │
│      ├── Three.js Canvas (PlaygroundScene)                  │
│      │   ├── Camera (TOP-DOWN LOCKED)                       │
│      │   ├── Ground plane                                    │
│      │   ├── Player sprite                                   │
│      │   ├── Enemy sprites                                   │
│      │   ├── Prop sprites                                    │
│      │   └── Other player sprites                           │
│      │                                                       │
│      ├── MatchHUD.vue (hidden during combat)                │
│      └── CombatModal.vue (shown during combat)              │
├─────────────────────────────────────────────────────────────┤
│  Stores (unchanged)                                          │
│  ├── match.store.ts (combat state)                          │
│  ├── websocket.store.ts (multiplayer)                       │
│  └── scene.store.ts (world state)                           │
├─────────────────────────────────────────────────────────────┤
│  Services (unchanged)                                        │
│  ├── PhysicsSystem (collision detection)                    │
│  ├── InteractionSystem (click/hover)                        │
│  ├── NetworkingSystem (player sync)                         │
│  └── GameObjectsManager (entity management)                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Game Flow

```
┌──────────────┐
│    Login     │
└──────┬───────┘
       ▼
┌──────────────┐     ┌─────────────────────┐
│    World     │────►│   Combat Modal      │
│  (top-down)  │◄────│   (ATB overlay)     │
└──────────────┘     └─────────────────────┘
       │
       ▼
┌──────────────┐
│  See other   │
│   players    │
└──────────────┘
```

### 4.3 Combat Trigger Flow

Uses **existing component system** - same pattern as `TrainingDummy`:

```
1. Player clicks on EnemySprite 
   └── InteractionSystem detects click
   └── HoverGlowComponent shows tooltip
   └── Double-click triggers MatchComponent
   
2. MatchComponent.handleMatchCreation() (EXISTING)
   ├── Calls matchApi.createMatch()
   └── matchStore.setInitialMatchState()
   
3. Server creates match, sends WebSocket events
   
4. match.store receives events, updates state
   └── currentMatchId becomes non-null
   
5. CombatModal reacts to store state
   └── computed: isVisible = matchStore.currentMatchId !== null
   └── Modal opens automatically
   
6. CombatModal displays combat UI
   ├── EnemyDisplay (sprite + HP)
   ├── StatusPanel (player stats)  
   ├── ATB bars
   └── ActionBar (skills)
   
7. Player/Enemy take turns (existing ATB system)
   
8. Match ends (victory/defeat/flee)
   ├── Server sends match.end event
   ├── matchStore.matchState === "FINISHED"
   ├── CombatModal watches state → closes
   └── MatchComponent callback → remove enemy GameObject
```

**Key principle:** `CombatModal` is purely reactive - it watches `match.store` and displays/hides based on state. All combat initiation logic stays in `MatchComponent`.

---

## 5. Camera System Modifications

### 5.1 Overview

The camera system needs a **top-down mode** that:
- Locks vertical angle to ~70-75° (looking down)
- Locks horizontal angle to 0 (north = up)
- Disables mouse/touch rotation
- Optionally disables zoom (or keeps it for user preference)
- Follows player smoothly

### 5.2 Config Changes

**File:** `src/stores/config.store.ts`

Add to `camera` reactive object:

```typescript
const camera = reactive({
  // ... existing config ...
  
  // NEW: Top-down mode configuration
  topDownMode: true,                    // Enable top-down camera
  topDownAngleV: 1.2,                   // ~70° vertical angle (radians)
  topDownAngleH: 0,                     // Fixed horizontal angle
  topDownDistance: 15,                  // Camera distance from player
  topDownZoomEnabled: false,            // Allow zoom in top-down mode
});
```

Add metadata for new fields:

```typescript
const metadata: ConfigMetadata = {
  camera: {
    // ... existing metadata ...
    
    topDownMode: {
      label: "Top-Down Camera",
      description: "Lock camera to top-down view",
      group: "Camera Mode",
    },
    topDownAngleV: {
      label: "Top-Down Angle",
      description: "Vertical camera angle in radians (1.2 ≈ 70°)",
      min: 0.5,
      max: 1.5,
      step: 0.1,
      group: "Camera Mode",
    },
    topDownDistance: {
      label: "Top-Down Distance",
      min: 8,
      max: 25,
      step: 1,
      group: "Camera Mode",
    },
  },
};
```

### 5.3 Controller Changes

**File:** `src/composables/camera/useCameraController.ts`

```typescript
export function useCameraController(): I_CameraControls {
  const config = useGameConfigStore();

  const target = reactive({ x: 0, z: 0, y: 0 });
  const mouseRotationEnabled = ref(true);
  const freezeReactiveUpdates = ref(false);
  
  // Camera state - now respects top-down mode
  const cameraDistance = ref(
    config.camera.topDownMode 
      ? config.camera.topDownDistance 
      : config.camera.initialDistance
  );
  const cameraAngleH = ref(
    config.camera.topDownMode 
      ? config.camera.topDownAngleH 
      : config.camera.initialAngleH
  );
  const cameraAngleV = ref(
    config.camera.topDownMode 
      ? config.camera.topDownAngleV 
      : config.camera.initialAngleV
  );

  // Compose smaller composables - conditionally enable based on mode
  const rotation = useCameraRotation(cameraAngleH, cameraAngleV, {
    h: config.camera.mouseSensitivityH,
    v: config.camera.mouseSensitivityV,
  });
  const zoom = useCameraZoom(cameraDistance, {
    min: config.camera.zoomMin,
    max: config.camera.zoomMax,
  });
  
  // MODIFIED: Only enable mouse input if NOT in top-down mode
  const mouse = config.camera.topDownMode 
    ? null  // Disable mouse rotation in top-down
    : useCameraMouseInput(rotation, zoom, mouseRotationEnabled);
  
  // Touch input - also disabled in top-down mode
  if (!config.camera.topDownMode) {
    useCameraTouchInput(rotation, zoom);
  }

  // ... rest of implementation stays the same ...
  
  return {
    angle: {
      horizontal: cameraAngleH,
      vertical: cameraAngleV,
    },
    distance: cameraDistance,
    isDragging: mouse?.isDragging ?? ref(false),
    mouseRotationEnabled,
    freezeReactiveUpdates,
    target,
    followTarget,
    
    // NEW: Expose mode for components that need to know
    isTopDown: computed(() => config.camera.topDownMode),
    
    update,
    getPosition,
    reset,
    destroy,
  };
}
```

### 5.4 Alternative: Mode Parameter Approach

Instead of modifying existing code, add a mode parameter:

**File:** `src/composables/camera/useCameraController.ts`

```typescript
export interface CameraControllerOptions {
  mode?: 'free' | 'topdown';
}

export function useCameraController(
  options: CameraControllerOptions = {}
): I_CameraControls {
  const config = useGameConfigStore();
  const mode = options.mode ?? (config.camera.topDownMode ? 'topdown' : 'free');
  
  const isTopDown = mode === 'topdown';
  
  // Initialize based on mode
  const cameraDistance = ref(
    isTopDown ? config.camera.topDownDistance : config.camera.initialDistance
  );
  const cameraAngleH = ref(
    isTopDown ? config.camera.topDownAngleH : config.camera.initialAngleH
  );
  const cameraAngleV = ref(
    isTopDown ? config.camera.topDownAngleV : config.camera.initialAngleV
  );

  // Only create mouse/touch handlers in free mode
  let mouse: ReturnType<typeof useCameraMouseInput> | null = null;
  
  if (!isTopDown) {
    const rotation = useCameraRotation(cameraAngleH, cameraAngleV, {
      h: config.camera.mouseSensitivityH,
      v: config.camera.mouseSensitivityV,
    });
    const zoom = useCameraZoom(cameraDistance, {
      min: config.camera.zoomMin,
      max: config.camera.zoomMax,
    });
    mouse = useCameraMouseInput(rotation, zoom, ref(true));
    useCameraTouchInput(rotation, zoom);
  }

  // ... rest stays same ...
}
```

---

## 6. Character Movement Modifications

### 6.1 Overview

Movement needs a **screen-relative mode** where:
- W = move toward top of screen (-Z in world space)
- S = move toward bottom of screen (+Z in world space)
- A = move left on screen (-X in world space)
- D = move right on screen (+X in world space)

This is **simpler** than camera-relative movement.

### 6.2 Config Changes

**File:** `src/stores/config.store.ts`

Add to `character` reactive object:

```typescript
const character = reactive({
  // ... existing config ...
  
  // NEW: Movement mode
  screenRelativeMovement: true,  // true = screen-relative, false = camera-relative
});
```

### 6.3 Movement Changes

**File:** `src/composables/character/useCharacterMovement.ts`

```typescript
export function useCharacterMovement(): CharacterMovement {
  const config = useGameConfigStore();

  // Position and rotation
  const playerX = ref(0);
  const playerY = ref(5);
  const playerZ = ref(0);
  const playerRotation = ref(0);

  const moveSpeed = computed(() => config.character.moveSpeed);

  const { w, a, s, d } = useMagicKeys({
    passive: false,
    onEventFired(e) {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
  });

  /**
   * Update movement
   * @param delta - Delta time in seconds
   * @param cameraAngleH - Horizontal camera angle (only used in camera-relative mode)
   * @param joystickInputX - Joystick X input (-1 to 1)
   * @param joystickInputZ - Joystick Z input (-1 to 1)
   */
  function update(
    delta: number, 
    cameraAngleH: number, 
    joystickInputX: number, 
    joystickInputZ: number
  ) {
    let inputX = 0;
    let inputZ = 0;

    // Keyboard input
    if (w.value) inputZ -= 1;
    if (s.value) inputZ += 1;
    if (a.value) inputX -= 1;
    if (d.value) inputX += 1;

    // Joystick input (overrides keyboard)
    if (joystickInputX !== 0 || joystickInputZ !== 0) {
      inputX = joystickInputX;
      inputZ = joystickInputZ;
    }

    if (inputX !== 0 || inputZ !== 0) {
      // Normalize
      const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
      if (length > 1) {
        inputX /= length;
        inputZ /= length;
      }

      let moveX: number;
      let moveZ: number;

      // NEW: Check movement mode
      if (config.character.screenRelativeMovement) {
        // SCREEN-RELATIVE: Direct mapping
        // W/up = -Z, S/down = +Z, A/left = -X, D/right = +X
        moveX = inputX;
        moveZ = inputZ;
      } else {
        // CAMERA-RELATIVE: Existing behavior
        moveX = inputX * Math.cos(cameraAngleH) + inputZ * Math.sin(cameraAngleH);
        moveZ = -inputX * Math.sin(cameraAngleH) + inputZ * Math.cos(cameraAngleH);
      }

      // Update position
      playerX.value += moveX * moveSpeed.value * delta;
      playerZ.value += moveZ * moveSpeed.value * delta;

      // Update rotation to face movement direction
      playerRotation.value = Math.atan2(moveX, moveZ);
    }
  }

  function reset() {
    playerX.value = 0;
    playerY.value = 0;
    playerZ.value = 0;
    playerRotation.value = 0;
  }

  return {
    position: {
      x: playerX,
      y: playerY,
      z: playerZ,
    },
    rotation: playerRotation,
    speed: moveSpeed,
    update,
    reset,
  };
}
```

### 6.4 Joystick Compatibility

The existing `useJoystick.ts` already outputs `inputX` and `inputZ` as normalized values (-1 to 1). These map directly to screen-relative movement:

- Joystick pushed up → `inputZ = -1` → player moves up on screen
- Joystick pushed down → `inputZ = 1` → player moves down on screen
- Joystick pushed left → `inputX = -1` → player moves left on screen
- Joystick pushed right → `inputX = 1` → player moves right on screen

**No changes needed to joystick code!**

---

## 7. New Sprite System

### 7.1 Overview

Create a component-based sprite system that:
- Renders 2D textures as Three.js Sprites
- Automatically billboards to face camera (built-in for Sprites)
- Supports animation via sprite sheets
- Integrates with existing collision/interaction systems

### 7.2 SpriteComponent

**File:** `src/game/components/rendering/SpriteComponent.ts`

```typescript
import { I_SceneContext } from "@/game/common/scenes.types";
import { Sprite, SpriteMaterial, Texture, TextureLoader, NearestFilter } from "three";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
import { TransformComponent } from "../entities/TransformComponent";

export interface I_SpriteConfig {
  texture: string;              // Path to sprite image
  scale?: number;               // Uniform scale (default: 1)
  scaleX?: number;              // X scale override
  scaleY?: number;              // Y scale override
  transparent?: boolean;        // Enable transparency (default: true)
  depthTest?: boolean;          // Enable depth testing (default: true)
  depthWrite?: boolean;         // Write to depth buffer (default: false for sprites)
  color?: number;               // Tint color (default: 0xffffff)
  opacity?: number;             // Opacity 0-1 (default: 1)
  pivotY?: number;              // Y pivot offset (default: 0.5 = center)
}

/**
 * SpriteComponent - Renders 2D sprite in 3D space
 * 
 * Automatically billboards to face camera (Three.js Sprite behavior)
 * 
 * Usage:
 * ```typescript
 * new GameObject({ id: 'enemy-goblin' })
 *   .addComponent(new TransformComponent({ position: [5, 0, 5] }))
 *   .addComponent(new SpriteComponent({ 
 *     texture: '/sprites/goblin.png',
 *     scale: 2 
 *   }))
 *   .addComponent(new CollisionComponent({ shape: 'cuboid', type: 'trigger' }))
 * ```
 */
export class SpriteComponent extends GameComponent {
  public readonly priority = ComponentPriority.RENDERING;
  
  public sprite!: Sprite;
  public material!: SpriteMaterial;
  public texture!: Texture;
  
  private config: I_SpriteConfig;
  private loader = new TextureLoader();

  constructor(config: I_SpriteConfig) {
    super();
    this.config = config;
    this.registerTrait(TRAIT.MESH_PROVIDER); // For physics compatibility
  }

  async init(context: I_SceneContext): Promise<void> {
    // Load texture
    this.texture = await this.loadTexture(this.config.texture);
    
    // Configure texture for pixel art (no blur)
    this.texture.magFilter = NearestFilter;
    this.texture.minFilter = NearestFilter;
    
    // Create material
    this.material = new SpriteMaterial({
      map: this.texture,
      transparent: this.config.transparent ?? true,
      depthTest: this.config.depthTest ?? true,
      depthWrite: this.config.depthWrite ?? false,
      color: this.config.color ?? 0xffffff,
      opacity: this.config.opacity ?? 1,
    });
    
    // Create sprite
    this.sprite = new Sprite(this.material);
    this.sprite.name = this.gameObject.id;
    
    // Apply scale
    const scaleX = this.config.scaleX ?? this.config.scale ?? 1;
    const scaleY = this.config.scaleY ?? this.config.scale ?? 1;
    this.sprite.scale.set(scaleX, scaleY, 1);
    
    // Adjust pivot (sprites default to center)
    // pivotY: 0 = bottom, 0.5 = center, 1 = top
    const pivotY = this.config.pivotY ?? 0.5;
    this.sprite.center.set(0.5, pivotY);
    
    // Apply transform if available
    const transform = this.getComponent(TransformComponent);
    if (transform) {
      this.sprite.position.copy(transform.position);
      // Note: Sprites auto-billboard, so rotation is ignored for facing
      // But we can use rotation.z for tilt effects
    }
    
    // Add to scene
    context.scene.add(this.sprite);
    context.cleanupRegistry.registerObject(this.sprite);
  }

  private loadTexture(path: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  update(delta: number): void {
    // Sync position with transform
    const transform = this.getComponent(TransformComponent);
    if (transform) {
      this.sprite.position.copy(transform.position);
      
      // Offset Y to place sprite "standing" on ground
      // If pivotY is 0 (bottom), sprite stands on transform.position.y
      // If pivotY is 0.5 (center), need to offset up by half height
      const pivotY = this.config.pivotY ?? 0.5;
      const scaleY = this.config.scaleY ?? this.config.scale ?? 1;
      this.sprite.position.y += scaleY * (0.5 - pivotY);
    }
  }

  /**
   * Set sprite tint color
   */
  setColor(color: number): void {
    this.material.color.setHex(color);
  }

  /**
   * Set sprite opacity
   */
  setOpacity(opacity: number): void {
    this.material.opacity = opacity;
  }

  /**
   * Flash effect (for hit feedback)
   */
  flash(color: number = 0xffffff, duration: number = 100): void {
    const originalColor = this.material.color.getHex();
    this.material.color.setHex(color);
    setTimeout(() => {
      this.material.color.setHex(originalColor);
    }, duration);
  }

  /**
   * Get underlying sprite for physics registration
   * (Implements I_MeshProvider interface pattern)
   */
  getMesh(): Sprite {
    return this.sprite;
  }

  destroy(): void {
    if (this.sprite?.parent) {
      this.sprite.parent.remove(this.sprite);
    }
    this.material?.dispose();
    this.texture?.dispose();
  }
}
```

### 7.3 SpriteAnimationComponent (Optional)

**File:** `src/game/components/rendering/SpriteAnimationComponent.ts`

```typescript
import { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { SpriteComponent } from "./SpriteComponent";

export interface I_SpriteFrame {
  x: number;      // X position in spritesheet
  y: number;      // Y position in spritesheet
  w: number;      // Frame width
  h: number;      // Frame height
}

export interface I_SpriteAnimation {
  name: string;
  frames: number[];       // Indices into frames array
  frameRate: number;      // Frames per second
  loop?: boolean;         // Loop animation (default: true)
}

export interface I_SpriteAnimationConfig {
  spriteSheetWidth: number;   // Total spritesheet width in pixels
  spriteSheetHeight: number;  // Total spritesheet height in pixels
  frames: I_SpriteFrame[];    // All frames in spritesheet
  animations: I_SpriteAnimation[];
  defaultAnimation?: string;
}

/**
 * SpriteAnimationComponent - Frame-based sprite animation
 * 
 * Requires SpriteComponent
 * 
 * Usage:
 * ```typescript
 * new GameObject({ id: 'animated-enemy' })
 *   .addComponent(new SpriteComponent({ texture: '/sprites/goblin-sheet.png' }))
 *   .addComponent(new SpriteAnimationComponent({
 *     spriteSheetWidth: 256,
 *     spriteSheetHeight: 64,
 *     frames: [
 *       { x: 0, y: 0, w: 64, h: 64 },
 *       { x: 64, y: 0, w: 64, h: 64 },
 *       { x: 128, y: 0, w: 64, h: 64 },
 *       { x: 192, y: 0, w: 64, h: 64 },
 *     ],
 *     animations: [
 *       { name: 'idle', frames: [0, 1], frameRate: 2, loop: true },
 *       { name: 'attack', frames: [2, 3], frameRate: 8, loop: false },
 *     ],
 *     defaultAnimation: 'idle'
 *   }))
 * ```
 */
export class SpriteAnimationComponent extends GameComponent {
  public readonly priority = ComponentPriority.RENDERING + 1; // After SpriteComponent
  
  private config: I_SpriteAnimationConfig;
  private spriteComp!: SpriteComponent;
  
  private currentAnimation: I_SpriteAnimation | null = null;
  private currentFrameIndex = 0;
  private frameTimer = 0;
  private isPlaying = false;

  constructor(config: I_SpriteAnimationConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.spriteComp = this.requireComponent(SpriteComponent);
    
    // Play default animation
    if (this.config.defaultAnimation) {
      this.play(this.config.defaultAnimation);
    }
  }

  update(delta: number): void {
    if (!this.isPlaying || !this.currentAnimation) return;
    
    this.frameTimer += delta;
    const frameDuration = 1 / this.currentAnimation.frameRate;
    
    if (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      this.currentFrameIndex++;
      
      if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
        if (this.currentAnimation.loop !== false) {
          this.currentFrameIndex = 0;
        } else {
          this.currentFrameIndex = this.currentAnimation.frames.length - 1;
          this.isPlaying = false;
        }
      }
      
      this.applyFrame();
    }
  }

  /**
   * Play an animation by name
   */
  play(name: string): void {
    const anim = this.config.animations.find(a => a.name === name);
    if (!anim) {
      console.warn(`Animation '${name}' not found`);
      return;
    }
    
    this.currentAnimation = anim;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
    this.isPlaying = true;
    this.applyFrame();
  }

  /**
   * Stop current animation
   */
  stop(): void {
    this.isPlaying = false;
  }

  private applyFrame(): void {
    if (!this.currentAnimation) return;
    
    const frameIndex = this.currentAnimation.frames[this.currentFrameIndex];
    const frame = this.config.frames[frameIndex];
    
    // Update texture UV coordinates
    const texture = this.spriteComp.texture;
    const { spriteSheetWidth, spriteSheetHeight } = this.config;
    
    texture.repeat.set(
      frame.w / spriteSheetWidth,
      frame.h / spriteSheetHeight
    );
    texture.offset.set(
      frame.x / spriteSheetWidth,
      1 - (frame.y + frame.h) / spriteSheetHeight // Flip Y for Three.js
    );
  }
}
```

### 7.4 Enemy Prefab

**File:** `src/game/prefabs/sprites/EnemySprite.ts`

```typescript
import { CollisionComponent } from "@/game/components/interactions/CollisionComponent";
import { HoverGlowComponent } from "@/game/components/interactions/HoverGlowComponent";
import { InteractionComponent } from "@/game/components/interactions/InteractionComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { SpriteComponent } from "@/game/components/rendering/SpriteComponent";
import { GameObject } from "@/game/GameObject";
import { PositionVector3 } from "@/common/types";

export interface I_EnemySpriteConfig {
  id: string;
  position: PositionVector3 | [number, number, number];
  texture: string;
  scale?: number;
  name?: string;
  level?: number;
  health?: number;
  collisionRadius?: number;
}

/**
 * EnemySprite - Sprite-based enemy prefab
 * 
 * Features:
 * - 2D sprite rendering
 * - Collision trigger for encounters
 * - Hover glow effect
 * - Click/double-click for combat
 * - MatchComponent for PvE battles
 */
export class EnemySprite extends GameObject {
  constructor(config: I_EnemySpriteConfig) {
    super({ id: config.id });
    
    const position = Array.isArray(config.position) 
      ? config.position 
      : [config.position.x, config.position.y, config.position.z];
    
    // Transform
    this.addComponent(new TransformComponent({
      position: position as [number, number, number],
    }));
    
    // Sprite rendering
    this.addComponent(new SpriteComponent({
      texture: config.texture,
      scale: config.scale ?? 2,
      pivotY: 0, // Bottom of sprite on ground
    }));
    
    // Collision (trigger zone for encounters)
    this.addComponent(new CollisionComponent({
      type: 'trigger',
      shape: 'cuboid',
      size: {
        x: config.collisionRadius ?? 1,
        y: 2,
        z: config.collisionRadius ?? 1,
      },
    }));
    
    // Hover effect
    this.addComponent(new HoverGlowComponent({
      glowColor: 0xff4444,
      glowIntensity: 0.3,
      tooltip: {
        title: config.name ?? 'Enemy',
        description: `Level ${config.level ?? 1}`,
      },
    }));
    
    // Interaction (click to fight)
    this.addComponent(new InteractionComponent({
      onInteract: () => {
        console.log(`[EnemySprite] Interacted with ${config.id}`);
        // Interaction triggers MatchComponent
      },
    }));
    
    // Match component (enables combat)
    this.addComponent(new MatchComponent({
      npcId: config.id,
      npcName: config.name ?? 'Enemy',
      npcLevel: config.level ?? 1,
    }));
  }
}
```

### 7.5 Player Sprite Prefab

**File:** `src/game/prefabs/sprites/PlayerSprite.ts`

```typescript
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { KinematicCollisionComponent } from "@/game/components/entities/KinematicCollisionComponent";
import { SpriteComponent } from "@/game/components/rendering/SpriteComponent";
import { SyncMovementComponent } from "@/game/components/multiplayer/SyncMovementComponent";
import { GameObject } from "@/game/GameObject";
import { I_CharacterControls } from "@/composables/composables.types";

export interface I_PlayerSpriteConfig {
  playerId: string;
  characterController: I_CharacterControls;
  texture?: string;
  scale?: number;
  isLocal?: boolean;
}

/**
 * PlayerSprite - Sprite-based player character
 * 
 * For local player: Syncs position from characterController
 * For remote players: Syncs position from network
 */
export class PlayerSprite extends GameObject {
  private controller?: I_CharacterControls;
  private transformComp!: TransformComponent;

  constructor(config: I_PlayerSpriteConfig) {
    super({ id: config.playerId });
    
    this.controller = config.isLocal !== false ? config.characterController : undefined;
    
    // Transform (will be synced from controller or network)
    this.transformComp = new TransformComponent({
      position: [0, 0, 0],
    });
    this.addComponent(this.transformComp);
    
    // Sprite rendering
    this.addComponent(new SpriteComponent({
      texture: config.texture ?? '/sprites/player.png',
      scale: config.scale ?? 2,
      pivotY: 0,
    }));
    
    // Collision
    this.addComponent(new KinematicCollisionComponent({
      shape: 'capsule',
      radius: 0.5,
      height: 1.5,
    }));
    
    // Network sync (for multiplayer)
    if (config.isLocal !== false) {
      this.addComponent(new SyncMovementComponent({
        syncRate: 10, // 10 updates per second
      }));
    }
  }

  /**
   * Override update to sync transform from controller
   */
  update(delta: number): void {
    super.update(delta);
    
    if (this.controller) {
      const pos = this.controller.getPosition();
      this.transformComp.position.set(pos.x, pos.y, pos.z);
      
      // Optionally rotate sprite based on movement direction
      // (sprites auto-billboard, but we could flip horizontally)
    }
  }
}
```

---

## 8. Combat Modal System

### 8.1 Overview

Combat happens in a **full-screen Vue modal overlay** that:
- Covers the game canvas
- Displays enemy sprite prominently
- Shows all combat UI (HP, ATB, skills)
- Handles all combat interactions
- Closes when combat ends

### 8.2 Component Structure

```
CombatModal.vue (full-screen overlay)
├── CombatBackground.vue (background image/gradient)
├── EnemySection
│   ├── EnemyDisplay.vue (large enemy sprite + name + level)
│   └── EnemyStatus (HP bar, ATB bar)
├── PlayerSection
│   ├── PlayerStatus.vue (HP/MP/ATB - reuse StatusPanel)
│   └── ActionBar.vue (skill slots - reuse existing)
├── TurnIndicator (whose turn)
└── TurnTimer.vue (reuse existing)
```

### 8.3 CombatModal.vue

**File:** `src/components/combat/CombatModal.vue`

```vue
<template>
  <Teleport to="body">
    <Transition name="combat-fade">
      <div 
        v-if="isVisible" 
        class="combat-modal"
        @click.self="handleBackgroundClick"
      >
        <!-- Background -->
        <CombatBackground :environment="combatEnvironment" />
        
        <!-- Main Combat Container -->
        <div class="combat-container">
          
          <!-- Enemy Section (Top) -->
          <div class="enemy-section">
            <!-- Enemy Status (Top Right) -->
            <div class="enemy-status-wrapper">
              <StatusPanel
                entity-type="enemy"
                :name="enemyName"
                :level="enemyLevel"
                :hp="enemyHp"
                :max-hp="enemyMaxHp"
                :mp="0"
                :max-mp="0"
                :atb-progress="enemyAtb"
                :is-atb-running="isAtbRunning"
              />
            </div>
            
            <!-- Enemy Display (Center) -->
            <EnemyDisplay
              :sprite-url="enemySpriteUrl"
              :is-attacking="enemyIsAttacking"
              :is-hit="enemyIsHit"
              :is-defeated="enemyIsDefeated"
            />
          </div>
          
          <!-- Turn Indicator (Center) -->
          <div class="turn-indicator">
            <TurnTimer v-if="isPlayerTurn" />
            <div v-else class="enemy-turn-label">
              Enemy Turn
            </div>
          </div>
          
          <!-- Player Section (Bottom) -->
          <div class="player-section">
            <!-- Player Status -->
            <div class="player-status-wrapper">
              <StatusPanel
                entity-type="player"
                :name="playerName"
                :level="playerLevel"
                :hp="playerHp"
                :max-hp="playerMaxHp"
                :mp="playerMp"
                :max-mp="playerMaxMp"
                :atb-progress="playerAtb"
                :is-atb-running="isAtbRunning"
              />
            </div>
            
            <!-- Action Bar -->
            <div class="action-bar-wrapper">
              <ActionBar
                :is-leaving="isLeaving"
                :is-player-turn="isPlayerTurn"
                @leave-match="handleFlee"
                @action="handleAction"
              />
            </div>
          </div>
          
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMatchStore } from "@/stores/match.store";
import { useMatchActions } from "@/composables/useMatchActions";
import StatusPanel from "@/components/match/StatusPanel.vue";
import ActionBar from "@/components/match/ActionBar.vue";
import TurnTimer from "@/components/match/TurnTimer.vue";
import CombatBackground from "./CombatBackground.vue";
import EnemyDisplay from "./EnemyDisplay.vue";

// Props
const props = defineProps<{
  isVisible: boolean;
  enemySpriteUrl?: string;
  combatEnvironment?: string;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  victory: [];
  defeat: [];
  flee: [];
}>();

// Stores
const matchStore = useMatchStore();
const actions = useMatchActions();

// Loading state
const isLeaving = ref(false);

// Player data
const playerName = computed(() => matchStore.match.player?.name ?? "Player");
const playerLevel = ref(1);
const playerHp = computed(() => matchStore.match.player?.health ?? 0);
const playerMaxHp = computed(() => matchStore.match.player?.maxHealth ?? 1);
const playerMp = ref(50);
const playerMaxMp = ref(100);
const playerAtb = computed(() => matchStore.match.player?.readiness ?? 0);

// Enemy data
const enemyName = computed(() => matchStore.match.npc?.name ?? "Enemy");
const enemyLevel = ref(1);
const enemyHp = computed(() => matchStore.match.npc?.health ?? 0);
const enemyMaxHp = computed(() => matchStore.match.npc?.maxHealth ?? 1);
const enemyAtb = computed(() => matchStore.match.npc?.readiness ?? 0);

// Combat state
const isAtbRunning = computed(() => matchStore.match.atb.running);
const isPlayerTurn = computed(() => matchStore.match.turn.isPlayerTurn);

// Animation states
const enemyIsAttacking = ref(false);
const enemyIsHit = ref(false);
const enemyIsDefeated = ref(false);

// Actions
function handleAction(action: number | string) {
  switch (action) {
    case "attack":
      actions.attack();
      break;
    case "pass":
      actions.pass();
      break;
    default:
      actions.sendAction(action.toString());
  }
}

async function handleFlee() {
  isLeaving.value = true;
  try {
    actions.run();
    emit("flee");
  } finally {
    isLeaving.value = false;
  }
}

function handleBackgroundClick() {
  // Optionally allow clicking background to do something
}

// Watch for match end
watch(
  () => matchStore.matchState,
  (newState) => {
    if (newState === "FINISHED") {
      // Determine outcome and emit appropriate event
      const playerWon = matchStore.match.player?.health > 0;
      if (playerWon) {
        emit("victory");
      } else {
        emit("defeat");
      }
      emit("close");
    }
  }
);

// Watch for damage events to trigger animations
watch(
  () => matchStore.match.npc?.health,
  (newHealth, oldHealth) => {
    if (oldHealth !== undefined && newHealth < oldHealth) {
      enemyIsHit.value = true;
      setTimeout(() => {
        enemyIsHit.value = false;
      }, 200);
    }
    if (newHealth <= 0) {
      enemyIsDefeated.value = true;
    }
  }
);
</script>

<style scoped>
.combat-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.combat-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.enemy-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
}

.enemy-status-wrapper {
  align-self: flex-end;
}

.turn-indicator {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.enemy-turn-label {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.8);
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
}

.player-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.player-status-wrapper {
  align-self: flex-start;
}

.action-bar-wrapper {
  align-self: center;
}

/* Transitions */
.combat-fade-enter-active,
.combat-fade-leave-active {
  transition: opacity 0.3s ease;
}

.combat-fade-enter-from,
.combat-fade-leave-to {
  opacity: 0;
}
</style>
```

### 8.4 EnemyDisplay.vue

**File:** `src/components/combat/EnemyDisplay.vue`

```vue
<template>
  <div 
    class="enemy-display"
    :class="{
      'is-attacking': isAttacking,
      'is-hit': isHit,
      'is-defeated': isDefeated,
    }"
  >
    <img 
      :src="spriteUrl" 
      :alt="'Enemy sprite'"
      class="enemy-sprite"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  spriteUrl: string;
  isAttacking?: boolean;
  isHit?: boolean;
  isDefeated?: boolean;
}>();
</script>

<style scoped>
.enemy-display {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}

.enemy-sprite {
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated; /* Crisp pixel art */
  image-rendering: crisp-edges;
}

/* Attack animation - lunge forward */
.is-attacking {
  animation: attack-lunge 0.3s ease-out;
}

@keyframes attack-lunge {
  0% { transform: translateY(0); }
  50% { transform: translateY(20px) scale(1.1); }
  100% { transform: translateY(0); }
}

/* Hit animation - shake and flash */
.is-hit {
  animation: hit-shake 0.2s ease-out;
}

@keyframes hit-shake {
  0%, 100% { transform: translateX(0); filter: brightness(1); }
  25% { transform: translateX(-10px); filter: brightness(2); }
  75% { transform: translateX(10px); filter: brightness(2); }
}

/* Defeated animation - fade and fall */
.is-defeated {
  animation: defeat-fall 0.5s ease-out forwards;
}

@keyframes defeat-fall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(50px) rotate(10deg); opacity: 0; }
}
</style>
```

### 8.5 CombatBackground.vue

**File:** `src/components/combat/CombatBackground.vue`

```vue
<template>
  <div class="combat-background">
    <!-- Option 1: Image background -->
    <img 
      v-if="backgroundImage"
      :src="backgroundImage" 
      class="background-image"
    />
    
    <!-- Option 2: Gradient background -->
    <div v-else class="background-gradient" />
    
    <!-- Overlay for readability -->
    <div class="background-overlay" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  environment?: string;
}>();

const backgroundImage = computed(() => {
  if (!props.environment) return null;
  
  const backgrounds: Record<string, string> = {
    dungeon: "/backgrounds/combat_dungeon.png",
    forest: "/backgrounds/combat_forest.png",
    cave: "/backgrounds/combat_cave.png",
  };
  
  return backgrounds[props.environment] ?? null;
});
</script>

<style scoped>
.combat-background {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    hsl(220, 30%, 15%) 0%,
    hsl(220, 40%, 10%) 50%,
    hsl(220, 50%, 5%) 100%
  );
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
</style>
```

### 8.6 CombatModal Integration (Reactive Pattern)

The `CombatModal` is **purely reactive** - no new composable needed. It watches `match.store` state:

**In Game.vue or Scene.vue:**

```vue
<template>
  <!-- Existing content -->
  <Scene v-if="websocketManager.isConnected" />
  
  <!-- Combat Modal - reactive to match state -->
  <CombatModal 
    :is-visible="isInCombat"
    :enemy-sprite-url="enemySpriteUrl"
    @close="handleCombatClose"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMatchStore } from "@/stores/match.store";
import CombatModal from "@/components/combat/CombatModal.vue";

const matchStore = useMatchStore();

// Combat modal visibility - reactive to match.store
const isInCombat = computed(() => matchStore.currentMatchId !== null);

// Enemy sprite URL from NPC data
const enemySpriteUrl = computed(() => {
  // Could be stored in match state or looked up by NPC ID
  return matchStore.match.npc?.spriteUrl ?? '/sprites/default-enemy.png';
});

function handleCombatClose() {
  // matchStore.$reset() is called by MatchHUD on match end
  // This callback is for any additional cleanup needed
}
</script>
```

**How it works with existing MatchComponent:**

1. `EnemySprite` prefab includes `MatchComponent` (same as `TrainingDummy`)
2. Player double-clicks enemy → `MatchComponent.handleMatchCreation()` runs
3. `MatchComponent` calls API → `matchStore.setInitialMatchState()`
4. `matchStore.currentMatchId` becomes non-null
5. `isInCombat` computed becomes `true`
6. `CombatModal` shows automatically
7. When match ends → `matchStore.$reset()` → `isInCombat` becomes `false`
8. `CombatModal` hides automatically

**No new encounter management code needed** - the existing `MatchComponent` + `match.store` pattern handles everything.
```

---

## 9. Asset Requirements

### 9.1 Art Style Guide

**Target Style:** Realm of the Mad God / vibrant pixel art
- 16x16 or 32x32 base resolution
- Clean outlines
- Vibrant, saturated colors
- Simple shading (2-3 color ramps per object)
- Readable silhouettes

### 9.2 Required Sprites

| Asset | Size | Frames | Priority |
|-------|------|--------|----------|
| `player.png` | 32x32 | 1 | MVP |
| `goblin.png` | 32x32 | 1 | MVP |
| `slime.png` | 32x32 | 1 | MVP |
| `skeleton.png` | 32x32 | 1 | Post-MVP |
| `chest.png` | 32x32 | 2 (closed/open) | Post-MVP |
| `tree.png` | 32x64 | 1 | Post-MVP |
| `rock.png` | 32x32 | 1 | Post-MVP |
| `npc_merchant.png` | 32x32 | 1 | Post-MVP |

### 9.3 Ground Textures

| Asset | Size | Tileable | Priority |
|-------|------|----------|----------|
| `grass.png` | 64x64 | Yes | MVP |
| `dirt.png` | 64x64 | Yes | Post-MVP |
| `stone.png` | 64x64 | Yes | Post-MVP |

### 9.4 Combat Backgrounds

| Asset | Size | Priority |
|-------|------|----------|
| `combat_default.png` | 1920x1080 | MVP |
| `combat_forest.png` | 1920x1080 | Post-MVP |
| `combat_dungeon.png` | 1920x1080 | Post-MVP |

### 9.5 MVP Minimum Assets

For initial development, only these are **required**:

1. `player.png` - 32x32 player sprite
2. `goblin.png` - 32x32 enemy sprite  
3. `grass.png` - 64x64 tileable ground texture

Everything else can use placeholders (colored rectangles) initially.

---

## 10. Implementation Phases

### Phase 1: Camera & Movement (2-3 days)

**Tasks:**
1. Add `topDownMode` config to `config.store.ts`
2. Modify `useCameraController.ts` to lock angles in top-down mode
3. Modify `useCharacterMovement.ts` for screen-relative movement
4. Add `screenRelativeMovement` config
5. Test in PlaygroundScene

**Deliverable:** Player moves with WASD in screen directions, camera locked top-down

**Files Modified:**
- `src/stores/config.store.ts`
- `src/composables/camera/useCameraController.ts`
- `src/composables/character/useCharacterMovement.ts`

### Phase 2: Sprite System (2-3 days)

**Tasks:**
1. Create `SpriteComponent.ts`
2. Create `SpriteAnimationComponent.ts` (optional)
3. Create `EnemySprite.ts` prefab
4. Create `PlayerSprite.ts` prefab
5. Test sprite rendering in scene

**Deliverable:** Sprites render and billboard correctly

**Files Created:**
- `src/game/components/rendering/SpriteComponent.ts`
- `src/game/components/rendering/SpriteAnimationComponent.ts`
- `src/game/prefabs/sprites/EnemySprite.ts`
- `src/game/prefabs/sprites/PlayerSprite.ts`

### Phase 3: Combat Modal - UI (2-3 days)

**Tasks:**
1. Create `CombatModal.vue`
2. Create `EnemyDisplay.vue`
3. Create `CombatBackground.vue`
4. Integrate existing `StatusPanel.vue` and `ActionBar.vue`
5. Style and layout

**Deliverable:** Combat modal displays with all UI elements

**Files Created:**
- `src/components/combat/CombatModal.vue`
- `src/components/combat/EnemyDisplay.vue`
- `src/components/combat/CombatBackground.vue`

### Phase 4: Combat Integration (2-3 days)

**Tasks:**
1. Add `CombatModal` to `Game.vue` with reactive visibility
2. Wire modal to `match.store.ts` (computed isVisible)
3. Update `EnemySprite` to use `MatchComponent` (same pattern as TrainingDummy)
4. Handle combat end (modal auto-closes via reactive state)
5. Enemy removal on victory (via MatchComponent callback or GameObjectsManager)

**Deliverable:** Full combat loop works end-to-end

**Files Modified:**
- `src/views/Game.vue` (add CombatModal)
- `src/game/prefabs/sprites/EnemySprite.ts` (ensure MatchComponent setup)

### Phase 5: Scene Setup (1-2 days)

**Tasks:**
1. Update `PlaygroundScene.ts` to use sprites
2. Enable top-down mode
3. Create test area with enemies
4. Test full flow

**Deliverable:** Playable demo with sprites and combat

**Files Modified:**
- `src/scenes/PlaygroundScene.ts`

### Phase 6: Multiplayer Sprites (2-3 days)

**Tasks:**
1. Update `RemotePlayer.ts` to use sprites
2. Test multiplayer visibility
3. Optionally enable PvP challenges

**Deliverable:** Other players visible as sprites

**Files Modified:**
- `src/game/prefabs/character/RemotePlayer.ts`
- `src/game/components/multiplayer/RemotePlayerComponent.ts`

### Phase 7: Polish (2-3 days)

**Tasks:**
1. Combat animations/feedback
2. Sound effect hooks
3. Victory/defeat screens
4. Bug fixes
5. Mobile testing

**Deliverable:** MVP complete

---

## 11. File Change Summary

### 11.1 Files to Modify (8 files)

| File | Lines Changed (est.) | Description |
|------|----------------------|-------------|
| `config.store.ts` | +30 | Add top-down config |
| `useCameraController.ts` | +40 | Add top-down mode |
| `useCharacterMovement.ts` | +15 | Add screen-relative mode |
| `PlaygroundScene.ts` | +50, -30 | Use sprites, enable top-down |
| `RemotePlayer.ts` | +20 | Use sprite instead of mesh |
| `Game.vue` | +15 | Add CombatModal with reactive visibility |
| `MatchHUD.vue` | +5 | Hide during modal combat |
| `composables.types.ts` | +10 | Add new interface types |

### 11.2 Files to Create (9 files)

| File | Lines (est.) | Description |
|------|--------------|-------------|
| `SpriteComponent.ts` | ~150 | Sprite rendering component |
| `SpriteAnimationComponent.ts` | ~120 | Animation component |
| `EnemySprite.ts` | ~80 | Enemy prefab (uses existing MatchComponent) |
| `PlayerSprite.ts` | ~70 | Player sprite prefab |
| `CombatModal.vue` | ~250 | Combat overlay (reactive to match.store) |
| `EnemyDisplay.vue` | ~80 | Enemy sprite in combat |
| `CombatBackground.vue` | ~60 | Combat background |
| `index.ts` (sprites) | ~10 | Barrel export |
| `index.ts` (combat) | ~10 | Barrel export |

### 11.3 Total Effort Estimate

| Category | Files | Est. Lines | Est. Time |
|----------|-------|------------|-----------|
| Modify | 8 | ~185 | 2-3 days |
| Create | 9 | ~830 | 5-7 days |
| Integration/Testing | - | - | 3-4 days |
| Polish | - | - | 2-3 days |
| **Total** | **17** | **~1015** | **12-17 days (~2-3 weeks)** |

> **Note:** Phases can overlap. A focused dev could hit ~2 weeks; with learning curve and debugging, expect closer to 3 weeks.

---

## 12. Testing & Validation

### 12.1 Unit Tests

| System | Test Cases |
|--------|------------|
| Camera | Top-down angle locked, follows player |
| Movement | Screen-relative WASD, joystick works |
| Sprite | Loads texture, billboards, scales correctly |
| Combat | State transitions, modal shows/hides |

### 12.2 Integration Tests

| Flow | Validation |
|------|------------|
| Login → World | Player spawns, camera correct |
| Movement | WASD moves in screen directions |
| Approach Enemy | Can walk near enemy sprite |
| Click Enemy | Combat modal opens |
| Combat → Victory | Enemy removed, modal closes |
| Combat → Flee | Modal closes, player can move |
| Multiplayer | Other players visible as sprites |

### 12.3 Manual Test Checklist

**Camera:**
- [ ] Camera angle is fixed at top-down (~70°)
- [ ] Camera follows player smoothly
- [ ] No camera rotation from mouse/touch
- [ ] Zoom works (if enabled) / disabled (if configured)

**Movement:**
- [ ] W moves player UP on screen
- [ ] S moves player DOWN on screen
- [ ] A moves player LEFT on screen
- [ ] D moves player RIGHT on screen
- [ ] Diagonal movement works
- [ ] Mobile joystick works correctly
- [ ] Movement feels responsive

**Sprites:**
- [ ] Player sprite renders
- [ ] Player sprite is upright (not lying flat)
- [ ] Enemy sprites render at correct positions
- [ ] Sprites face camera (billboard)
- [ ] Hover glow works on enemies

**Combat:**
- [ ] Clicking enemy triggers combat modal
- [ ] Combat modal covers game canvas
- [ ] Enemy sprite displays in modal
- [ ] HP/ATB bars update correctly
- [ ] Skills can be used
- [ ] Combat resolves properly
- [ ] Modal closes on combat end
- [ ] Enemy disappears on victory
- [ ] Player can move after combat

**Multiplayer:**
- [ ] Other players appear as sprites
- [ ] Other player positions sync
- [ ] Can see other players move

---

## Appendix A: Asset Creation Tips

### Using AI Image Generation

**Prompt template for enemy sprites:**
```
Pixel art sprite, 32x32, [creature type], front-facing, vibrant colors, 
clean outline, transparent background, retro game style, 
similar to Realm of the Mad God
```

**Example prompts:**
- "Pixel art sprite, 32x32, green goblin warrior, front-facing..."
- "Pixel art sprite, 32x32, blue slime monster, front-facing..."
- "Pixel art sprite, 32x32, skeleton archer, front-facing..."

### Post-Processing

1. Resize to exact 32x32 (nearest neighbor scaling)
2. Clean up edges for transparent background
3. Ensure consistent palette across all sprites
4. Save as PNG with transparency

---

## Appendix B: Quick Reference

### Enable Top-Down Mode

In `config.store.ts` or via settings UI:
```typescript
camera.topDownMode = true;
camera.topDownAngleV = 1.2;  // ~70°
camera.topDownDistance = 15;
character.screenRelativeMovement = true;
```

### Create an Enemy

```typescript
import { EnemySprite } from "@/game/prefabs/sprites/EnemySprite";

const goblin = new EnemySprite({
  id: "goblin-1",
  position: [10, 0, 10],
  texture: "/sprites/goblin.png",
  name: "Goblin",
  level: 5,
  scale: 2,
});

gameObjectsManager.register(goblin);
```

### Trigger Combat Programmatically

Combat is triggered via `MatchComponent` (same pattern as `TrainingDummy`):

```typescript
// EnemySprite already has MatchComponent
// Double-click triggers handleMatchCreation automatically

// To trigger programmatically (e.g., from collision):
const enemy = gameObjectsManager.get<EnemySprite>("goblin-1");
const matchComp = enemy?.getComponent(MatchComponent);
if (matchComp) {
  // @ts-ignore - accessing for programmatic trigger
  await matchComp.handleMatchCreation(sceneContext);
}
```

Or simply let the player interact via click - the component system handles it.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-21 | Claude | Initial PRD (FPS approach) |
| 2.0 | 2024-12-21 | Claude | Complete rewrite for top-down RotMG style |

---

*End of Document*
