import type { MagnificationTextureFilter, Mesh, MinificationTextureFilter, Wrapping } from "three";

// Re-export from mesh.types.ts for convenience
export type { I_MeshProvider } from "./mesh.types";

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

/** Facing direction for directional sprites */
export type SpriteDirection = "down" | "left" | "right" | "up" | "down-left" | "down-right" | "up-left" | "up-right";

/** Single texture source in a multi-texture sprite sheet */
export interface TextureSource {
	/** Unique ID to reference this texture in animations */
	id: string;
	/** Path to the texture file */
	src: string;
	/** Optional: columns in this specific texture (overrides global) */
	columns?: number;
	/** Optional: rows in this specific texture (overrides global) */
	rows?: number;
}

/** Texture configuration - either single path or array of sources */
export type TextureConfig = string | TextureSource[];

// ============================================================================
// SPRITE SHEET REGISTRATION (PUBLIC API)
// ============================================================================

/**
 * Animation definition for sprite sheet registration.
 *
 * Two modes:
 * 1. Animated: Provide `frameCount` + `fps` for frame sequences
 * 2. Static: Provide `row` + `column` for single frame selection from atlas
 *
 * @example Animated
 * ```ts
 * { name: 'idle', row: 1, frameCount: 6, fps: 4 }
 * ```
 *
 * @example Static frame
 * ```ts
 * { name: 'idle', row: 1, column: 2 }  // Selects single cell
 * ```
 */
export interface SpriteAnimation {
	/** Animation name (e.g., 'idle', 'walk', 'attack') */
	name: string;

	/** Row index (1-indexed). Auto-calculated if omitted for sequential animations. */
	row?: number;

	// --- Animated mode ---
	/** Number of frames in sequence. Omit for static frame selection. */
	frameCount?: number;
	/** Frames per second (required if frameCount provided) */
	fps?: number;
	/** Loop animation (default: true) */
	loop?: boolean;

	// --- Static mode ---
	/** Column index (1-indexed) for static frame selection */
	column?: number;

	// --- Multi-texture/directional ---
	/** Direction this animation represents (for directional sprites) */
	direction?: SpriteDirection;
	/** Texture ID for multi-texture sheets */
	textureId?: string;
}

/**
 * Sprite sheet registration config.
 *
 * Use `SpriteSheetRegistry.register(config)` to register.
 *
 * @example Static sprite (tree, single image)
 * ```ts
 * { id: 'tree', texture: '/tree.png', size: [4, 5] }
 * ```
 *
 * @example Atlas with static frame selection (rock variants)
 * ```ts
 * {
 *   id: 'rock-00',
 *   texture: '/rocks.png',
 *   columns: 3, rows: 2,
 *   size: [2, 1.5],
 *   animations: [{ name: 'idle', row: 1, column: 1 }]
 * }
 * ```
 *
 * @example Animated sprite
 * ```ts
 * {
 *   id: 'slime',
 *   texture: '/slime.png',
 *   columns: 7, rows: 12,
 *   size: [2.5, 2.5],
 *   animations: [{ name: 'idle', row: 1, frameCount: 4, fps: 6 }]
 * }
 * ```
 */
export interface SpriteSheet {
	/** Unique identifier */
	id: string;

	/** Texture source - path or array of {id, src} for multi-texture */
	texture: TextureConfig;

	/** Frame size in pixels [width, height] - explicit pixel dimensions per frame */
	frameSize?: [number, number];

	/** World size [width, height] - how big to render in world units */
	size: [number, number];

	/** Grid columns (default: 1) */
	columns?: number;
	/** Grid rows (default: 1) */
	rows?: number;

	/** Anchor point [x, y] where 0.5,0 is bottom-center (default: [0.5, 0]) */
	anchor?: [number, number];

	/** Animation definitions */
	animations?: SpriteAnimation[];

	/** Default animation name */
	defaultAnimation?: string;

	/** Enable directional expansion (4 directions per animation) */
	directional?: boolean;

	/** Direction order (default: ['down', 'left', 'right', 'up']) */
	directionOrder?: SpriteDirection[];
}

// ============================================================================
// RUNTIME ANIMATION (used by SpriteAnimatorComponent)
// ============================================================================

/**
 * Runtime animation clip with resolved frame indices.
 * Built by SpriteSheetRegistry.buildAnimations().
 */
export interface AnimationClip {
	/** Animation name (may include direction suffix like 'walk-left') */
	name: string;
	/** First frame index (inclusive) */
	startFrame: number;
	/** Last frame index (inclusive) */
	endFrame: number;
	/** Frames per second */
	fps: number;
	/** Loop animation (default: true) */
	loop?: boolean;
	/** Callback when non-looping animation completes */
	onComplete?: () => void;
	/** Texture path for this animation (for multi-texture) */
	texturePath?: string;
	/** Texture ID (for multi-texture) */
	textureId?: string;
}

// ============================================================================
// SPRITE COMPONENT CONFIG
// ============================================================================

/** Texture options for TextureCache loading */
export interface I_TextureOptions {
	minFilter?: MinificationTextureFilter;
	magFilter?: MagnificationTextureFilter;
	generateMipmaps?: boolean;
	wrapS?: Wrapping;
	wrapT?: Wrapping;
}

/** Sprite grid layout (columns/rows) for SpriteComponent */
export interface SpriteGrid {
	/** Number of columns in the sprite sheet */
	columns: number;
	/** Number of rows in the sprite sheet */
	rows: number;
	/** Override calculated frame width (pixels) */
	frameWidth?: number;
	/** Override calculated frame height (pixels) */
	frameHeight?: number;
}

/** SpriteComponent configuration */
export interface I_SpriteComponentConfig {
	/** Path to texture file (required) */
	texture: string;

	/** Sprite sheet configuration for multi-frame sprites */
	spriteSheet?: SpriteGrid;

	/** Initial frame index (default: 0) */
	initialFrame?: number;

	/** Width and height in world units (default: [1, 1]) */
	size?: [number, number];

	/**
	 * Pivot point 0-1 (default: [0.5, 0] - bottom-center)
	 * [0.5, 0.5] = center, [0.5, 0] = bottom-center, [0.5, 1] = top-center
	 */
	anchor?: [number, number];

	/**
	 * Position offset in world units (default: [0, 0])
	 * Intuitive: positive X = move right, positive Y = raise sprite
	 */
	offset?: [number, number];

	/** Opacity 0-1 (default: 1) */
	opacity?: number;

	/** Alpha threshold for transparency (default: 0.1) */
	alphaTest?: number;

	/** Write to depth buffer (default: false for proper transparency) */
	depthWrite?: boolean;

	/** Render order for transparency sorting (default: 0) */
	renderOrder?: number;

	/** Cast shadows (default: false) */
	castShadow?: boolean;

	/** Receive shadows (default: false) */
	receiveShadow?: boolean;
}

// ============================================================================
// BILLBOARD CONFIG
// ============================================================================

/** Billboard orientation modes */
export type BillboardMode = "cylindrical" | "spherical" | "none";

/** BillboardComponent configuration */
export interface I_BillboardComponentConfig {
	/**
	 * Billboard mode:
	 * - 'cylindrical': Rotates around Y-axis only (stays upright) - use for characters, trees
	 * - 'spherical': Fully faces camera from any angle - use for particles, effects
	 * - 'none': No billboarding (static orientation)
	 */
	mode: BillboardMode;

	/** Which axis to lock for cylindrical mode (default: 'y') */
	lockAxis?: "x" | "y" | "z";

	/**
	 * Maximum rotation from neutral forward direction (radians)
	 * Limits how far the sprite can turn toward the camera
	 * Default: Math.PI/15 (12°)
	 */
	maxRotation?: number;
}

// ============================================================================
// SPRITE PROVIDER INTERFACE
// ============================================================================

/** Interface for components that provide sprite functionality */
export interface I_SpriteProvider {
	/** Get the sprite mesh */
	getMesh(): Mesh;
	/** Set the current frame (by index) */
	setFrame(index: number): void;
	/** Set the current frame (by column, row) */
	setFrameByPosition(column: number, row: number): void;
	/** Get current frame index */
	getFrame(): number;
	/** Check if texture is loaded */
	isLoaded(): boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Check if texture config is multi-texture */
export function IsMultiTexture(texture: TextureConfig): texture is TextureSource[] {
	return Array.isArray(texture);
}

/** Get the first/default texture path */
export function GetDefaultTexturePath(texture: TextureConfig): string {
	if (IsMultiTexture(texture)) {
		return texture[0]?.src ?? "";
	}
	return texture;
}

/** Get texture path by ID */
export function GetTexturePathById(texture: TextureConfig, id: string): string | undefined {
	if (IsMultiTexture(texture)) {
		return texture.find((t) => t.id === id)?.src;
	}
	return texture;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/** Check if animation is static (single frame) vs animated (frame sequence) */
export function isStaticAnimation(anim: SpriteAnimation): boolean {
	return anim.column !== undefined && anim.frameCount === undefined;
}

// ============================================================================
// DEPRECATED - Remove in next major version
// ============================================================================

/**
 * @deprecated Use SpriteGrid instead
 */
export type I_SpriteSheetConfig = SpriteGrid;

/**
 * @deprecated Use AnimationClip instead
 */
export type I_AnimationDefinition = AnimationClip;

/**
 * @deprecated Use SpriteSheet instead (from SpriteSheetRegistry)
 */
export type I_QuickSpriteSheetConfig = SpriteSheet;
