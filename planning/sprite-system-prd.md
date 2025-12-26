# Product Requirements Document: Billboard Sprite System

**Project:** RUNE RPG  
**Feature:** 2D Sprites in 3D Space (Billboard Sprite System)  
**Version:** 1.0  
**Date:** December 2024  
**Status:** Ready for Implementation Review

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the requirements for implementing a Billboard Sprite System in the RUNE RPG client. The system will enable 2D sprites to exist and animate within the existing 3D Three.js environment, creating a "2.5D" aesthetic similar to games like Noia Online, Octopath Traveler, and classic Doom-style rendering.

### 1.2 Goals

The primary goals of this implementation are:

1. **Visual Style Transformation**: Shift from 3D mesh-based game objects to 2D sprite-based rendering while preserving all existing 3D spatial mechanics (physics, camera, interactions).

2. **Artistic Flexibility**: Enable the use of generated or hand-drawn 2D sprites for characters, NPCs, environmental objects, and effects, dramatically reducing the barrier to creating new visual content.

3. **Architecture Preservation**: Integrate seamlessly with the existing GameObject/GameComponent ECS architecture, allowing sprites to coexist with 3D meshes and leverage all existing systems (physics, interactions, VFX).

4. **Performance Scalability**: Support rendering hundreds of animated sprites simultaneously without degrading frame rate below 60 FPS.

### 1.3 Success Criteria

The implementation will be considered successful when:

- A developer can create a sprite-based GameObject using the same fluent API pattern as mesh-based objects
- Both cylindrical (upright) and spherical (full-facing) billboard modes are supported
- Sprite sheet animations play correctly with configurable frame rates
- The system integrates with existing InteractionSystem for hover/click detection
- Performance remains above 55 FPS with 200+ animated sprites on screen
- All Three.js resources are properly cleaned up via CleanupRegistry

---

## 2. Background and Context

### 2.1 Current Architecture

The RUNE client uses a sophisticated Entity-Component System built on Three.js. Understanding the existing patterns is essential for proper integration.

#### Core Classes

| Class             | Purpose                                            | Location                      |
| ----------------- | -------------------------------------------------- | ----------------------------- |
| `GameObject`      | Entity container with fluent component API         | `src/game/GameObject.ts`      |
| `GameComponent`   | Base class for all components with priority system | `src/game/GameComponent.ts`   |
| `CleanupRegistry` | Memory leak prevention for Three.js resources      | `src/game/CleanupRegistry.ts` |
| `GameScene`       | Scene lifecycle management with module registry    | `src/game/GameScene.ts`       |

#### Existing Component Patterns

Components follow a priority-based initialization order:

```
Priority 1 (DEFAULT): TransformComponent, GeometryComponent, MaterialComponent
Priority 100 (RENDERING): MeshComponent
Priority 200 (PHYSICS): PhysicsComponent
Priority 300 (INTERACTION): InteractionComponent, HoverComponent
```

Components communicate via trait-based lookup:

```typescript
// MaterialComponent registers TRAIT.MATERIAL_PROVIDER
// MeshComponent queries: this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER)
```

#### Current GameObject Creation Pattern

```typescript
new GameObject({ id: "rock-1" })
	.addComponent(new TransformComponent({ position: [5, 0, 3] }))
	.addComponent(new GeometryComponent({ type: "box", params: [1, 1, 1] }))
	.addComponent(new MaterialComponent({ color: 0xff1493 }))
	.addComponent(new MeshComponent())
	.addComponent(new HoverComponent());
```

### 2.2 Reference Games

**Noia Online** (Primary Reference): Browser-based MMO using 2D sprites in 3D space. Key observations:

- Cylindrical billboarding for all characters and environmental objects
- Sprites remain upright regardless of camera pitch
- Smooth movement interpolation in 3D space
- Layered sprite compositing for character customization (body, hair, equipment as separate sprites)

**Octopath Traveler** ("HD-2D"): Demonstrates the high-end potential:

- Sprites receive and cast shadows
- Dynamic lighting affects sprite appearance
- Depth of field and other post-processing include sprites

**Paper Mario**: Y-axis-only billboarding maintains the "paper" metaphor while allowing full 3D camera movement.

### 2.3 Technical Constraints

1. **Three.js Version**: 0.180.0 (must use compatible APIs)
2. **Bun Runtime**: All tooling must use Bun, never npm/node
3. **Mobile-First**: Must perform well on mobile devices
4. **Cleanup Requirement**: All Three.js objects must register with CleanupRegistry
5. **VueUse Preference**: Use VueUse utilities over custom implementations where applicable

---

## 3. Functional Requirements

### 3.1 Billboard Orientation Modes

#### FR-1: Cylindrical Billboarding

The system must support cylindrical billboarding where sprites rotate only around the Y-axis to face the camera while remaining upright.

**Acceptance Criteria:**

- Sprite faces the camera horizontally at all times
- Sprite does not tilt when camera looks up or down
- Rotation updates every frame without visible snapping
- Works correctly with all camera positions and orientations

**Use Cases:** Player characters, NPCs, trees, buildings, environmental props

#### FR-2: Spherical Billboarding

The system must support spherical billboarding where sprites fully face the camera from any angle.

**Acceptance Criteria:**

- Sprite always directly faces the camera regardless of camera position
- No locked axes; sprite can tilt in any direction
- Smooth orientation updates without jittering

**Use Cases:** Particles, spell effects, floating damage numbers, item pickups, UI elements in 3D space

#### FR-3: Billboard Mode Switching

Components must allow runtime switching between billboard modes.

**Acceptance Criteria:**

- Billboard mode can be changed via component method
- Mode change takes effect on next frame
- No memory leaks when switching modes

### 3.2 Sprite Rendering

#### FR-4: Single-Frame Sprites

The system must support static sprites from individual textures.

**Acceptance Criteria:**

- Texture loads asynchronously with loading state feedback
- Texture uses NearestFilter for crisp pixel art rendering
- Transparency (alpha channel) renders correctly
- Sprite scales uniformly based on configuration

#### FR-5: Sprite Sheet Support

The system must support sprite sheets (texture atlases) with multiple frames arranged in a grid.

**Acceptance Criteria:**

- Configuration accepts sprite sheet dimensions (columns × rows)
- Individual frames addressable by index or (column, row) coordinates
- UV coordinates calculate correctly for any frame
- No texture bleeding between adjacent frames

#### FR-6: Frame-Based Animation

The system must support animated sprites using sprite sheet frames.

**Acceptance Criteria:**

- Animations defined by start frame, end frame, and FPS
- Multiple named animations per sprite (e.g., "idle", "walk", "attack")
- Current animation changeable at runtime via `play(animationName)`
- Looping and one-shot animation modes supported
- Animation state queryable (current frame, is playing, animation name)

#### FR-7: Animation Timing Precision

Animation frame timing must be frame-rate independent.

**Acceptance Criteria:**

- Animations play at consistent speed regardless of render FPS
- Accumulator pattern used for sub-frame timing precision
- No frame skipping or doubling under normal conditions

### 3.3 Component Integration

#### FR-8: TransformComponent Compatibility

Sprite components must work with the existing TransformComponent.

**Acceptance Criteria:**

- Sprite position controlled by TransformComponent
- Sprite scale affected by TransformComponent scale
- Sprite inherits parent transforms in scene graph

#### FR-9: InteractionSystem Compatibility

Sprites must be detectable by the existing InteractionSystem for raycasting.

**Acceptance Criteria:**

- Sprites can receive hover events
- Sprites can receive click events
- Hit detection works with transparent regions (configurable alpha threshold)
- InteractionComponent attaches to sprite GameObjects identically to mesh GameObjects

#### FR-10: PhysicsSystem Compatibility

Sprites must work with the existing Rapier3D physics system.

**Acceptance Criteria:**

- Sprite GameObjects can have physics colliders
- Collider shape independent of visual sprite (box, capsule, etc.)
- Physics debug visualization shows collider bounds

#### FR-11: VFXSystem Compatibility

Sprites should integrate with the existing VFX system where applicable.

**Acceptance Criteria:**

- Screen shake affects sprite rendering
- Future: Emissive effects can apply to sprites (stretch goal)

### 3.4 Resource Management

#### FR-12: Texture Caching

Loaded textures must be cached and shared across sprites using the same source.

**Acceptance Criteria:**

- Same texture file loaded only once regardless of sprite count
- Cache keyed by texture path
- Cache provides usage counting for cleanup decisions

#### FR-13: Cleanup Integration

All sprite resources must integrate with CleanupRegistry.

**Acceptance Criteria:**

- Sprite geometry disposed on component destroy
- Sprite material disposed on component destroy
- Shared textures disposed only when no longer referenced
- No WebGL resource warnings in console after cleanup

---

## 4. Non-Functional Requirements

### 4.1 Performance

#### NFR-1: Frame Rate Target

The system must maintain 55+ FPS with 200 animated sprites on a mid-range mobile device.

**Measurement:** Chrome DevTools Performance panel on simulated mobile (4× CPU slowdown)

#### NFR-2: Draw Call Efficiency

Sprites sharing the same texture atlas should batch into minimal draw calls.

**Target:** < 50 draw calls for 200 sprites using 5 different atlases

#### NFR-3: Memory Efficiency

Texture memory should remain bounded regardless of sprite count.

**Target:** < 100MB VRAM for typical game scene with sprites

### 4.2 Developer Experience

#### NFR-4: Consistent API

Sprite components must follow the same patterns as existing components.

**Measurement:** A developer familiar with MeshComponent can use SpriteComponent without documentation

#### NFR-5: Type Safety

All public APIs must be fully typed with TypeScript.

**Measurement:** No `any` types in public interfaces; IDE autocomplete works correctly

#### NFR-6: Error Messages

Configuration errors should produce helpful error messages.

**Example:** "SpriteAnimationComponent requires SpriteComponent on the same GameObject"

### 4.3 Maintainability

#### NFR-7: Single Responsibility

Each component should have one clear responsibility.

**Measurement:** Component descriptions fit in one sentence

#### NFR-8: Documentation

All public methods must have JSDoc comments.

**Measurement:** IDE hover shows useful information for all public APIs

---

## 5. Technical Design

### 5.1 Component Architecture

The system introduces four new components that follow the existing GameComponent patterns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         GameObject                               │
├─────────────────────────────────────────────────────────────────┤
│  TransformComponent (Priority: 1)                                │
│  ├── position, rotation, scale                                   │
│                                                                  │
│  SpriteComponent (Priority: 100) ─── provides TRAIT.MESH_PROVIDER│
│  ├── Creates PlaneGeometry + SpriteMaterial                      │
│  ├── Manages texture loading and UV setup                        │
│  ├── Registers mesh with scene and CleanupRegistry               │
│                                                                  │
│  BillboardComponent (Priority: 101)                              │
│  ├── Requires: SpriteComponent (via TRAIT.MESH_PROVIDER)         │
│  ├── Mode: 'cylindrical' | 'spherical' | 'none'                  │
│  ├── Updates mesh orientation each frame                         │
│                                                                  │
│  SpriteAnimationComponent (Priority: 102)                        │
│  ├── Requires: SpriteComponent                                   │
│  ├── Manages animation definitions and playback                  │
│  ├── Updates SpriteComponent UV each frame                       │
│                                                                  │
│  InteractionComponent (Priority: 300) ─── existing component     │
│  ├── Works with SpriteComponent's mesh for raycasting            │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Component Specifications

#### 5.2.1 SpriteComponent

**Purpose:** Creates and manages a textured plane that serves as the sprite's visual representation.

**Priority:** 100 (RENDERING) — same as MeshComponent

**Traits Provided:** `TRAIT.MESH_PROVIDER`

**Configuration Interface:**

```typescript
interface I_SpriteComponentConfig {
	// Texture source (required)
	texture: string; // Path to texture file

	// Sprite sheet configuration (optional)
	spriteSheet?: {
		columns: number; // Number of columns in sheet
		rows: number; // Number of rows in sheet
		frameWidth?: number; // Override calculated frame width
		frameHeight?: number; // Override calculated frame height
	};

	// Initial frame (optional, defaults to 0)
	initialFrame?: number;

	// Visual configuration
	size?: [number, number]; // Width, height in world units (default: [1, 1])
	anchor?: [number, number]; // Pivot point 0-1 (default: [0.5, 0])
	opacity?: number; // 0-1 (default: 1)

	// Rendering options
	alphaTest?: number; // Alpha threshold for transparency (default: 0.1)
	depthWrite?: boolean; // Write to depth buffer (default: false)
	renderOrder?: number; // Render order for transparency sorting
}
```

**Public Methods:**

```typescript
class SpriteComponent extends GameComponent {
	// Frame control
	setFrame(index: number): void;
	setFrame(column: number, row: number): void;
	getFrame(): number;

	// Appearance
	setOpacity(opacity: number): void;
	setTint(color: THREE.Color | number): void;
	setSize(width: number, height: number): void;

	// State
	isLoaded(): boolean;
	getTexture(): THREE.Texture | null;
	getMesh(): THREE.Mesh;
}
```

**Implementation Notes:**

1. Uses `THREE.PlaneGeometry` (not THREE.Sprite) to support cylindrical billboarding
2. Material uses `THREE.MeshBasicMaterial` with `map`, `transparent: true`, `side: THREE.DoubleSide`
3. Texture loading is asynchronous; mesh added to scene with placeholder until loaded
4. UV coordinates calculated based on sprite sheet configuration
5. Registers geometry, material, and texture with component's CleanupRegistry

#### 5.2.2 BillboardComponent

**Purpose:** Orients a sprite mesh to face the camera using the configured billboarding mode.

**Priority:** 101 — runs after SpriteComponent creates the mesh

**Dependencies:** Requires `TRAIT.MESH_PROVIDER` on the same GameObject

**Configuration Interface:**

```typescript
interface I_BillboardComponentConfig {
	mode: "cylindrical" | "spherical" | "none";

	// Advanced options
	lockAxis?: "x" | "y" | "z"; // Which axis to lock (default: 'y' for cylindrical)
	updateFrequency?: "always" | "onCameraMove"; // Optimization option
}
```

**Public Methods:**

```typescript
class BillboardComponent extends GameComponent {
	setMode(mode: "cylindrical" | "spherical" | "none"): void;
	getMode(): string;
}
```

**Implementation Notes:**

1. `cylindrical` mode: Uses `mesh.lookAt(camera.x, mesh.y, camera.z)` pattern
2. `spherical` mode: Copies `camera.quaternion` directly to mesh
3. Updates in the component's `update(delta)` method every frame
4. Accesses camera via `context.camera` stored during `init()`
5. No cleanup needed (no owned resources)

#### 5.2.3 SpriteAnimationComponent

**Purpose:** Manages frame-based sprite animations with timing control.

**Priority:** 102 — runs after BillboardComponent

**Dependencies:** Requires `SpriteComponent` on the same GameObject

**Configuration Interface:**

```typescript
interface I_AnimationDefinition {
	name: string;
	startFrame: number;
	endFrame: number;
	fps: number;
	loop?: boolean; // Default: true
	onComplete?: () => void; // Callback for non-looping animations
}

interface I_SpriteAnimationComponentConfig {
	animations: I_AnimationDefinition[];
	defaultAnimation?: string; // Auto-play on init
}
```

**Public Methods:**

```typescript
class SpriteAnimationComponent extends GameComponent {
	// Playback control
	play(animationName: string): void;
	stop(): void;
	pause(): void;
	resume(): void;

	// State queries
	isPlaying(): boolean;
	getCurrentAnimation(): string | null;
	getCurrentFrame(): number;

	// Dynamic animation management
	addAnimation(definition: I_AnimationDefinition): void;
	removeAnimation(name: string): void;
	hasAnimation(name: string): boolean;
}
```

**Implementation Notes:**

1. Uses accumulator pattern for frame-rate-independent timing
2. Calls `spriteComponent.setFrame()` when frame changes
3. Fires `onComplete` callback when non-looping animation ends
4. Validates animation names against registered animations

### 5.3 Trait System Extension

Add a new trait for mesh/sprite providers:

```typescript
// In GameComponent.ts, extend TRAIT object:
export const TRAIT = {
	MATERIAL_PROVIDER: Symbol("I_MaterialProvider"),
	MESH_PROVIDER: Symbol("I_MeshProvider"), // NEW
} as const;

// Interface for mesh providers
interface I_MeshProvider {
	getMesh(): THREE.Object3D;
}
```

This allows BillboardComponent and InteractionComponent to work with either MeshComponent or SpriteComponent.

### 5.4 Texture Management

#### TextureCache Utility

A singleton utility manages texture loading and caching:

```typescript
class TextureCache {
	private static instance: TextureCache;
	private cache: Map<string, { texture: THREE.Texture; refCount: number }>;
	private loader: THREE.TextureLoader;

	static getInstance(): TextureCache;

	// Load or retrieve cached texture
	async load(path: string, options?: TextureOptions): Promise<THREE.Texture>;

	// Reference counting for cleanup
	retain(path: string): void;
	release(path: string): void;

	// Force cleanup
	clear(): void;
}
```

**Usage Pattern:**

```typescript
// In SpriteComponent.init()
const cache = TextureCache.getInstance();
this.texture = await cache.load(this.config.texture, {
	minFilter: THREE.NearestFilter,
	magFilter: THREE.NearestFilter,
	generateMipmaps: false,
});
cache.retain(this.config.texture);

// In SpriteComponent.destroy()
TextureCache.getInstance().release(this.config.texture);
```

### 5.5 Directory Structure

New files should be placed following existing conventions:

```
src/game/
├── components/
│   ├── rendering/
│   │   ├── SpriteComponent.ts          # NEW
│   │   ├── BillboardComponent.ts       # NEW
│   │   ├── SpriteAnimationComponent.ts # NEW
│   │   ├── MeshComponent.ts            # existing
│   │   └── MaterialComponent.ts        # existing
│   └── ...
├── utils/
│   └── TextureCache.ts                 # NEW
├── common/
│   └── sprite.types.ts                 # NEW - shared interfaces
└── prefabs/
    └── SpriteCharacter.ts              # NEW - example prefab
```

---

## 6. Usage Examples

### 6.1 Static Sprite (Tree)

```typescript
// A simple tree that stays upright
export class TreePrefab extends GameObject {
	constructor(config: { id: string; position: [number, number, number]; variant?: number }) {
		super({ id: config.id, type: "environment" });

		this.addComponent(
			new TransformComponent({
				position: config.position,
			}),
		)
			.addComponent(
				new SpriteComponent({
					texture: "/assets/sprites/trees.png",
					spriteSheet: { columns: 4, rows: 2 },
					initialFrame: config.variant ?? 0,
					size: [2, 3],
					anchor: [0.5, 0], // Bottom-center anchor so tree "stands" on ground
				}),
			)
			.addComponent(
				new BillboardComponent({
					mode: "cylindrical",
				}),
			);
	}
}
```

### 6.2 Animated Character

```typescript
// A player character with walk and idle animations
export class PlayerSpritePrefab extends GameObject {
	constructor(config: { id: string; position: [number, number, number] }) {
		super({ id: config.id, type: "player" });

		this.addComponent(
			new TransformComponent({
				position: config.position,
			}),
		)
			.addComponent(
				new SpriteComponent({
					texture: "/assets/sprites/player.png",
					spriteSheet: { columns: 8, rows: 4 },
					size: [1, 1.5],
					anchor: [0.5, 0],
				}),
			)
			.addComponent(
				new BillboardComponent({
					mode: "cylindrical",
				}),
			)
			.addComponent(
				new SpriteAnimationComponent({
					animations: [
						{ name: "idle", startFrame: 0, endFrame: 3, fps: 6 },
						{ name: "walk", startFrame: 8, endFrame: 15, fps: 12 },
						{ name: "attack", startFrame: 16, endFrame: 23, fps: 16, loop: false },
					],
					defaultAnimation: "idle",
				}),
			)
			.addComponent(
				new InteractionComponent({
					enableHover: true,
					enableClick: true,
				}),
			);
	}
}

// Usage in scene:
const player = new PlayerSpritePrefab({ id: "player-1", position: [0, 0, 0] });
await gameObjectsManager.add(player);

// Control animation from game logic:
const animation = player.getComponent(SpriteAnimationComponent);
animation.play("walk");
```

### 6.3 Particle Effect (Spherical Billboard)

```typescript
// A floating magic particle that always faces camera
export class MagicParticlePrefab extends GameObject {
	constructor(config: { id: string; position: [number, number, number] }) {
		super({ id: config.id, type: "effect" });

		this.addComponent(
			new TransformComponent({
				position: config.position,
			}),
		)
			.addComponent(
				new SpriteComponent({
					texture: "/assets/sprites/particles.png",
					spriteSheet: { columns: 4, rows: 4 },
					size: [0.5, 0.5],
					anchor: [0.5, 0.5], // Center anchor for floating effect
					depthWrite: false,
					renderOrder: 100, // Render after solid objects
				}),
			)
			.addComponent(
				new BillboardComponent({
					mode: "spherical", // Always faces camera, even from above
				}),
			)
			.addComponent(
				new SpriteAnimationComponent({
					animations: [{ name: "glow", startFrame: 0, endFrame: 15, fps: 24 }],
					defaultAnimation: "glow",
				}),
			);
	}
}
```

### 6.4 Mixed Scene (Sprites + 3D Objects)

```typescript
// Sprites can coexist with 3D meshes in the same scene
class PlaygroundScene extends GameScene {
	protected addSceneObjects(): void {
		// 3D ground plane (existing pattern)
		const ground = new GameObject({ id: "ground" })
			.addComponent(new TransformComponent({ position: [0, 0, 0] }))
			.addComponent(new GeometryComponent({ type: "plane", params: [50, 50] }))
			.addComponent(new MaterialComponent({ color: 0x228b22 }))
			.addComponent(new MeshComponent());

		// Sprite-based trees
		for (let i = 0; i < 20; i++) {
			const tree = new TreePrefab({
				id: `tree-${i}`,
				position: [Math.random() * 40 - 20, 0, Math.random() * 40 - 20],
				variant: Math.floor(Math.random() * 8),
			});
			this.services.gameObjectsManager.add(tree);
		}

		// Sprite-based player
		const player = new PlayerSpritePrefab({
			id: "local-player",
			position: [0, 0, 0],
		});
		this.services.gameObjectsManager.add(player);
	}
}
```

---

## 7. Implementation Phases

### Phase 1: Core Sprite Rendering (Priority: Critical)

**Scope:** SpriteComponent with static sprite support

**Deliverables:**

1. `SpriteComponent` class with single-texture support
2. `TextureCache` utility with loading and caching
3. Basic cleanup integration
4. Unit tests for component lifecycle

**Acceptance Test:**

```typescript
const sprite = new GameObject({ id: "test" }).addComponent(new TransformComponent({ position: [0, 0, 0] })).addComponent(new SpriteComponent({ texture: "/test.png", size: [1, 1] }));
// Sprite renders at origin, facing +Z direction
```

**Estimated Effort:** 2-3 days

---

### Phase 2: Billboard Orientation (Priority: Critical)

**Scope:** BillboardComponent with both modes

**Deliverables:**

1. `BillboardComponent` class
2. Cylindrical billboarding implementation
3. Spherical billboarding implementation
4. Integration with camera system

**Acceptance Test:**

```typescript
// Cylindrical: Sprite stays upright when camera looks from above
// Spherical: Sprite tilts to face camera from any angle
```

**Estimated Effort:** 1-2 days

---

### Phase 3: Sprite Sheet Support (Priority: High)

**Scope:** Extend SpriteComponent for sprite sheets

**Deliverables:**

1. Sprite sheet configuration parsing
2. UV coordinate calculation
3. `setFrame()` method implementation
4. Frame bleeding prevention

**Acceptance Test:**

```typescript
const sprite = new SpriteComponent({
	texture: "/sheet.png",
	spriteSheet: { columns: 8, rows: 4 },
	initialFrame: 5,
});
sprite.setFrame(12); // Shows correct frame without bleeding
```

**Estimated Effort:** 1-2 days

---

### Phase 4: Animation System (Priority: High)

**Scope:** SpriteAnimationComponent

**Deliverables:**

1. `SpriteAnimationComponent` class
2. Animation definition parsing
3. Frame timing with accumulator pattern
4. Playback control methods
5. Loop and one-shot modes

**Acceptance Test:**

```typescript
const anim = sprite.getComponent(SpriteAnimationComponent);
anim.play("walk"); // Sprite cycles through walk frames at configured FPS
anim.play("attack"); // One-shot animation fires onComplete
```

**Estimated Effort:** 2-3 days

---

### Phase 5: System Integration (Priority: Medium)

**Scope:** Ensure sprites work with all existing systems

**Deliverables:**

1. InteractionSystem compatibility verification
2. PhysicsSystem integration testing
3. TRAIT.MESH_PROVIDER implementation
4. Example prefabs (Tree, Character, Particle)

**Acceptance Test:**

```typescript
// Sprite receives hover/click events
// Sprite has physics collider that works with existing physics
```

**Estimated Effort:** 2-3 days

---

### Phase 6: Performance Optimization (Priority: Medium)

**Scope:** Ensure performance targets are met

**Deliverables:**

1. Performance profiling with 200+ sprites
2. Texture atlas batching (if needed)
3. Billboard update optimization (skip when camera stationary)
4. Documentation of performance characteristics

**Acceptance Test:**

```
200 animated sprites on screen, mobile device simulation
Target: 55+ FPS
```

**Estimated Effort:** 2-3 days

---

## 8. Testing Requirements

### 8.1 Unit Tests

Each component requires unit tests covering:

1. **SpriteComponent:**

    - Texture loading success and failure paths
    - Frame index bounds checking
    - UV calculation accuracy
    - Cleanup disposal

2. **BillboardComponent:**

    - Cylindrical orientation calculation
    - Spherical orientation calculation
    - Mode switching

3. **SpriteAnimationComponent:**
    - Animation playback timing
    - Loop behavior
    - One-shot completion callbacks
    - Animation switching

### 8.2 Integration Tests

1. Sprite + Billboard + Animation together
2. Sprite with InteractionComponent
3. Multiple sprites with shared texture (cache verification)
4. Scene cleanup with sprites

### 8.3 Visual Tests

Create a test scene accessible via development build:

```
/debug/sprite-test
```

Features:

- Grid of sprites demonstrating all billboard modes
- Animation playback controls
- Performance metrics overlay
- Camera orbit to verify billboard behavior

---

## 9. Documentation Requirements

### 9.1 Code Documentation

All public APIs must include JSDoc comments with:

- Brief description
- Parameter descriptions
- Return value description
- Usage example

### 9.2 Architecture Documentation

Update `docs/architecture.md` with:

- Sprite component diagram
- Billboard mode explanations
- Decision guide: When to use sprites vs meshes

### 9.3 Usage Guide

Create `docs/sprites.md` covering:

- Quick start example
- Sprite sheet preparation guidelines
- Animation definition format
- Common patterns and prefabs
- Performance tips

---

## 10. Open Questions

The following questions should be resolved during implementation:

1. **Directional Sprites:** Should we support Doom-style 8-directional sprites where the frame changes based on viewing angle? (Defer to Phase 7 if yes)

2. **Sprite Layering:** Should we support multiple sprite layers per character (body, clothing, equipment)? This affects the component architecture. (Recommend: Defer to v2)

3. **Shader Customization:** Should sprites support custom shaders for effects like flash-white on damage? (Recommend: Add optional `shader` config in Phase 6)

4. **Instancing:** For scenes with 500+ identical sprites (e.g., grass), should we implement GPU instancing? (Recommend: Defer until performance profiling proves necessity)

---

## 11. Appendix

### A. Texture Preparation Guidelines

For sprite sheets to work correctly:

1. **Power-of-Two Dimensions:** Texture dimensions should be powers of 2 (256, 512, 1024, 2048, 4096)
2. **Uniform Frame Size:** All frames must be the same size
3. **No Padding Required:** System handles UV calculation without padding (uses NearestFilter)
4. **PNG Format:** Use PNG for transparency support
5. **Max Dimension:** 4096×4096 for maximum device compatibility

### B. Performance Budgets

| Metric         | Target  | Warning   | Critical |
| -------------- | ------- | --------- | -------- |
| Frame Time     | < 16ms  | 16-20ms   | > 20ms   |
| Draw Calls     | < 100   | 100-200   | > 200    |
| Texture Memory | < 100MB | 100-150MB | > 150MB  |
| Sprite Count   | 200+    | 300+      | 500+     |

### C. Glossary

- **Billboard:** A 2D plane that rotates to face the camera
- **Cylindrical Billboard:** Billboard that only rotates around the Y-axis (stays upright)
- **Spherical Billboard:** Billboard that fully faces the camera from any angle
- **Sprite Sheet:** A single texture containing multiple animation frames in a grid
- **Texture Atlas:** A larger texture containing multiple unrelated images for batching
- **UV Coordinates:** Texture mapping coordinates (0-1 range)

---

**Document History:**

| Version | Date     | Author | Changes     |
| ------- | -------- | ------ | ----------- |
| 1.0     | Dec 2024 | Claude | Initial PRD |

---

_End of Document_
