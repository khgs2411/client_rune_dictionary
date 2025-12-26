import type { MagnificationTextureFilter, Mesh, MinificationTextureFilter, Wrapping } from "three";

// Re-export from mesh.types.ts for convenience
export type { I_MeshProvider } from "./mesh.types";

/**
 * Texture options for TextureCache loading
 */
export interface I_TextureOptions {
	minFilter?: MinificationTextureFilter;
	magFilter?: MagnificationTextureFilter;
	generateMipmaps?: boolean;
	wrapS?: Wrapping;
	wrapT?: Wrapping;
}

/**
 * Sprite sheet configuration for multi-frame sprites
 */
export interface I_SpriteSheetConfig {
	/** Number of columns in the sprite sheet */
	columns: number;
	/** Number of rows in the sprite sheet */
	rows: number;
	/** Override calculated frame width (pixels) */
	frameWidth?: number;
	/** Override calculated frame height (pixels) */
	frameHeight?: number;
}

/**
 * SpriteComponent configuration
 */
export interface I_SpriteComponentConfig {
	/** Path to texture file (required) */
	texture: string;

	/** Sprite sheet configuration for multi-frame sprites */
	spriteSheet?: I_SpriteSheetConfig;

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
	 * Use this to fine-tune sprite position relative to transform
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

/**
 * Billboard orientation modes
 */
export type BillboardMode = "cylindrical" | "spherical" | "none";

/**
 * BillboardComponent configuration
 */
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
	 * Example: Math.PI/6 = 30°, Math.PI/15 = 12°
	 * Default: Math.PI/15 (12°)
	 */
	maxRotation?: number;
}

/**
 * Animation definition for sprite animation components
 */
export interface I_AnimationDefinition {
	/** Unique animation name */
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
}

/**
 * @deprecated Use I_SpriteAnimatorConfig from SpriteAnimatorComponent instead
 */
export interface I_SpriteAnimationComponentConfig {
	/** Animation definitions */
	animations: I_AnimationDefinition[];
	/** Animation to play on init (optional) */
	defaultAnimation?: string;
}

/**
 * Interface for components that provide sprite functionality
 */
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
