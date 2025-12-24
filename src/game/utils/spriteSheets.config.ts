/**
 * Sprite Sheet Definitions
 *
 * Register all your character and object sprite sheets here.
 * These definitions are loaded at game initialization and can be
 * used anywhere via the SpriteSheetRegistry.
 *
 * Supports two formats:
 *
 * 1. SINGLE TEXTURE: All animations in one image file
 *    - Each animation takes 4 rows (one per direction)
 *    - Rows are sequential: idle-down, idle-left, idle-right, idle-up, walk-down, etc.
 *
 * 2. MULTI-TEXTURE: Each animation in a separate image file
 *    - Each file contains 4 rows (one per direction)
 *    - Animation references its texture via textureId
 *
 * Usage:
 * 1. Import and call `registerAllSpriteSheets()` in your game init
 * 2. Create characters using the CharacterSprite prefab
 */

import { registerSpriteSheet } from "./SpriteSheetRegistry";

/**
 * Register all game sprite sheets
 *
 * Call this once during game initialization, before creating any characters.
 */
export function registerAllSpriteSheets(): void {
	// ===== SINGLE TEXTURE EXAMPLES =====

	/**
	 * Knight Character - Single Texture
	 * All animations in one file, 6 frames per animation, 4 directions
	 * Layout: 8 rows total (2 animations × 4 directions)
	 */
	registerSpriteSheet({
		id: "knight",
		texture: "/sprites/knight_00.png",
		framesPerRow: 6,
		totalRows: 8,
		size: [1, 1.5],
		directional: true,
		directionOrder: ["down", "left", "right", "up"],
		animations: [
			{ name: "idle", frameCount: 4, fps: 6 },
			{ name: "walk", frameCount: 6, fps: 10 },
		],
		defaultAnimation: "idle",
	});

	/**
	 * Goblin Enemy - Single Texture
	 */
	registerSpriteSheet({
		id: "goblin",
		texture: "/sprites/goblin_00.png",
		framesPerRow: 6,
		totalRows: 8,
		size: [0.8, 1.2],
		directional: true,
		animations: [
			{ name: "idle", frameCount: 4, fps: 6 },
			{ name: "walk", frameCount: 6, fps: 12 },
		],
		defaultAnimation: "idle",
	});

	// ===== MULTI-TEXTURE EXAMPLES =====

	/**
	 * Mage Character - Multi-Texture
	 * Each animation in its own file
	 *
	 * File layout (each file):
	 * - 4 rows (down, left, right, up)
	 * - N frames per row depending on animation
	 */
	registerSpriteSheet({
		id: "mage",
		texture: [
			{ id: "idle", src: "/sprites/mage_00_idle.png" },
			{ id: "walk", src: "/sprites/mage_00_walk.png" },
			{ id: "attack", src: "/sprites/mage_00_attack.png" },
		],
		framesPerRow: 8, // Max frames in any animation
		totalRows: 4, // 4 directions per file
		size: [1, 1.5],
		directional: true,
		animations: [
			{ textureId: "idle", name: "idle", frameCount: 4, fps: 6 },
			{ textureId: "walk", name: "walk", frameCount: 6, fps: 10 },
			{ textureId: "attack", name: "attack", frameCount: 8, fps: 14, loop: false },
		],
		defaultAnimation: "idle",
	});

	/**
	 * Example: RPG Character with many animations - Multi-Texture
	 * Shows how to organize a character with 5+ animations
	 */
	// registerSpriteSheet({
	// 	id: "hero",
	// 	texture: [
	// 		{ id: "idle", src: "/sprites/hero_idle.png" },
	// 		{ id: "walk", src: "/sprites/hero_walk.png" },
	// 		{ id: "run", src: "/sprites/hero_run.png" },
	// 		{ id: "attack", src: "/sprites/hero_attack.png" },
	// 		{ id: "hurt", src: "/sprites/hero_hurt.png" },
	// 		{ id: "death", src: "/sprites/hero_death.png" },
	// 		{ id: "cast", src: "/sprites/hero_cast.png" },
	// 	],
	// 	framesPerRow: 12,
	// 	totalRows: 4,
	// 	size: [1, 1.5],
	// 	directional: true,
	// 	animations: [
	// 		{ textureId: "idle", name: "idle", frameCount: 4, fps: 6 },
	// 		{ textureId: "walk", name: "walk", frameCount: 8, fps: 10 },
	// 		{ textureId: "run", name: "run", frameCount: 8, fps: 14 },
	// 		{ textureId: "attack", name: "attack", frameCount: 6, fps: 12, loop: false },
	// 		{ textureId: "hurt", name: "hurt", frameCount: 3, fps: 8, loop: false },
	// 		{ textureId: "death", name: "death", frameCount: 8, fps: 8, loop: false },
	// 		{ textureId: "cast", name: "cast", frameCount: 10, fps: 10, loop: false },
	// 	],
	// 	defaultAnimation: "idle",
	// });

	// ===== LOCAL PLAYER =====

	/**
	 * Local Player Character - Explicit Row Mapping
	 *
	 * Uses explicit row indices for non-standard sprite sheet layout.
	 * Same animation used for all directions, flip X when facing left.
	 *
	 * Layout:
	 * - Row 1: idle (side view)
	 * - Row 4: walk (side view)
	 */
	registerSpriteSheet({
		id: "local-player",
		texture: "/sprites/character/player.png",
		framesPerRow: 6,
		totalRows: 10, // Total rows in the sprite sheet
		size: [3,4],
		directional: false, // Same animation for all directions
		animations: [
			{ name: "idle", row: 1, frameCount: 6, fps: 6 },
			{ name: "walk", row: 4, frameCount: 6, fps: 10 },
		],
		defaultAnimation: "idle",
		anchor: [0.5, .125], // Bottom-center for standing character
	});

	registerSpriteSheet({
		id: "slime",
		texture: "/sprites/enemies/slime.png",
		framesPerRow: 7,
		totalRows: 12, // Total rows in the sprite sheet
		size: [3, 4],
		directional: false, // Same animation for all directions
		animations: [
			{ name: "idle", row: 0, frameCount: 4, fps: 6 },
		],
		defaultAnimation: "idle",
		anchor: [0.5, 0.125], // Bottom-center for standing character
	});

	// ===== ENVIRONMENT (Static, non-directional) =====

	/**
	 * Tree variations - Single row of different tree sprites
	 */
	registerSpriteSheet({
		id: "trees",
		texture: "/sprites/tree_00.png",
		framesPerRow: 4,
		totalRows: 1,
		size: [2, 3],
		directional: false,
		animations: [{ name: "default", frameCount: 1, fps: 1, loop: false }],
		defaultAnimation: "default",
		anchor: [0.5, 0],
	});

	/**
	 * Houses/Buildings
	 */
	registerSpriteSheet({
		id: "house",
		texture: "/sprites/house_00.png",
		framesPerRow: 1,
		totalRows: 1,
		size: [3, 3],
		directional: false,
		animations: [{ name: "default", frameCount: 1, fps: 1, loop: false }],
		defaultAnimation: "default",
		anchor: [0.5, 0],
	});

	console.log("[SpriteSheets] Registered all sprite sheets");
}

/**
 * Helper to register a full RPG character with common animations
 *
 * Use for characters with: idle, walk, run, attack, hurt, death
 */
export function registerFullCharacter(
	id: string,
	texturePath: string,
	options?: {
		size?: [number, number];
		framesPerRow?: number;
	},
): void {
	const framesPerRow = options?.framesPerRow ?? 8;
	const size = options?.size ?? [1, 1.5];

	registerSpriteSheet({
		id,
		texture: texturePath,
		framesPerRow,
		totalRows: 24, // 6 animations × 4 directions
		size,
		directional: true,
		animations: [
			{ name: "idle", frameCount: 4, fps: 6 },
			{ name: "walk", frameCount: 6, fps: 10 },
			{ name: "run", frameCount: 8, fps: 14 },
			{ name: "attack", frameCount: 6, fps: 12, loop: false },
			{ name: "hurt", frameCount: 3, fps: 8, loop: false },
			{ name: "death", frameCount: 8, fps: 8, loop: false },
		],
		defaultAnimation: "idle",
	});
}

/**
 * Helper to register a multi-texture character
 *
 * Each animation is in its own file, following the naming pattern:
 * {basePath}_{animationName}.png
 *
 * Example:
 * registerMultiTextureCharacter('hero', '/sprites/hero', ['idle', 'walk', 'attack'])
 * Loads: /sprites/hero_idle.png, /sprites/hero_walk.png, /sprites/hero_attack.png
 */
export function registerMultiTextureCharacter(
	id: string,
	basePath: string,
	animationConfigs: Array<{
		name: string;
		frameCount: number;
		fps: number;
		loop?: boolean;
	}>,
	options?: {
		size?: [number, number];
		framesPerRow?: number;
		extension?: string;
	},
): void {
	const framesPerRow = options?.framesPerRow ?? 8;
	const size = options?.size ?? [1, 1.5];
	const ext = options?.extension ?? "png";

	// Build texture sources
	const textures = animationConfigs.map((anim) => ({
		id: anim.name,
		src: `${basePath}_${anim.name}.${ext}`,
	}));

	// Build animation definitions
	const animations = animationConfigs.map((anim) => ({
		textureId: anim.name,
		name: anim.name,
		frameCount: anim.frameCount,
		fps: anim.fps,
		loop: anim.loop,
	}));

	registerSpriteSheet({
		id,
		texture: textures,
		framesPerRow,
		totalRows: 4, // 4 directions per file
		size,
		directional: true,
		animations,
		defaultAnimation: animationConfigs[0]?.name ?? "idle",
	});
}
