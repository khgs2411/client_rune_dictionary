/**
 * Sprite Sheet Definition Types
 *
 * Provides a declarative way to define sprite sheet layouts
 * so animation definitions can be auto-generated.
 *
 * Supports both single-texture and multi-texture sprite sheets.
 */

/**
 * Facing direction for directional sprites
 */
export type SpriteDirection = "down" | "left" | "right" | "up" | "down-left" | "down-right" | "up-left" | "up-right";

/**
 * Common animation names for characters
 */
export type CharacterAnimationName = "idle" | "walk" | "run" | "attack" | "hurt" | "death" | "cast" | "block" | string;

/**
 * Single texture source in a multi-texture sprite sheet
 */
export interface I_TextureSource {
	/** Unique ID to reference this texture in animations */
	id: string;
	/** Path to the texture file */
	src: string;
	/** Optional: columns in this specific texture (overrides global) */
	columns?: number;
	/** Optional: rows in this specific texture (overrides global) */
	rows?: number;
}

/**
 * Texture configuration - either single path or array of sources
 */
export type TextureConfig = string | I_TextureSource[];

/**
 * Single animation row definition in a sprite sheet
 *
 * Describes one row of frames in the sprite sheet.
 * For directional sprites, each direction gets its own row.
 */
export interface I_AnimationRowDefinition {
	/** Animation name (e.g., 'idle', 'walk', 'attack') */
	name: CharacterAnimationName;

	/** Row index in the sprite sheet (0-based) */
	row: number;

	/** Number of frames in this animation */
	frameCount: number;

	/** Frames per second */
	fps: number;

	/** Whether animation loops (default: true) */
	loop?: boolean;

	/** Optional direction if using directional sprites */
	direction?: SpriteDirection;

	/** Texture ID (required for multi-texture sheets) */
	textureId?: string;
}

/**
 * Complete sprite sheet definition
 *
 * Defines the layout and animations in a sprite sheet.
 */
export interface I_SpriteSheetDefinition {
	/** Unique identifier for this sprite sheet definition */
	id: string;

	/** Human-readable name */
	name?: string;

	/** Texture source(s) - single path or array of {id, src} */
	texture: TextureConfig;

	/** Grid dimensions (default for all textures) */
	columns: number;
	rows: number;

	/** Size in world units [width, height] */
	size: [number, number];

	/** Anchor point [x, y] where 0.5,0 is bottom-center */
	anchor?: [number, number];

	/** Animation definitions */
	animations: I_AnimationRowDefinition[];

	/** Default animation to play */
	defaultAnimation?: string;

	/**
	 * Layout pattern for quick setup:
	 * - 'single': All animations in sequence, no directions
	 * - 'directional-4': 4 directions (down, left, right, up) per animation
	 * - 'directional-8': 8 directions per animation
	 * - 'custom': Use animations array directly
	 */
	layout?: "single" | "directional-4" | "directional-8" | "custom";

	/** Whether this uses multiple texture files */
	isMultiTexture?: boolean;
}

/**
 * Simplified animation definition for non-directional sprites
 *
 * Use with layout: 'single' for simple sprite sheets
 */
export interface I_SimpleAnimationDef {
	/** Animation name */
	name: string;
	/** Number of frames */
	frameCount: number;
	/** Frames per second */
	fps: number;
	/** Loop animation (default: true) */
	loop?: boolean;
	/**
	 * Texture ID for multi-texture sheets
	 * Required when using texture: [{id, src}, ...]
	 */
	textureId?: string;
	/**
	 * Explicit row index (0-based) in the sprite sheet.
	 * If provided, overrides sequential row calculation.
	 * Use this when animations aren't in sequential order.
	 */
	row?: number;
	/**
	 * Direction this animation represents (for directional sprites).
	 * Used with directional: true to specify which direction each row is for.
	 */
	direction?: SpriteDirection;
}

/**
 * Directional animation set
 *
 * Use with layout: 'directional-4' or 'directional-8'
 * Each animation gets one row per direction
 */
export interface I_DirectionalAnimationDef {
	name: string;
	frameCount: number;
	fps: number;
	loop?: boolean;
	textureId?: string;
}

/**
 * Quick definition format for sprite sheets
 *
 * Supports both single-texture and multi-texture configurations.
 *
 * Single texture example:
 * ```typescript
 * {
 *   id: 'knight',
 *   texture: '/sprites/knight.png',
 *   // ...
 * }
 * ```
 *
 * Multi-texture example:
 * ```typescript
 * {
 *   id: 'knight',
 *   texture: [
 *     { id: 'idle', src: '/sprites/knight_idle.png' },
 *     { id: 'walk', src: '/sprites/knight_walk.png' },
 *   ],
 *   animations: [
 *     { textureId: 'idle', name: 'idle', frameCount: 4, fps: 6 },
 *     { textureId: 'walk', name: 'walk', frameCount: 6, fps: 10 },
 *   ],
 * }
 * ```
 */
export interface I_QuickSpriteSheetConfig {
	/** Unique ID */
	id: string;

	/**
	 * Texture source(s)
	 * - Single path: '/sprites/knight.png'
	 * - Multiple: [{ id: 'idle', src: '/sprites/knight_idle.png' }, ...]
	 */
	texture: TextureConfig;

	/** Frames per row (columns) - default for all textures (1-indexed)*/
	framesPerRow: number;

	/** Total rows in sheet - default for all textures (1-indexed)*/
	totalRows: number;

	/** Size in world units */
	size: [number, number];

	/**
	 * Animations in order they appear in the sheet
	 * For directional sheets, each animation takes 4 rows
	 * For multi-texture, include textureId to specify which texture
	 */
	animations: I_SimpleAnimationDef[];

	/**
	 * Direction order in the sheet (default: ['down', 'left', 'right', 'up'])
	 */
	directionOrder?: SpriteDirection[];

	/** Is this a directional sprite sheet? */
	directional?: boolean;

	/** Default animation */
	defaultAnimation?: string;

	/** Anchor point */
	anchor?: [number, number];
}

/**
 * Runtime sprite state with current direction
 */
export interface I_SpriteState {
	animation: string;
	direction: SpriteDirection;
	isPlaying: boolean;
}

/**
 * Extended animation definition with texture info (internal use)
 */
export interface I_ExtendedAnimationDefinition {
	/** Animation name (may include direction suffix) */
	name: string;
	/** First frame index */
	startFrame: number;
	/** Last frame index */
	endFrame: number;
	/** Frames per second */
	fps: number;
	/** Loop animation */
	loop?: boolean;
	/** Completion callback */
	onComplete?: () => void;
	/** Texture path for this animation (for multi-texture) */
	texturePath?: string;
	/** Texture ID (for multi-texture) */
	textureId?: string;
}

/**
 * Helper to check if texture config is multi-texture
 */
export function IsMultiTexture(texture: TextureConfig): texture is I_TextureSource[] {
	return Array.isArray(texture);
}

/**
 * Helper to get the first/default texture path
 */
export function GetDefaultTexturePath(texture: TextureConfig): string {
	if (IsMultiTexture(texture)) {
		return texture[0]?.src ?? "";
	}
	return texture;
}

/**
 * Helper to get texture path by ID
 */
export function GetTexturePathById(texture: TextureConfig, id: string): string | undefined {
	if (IsMultiTexture(texture)) {
		return texture.find((t) => t.id === id)?.src;
	}
	return texture;
}
