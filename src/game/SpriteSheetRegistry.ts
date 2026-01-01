import { Singleton } from "topsyde-utils";
import type { AnimationClip, SpriteAnimation, SpriteDirection, SpriteSheet, TextureConfig, TextureSource } from "./common/sprite.types";
import { GetTexturePathById, IsMultiTexture, isStaticAnimation } from "./common/sprite.types";

// ============================================================================
// INTERNAL TYPES (not exported - used only by registry)
// ============================================================================

/** Internal: Expanded sprite sheet definition stored in registry */
interface SpriteSheetDefinition {
	id: string;
	name?: string;
	texture: TextureConfig;
	frameSize?: [number, number];
	columns: number;
	rows: number;
	size: [number, number];
	anchor?: [number, number];
	animations: AnimationRowDefinition[];
	defaultAnimation?: string;
	layout?: "single" | "directional-4" | "directional-8" | "custom";
	isMultiTexture?: boolean;
}

/** Internal: Row-based animation definition */
interface AnimationRowDefinition {
	name: string;
	row: number;
	frameCount: number;
	fps: number;
	loop?: boolean;
	direction?: SpriteDirection;
	textureId?: string;
	column?: number;
}

// ============================================================================
// SPRITE SHEET REGISTRY
// ============================================================================

/** Singleton registry for sprite sheet definitions. Supports single and multi-texture sheets. */
export class SpriteSheetRegistry extends Singleton {
	private definitions: Map<string, SpriteSheetDefinition> = new Map();

	/** Register a sprite sheet configuration */
	register(config: SpriteSheet): void {
		const definition = this.expandConfig(config);
		this.registerDefinition(definition);
	}

	/** @internal Store an expanded definition */
	private registerDefinition(definition: SpriteSheetDefinition): void {
		if (this.definitions.has(definition.id)) {
			console.warn(`[SpriteSheetRegistry] Overwriting definition: ${definition.id}`);
		}
		this.definitions.set(definition.id, definition);
	}

	get(id: string): SpriteSheetDefinition | undefined {
		return this.definitions.get(id);
	}

	has(id: string): boolean {
		return this.definitions.has(id);
	}

	getIds(): string[] {
		return Array.from(this.definitions.keys());
	}

	unregister(id: string): boolean {
		return this.definitions.delete(id);
	}

	clear(): void {
		this.definitions.clear();
	}

	isMultiTexture(id: string): boolean {
		const def = this.definitions.get(id);
		return def ? IsMultiTexture(def.texture) : false;
	}

	/** Get all texture paths for preloading */
	getTexturePaths(id: string): string[] {
		const def = this.definitions.get(id);
		if (!def) return [];

		if (IsMultiTexture(def.texture)) {
			return def.texture.map((t) => t.src);
		}
		return [def.texture];
	}

	getTextureSources(id: string): TextureSource[] | null {
		const def = this.definitions.get(id);
		if (!def || !IsMultiTexture(def.texture)) return null;
		return def.texture;
	}

	/** Build animation clips for SpriteAnimatorComponent */
	buildAnimations(id: string, direction?: SpriteDirection): AnimationClip[] {
		const def = this.definitions.get(id);
		if (!def) {
			console.error(`[SpriteSheetRegistry] Definition not found: ${id}`);
			return [];
		}

		return this.animationRowsToClips(def.animations, def.columns, def.texture, direction);
	}

	/** Build animation clips with texture info (for multi-texture support) */
	buildExtendedAnimations(id: string, direction?: SpriteDirection): AnimationClip[] {
		const def = this.definitions.get(id);
		if (!def) {
			console.error(`[SpriteSheetRegistry] Definition not found: ${id}`);
			return [];
		}

		return this.animationRowsToClipsWithTexture(def.animations, def.columns, def.texture, direction);
	}

	/** Get config for SpriteComponent. Multi-texture sheets use first texture. */
	getSpriteConfig(id: string): {
		texture: string;
		spriteSheet: { columns: number; rows: number };
		size: [number, number];
		anchor: [number, number];
		frameSize?: [number, number];
		defaultAnimation?: string;
	} | null {
		const def = this.definitions.get(id);
		if (!def) return null;

		let texturePath: string;
		if (IsMultiTexture(def.texture)) {
			texturePath = def.texture[0]?.src ?? "";
		} else {
			texturePath = def.texture;
		}

		return {
			texture: texturePath,
			spriteSheet: {
				columns: def.columns,
				rows: def.rows,
			},
			size: def.size,
			anchor: def.anchor ?? [0.5, 0],
			frameSize: def.frameSize,
			defaultAnimation: def.defaultAnimation,
		};
	}

	/** Expand user config to internal definition */
	private expandConfig(config: SpriteSheet): SpriteSheetDefinition {
		const columns = config.columns ?? 1;
		const rows = config.rows ?? 1;
		const inputAnimations = config.animations ?? [];
		const directional = config.directional ?? false;

		const directions: SpriteDirection[] = config.directionOrder ?? ["down", "left", "right", "up"];
		const animations: AnimationRowDefinition[] = [];
		const isMulti = IsMultiTexture(config.texture);

		// Multi-texture directional: row index resets per texture file (1-indexed)
		if (isMulti && directional) {
			for (const anim of inputAnimations) {
				if (isStaticAnimation(anim)) continue; // Skip static frames in directional mode
				if (anim.direction !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row ?? 1,
						frameCount: anim.frameCount!,
						fps: anim.fps!,
						loop: anim.loop ?? true,
						direction: anim.direction,
						textureId: anim.textureId,
					});
				} else {
					let rowInTexture = 1;
					for (const dir of directions) {
						animations.push({
							name: anim.name,
							row: rowInTexture,
							frameCount: anim.frameCount!,
							fps: anim.fps!,
							loop: anim.loop ?? true,
							direction: dir,
							textureId: anim.textureId,
						});
						rowInTexture++;
					}
				}
			}
		} else if (directional) {
			let currentRow = 1;
			for (const anim of inputAnimations) {
				if (isStaticAnimation(anim)) continue; // Skip static frames in directional mode
				if (anim.row !== undefined && anim.direction !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row,
						frameCount: anim.frameCount!,
						fps: anim.fps!,
						loop: anim.loop ?? true,
						direction: anim.direction,
						textureId: anim.textureId,
					});
				} else if (anim.row !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row,
						frameCount: anim.frameCount!,
						fps: anim.fps!,
						loop: anim.loop ?? true,
						textureId: anim.textureId,
					});
				} else {
					for (const dir of directions) {
						animations.push({
							name: anim.name,
							row: currentRow,
							frameCount: anim.frameCount!,
							fps: anim.fps!,
							loop: anim.loop ?? true,
							direction: dir,
							textureId: anim.textureId,
						});
						currentRow++;
					}
				}
			}
		} else {
			let currentRow = 1;
			for (const anim of inputAnimations) {
				if (!isStaticAnimation(anim)) {
					// Animated sprite
					const row = anim.row ?? (isMulti ? 1 : currentRow);
					animations.push({
						name: anim.name,
						row,
						frameCount: anim.frameCount!,
						fps: anim.fps!,
						loop: anim.loop ?? true,
						textureId: anim.textureId,
					});
					if (!isMulti && anim.row === undefined) currentRow++;
				} else {
					// Static frame - single frame at specific [row, column]
					animations.push({
						name: anim.name,
						row: anim.row!,
						column: anim.column,
						frameCount: 1,
						fps: 1,
						loop: false,
						textureId: anim.textureId,
					});
				}
			}
		}

		return {
			id: config.id,
			texture: config.texture,
			frameSize: config.frameSize,
			columns,
			rows,
			size: config.size,
			anchor: config.anchor ?? [0.5, 0],
			animations,
			defaultAnimation: config.defaultAnimation,
			layout: directional ? "directional-4" : "single",
			isMultiTexture: isMulti,
		};
	}

	private animationRowsToClips(animRows: AnimationRowDefinition[], columns: number, _texture: TextureConfig, filterDirection?: SpriteDirection): AnimationClip[] {
		const clips: AnimationClip[] = [];

		for (const row of animRows) {
			if (filterDirection && row.direction && row.direction !== filterDirection) {
				continue;
			}

			const name = row.direction ? `${row.name}-${row.direction}` : row.name;

			// Calculate startFrame based on whether column is specified
			const startFrame =
				row.column !== undefined
					? (row.row - 1) * columns + (row.column - 1) // Static: specific cell (both 1-indexed)
					: (row.row - 1) * columns; // Animated: start of row

			// endFrame: static = same frame, animated = range
			const endFrame =
				row.column !== undefined
					? startFrame // Static: single frame
					: startFrame + row.frameCount - 1; // Animated: frame range

			clips.push({
				name,
				startFrame,
				endFrame,
				fps: row.fps,
				loop: row.loop ?? true,
			});
		}

		return clips;
	}

	private animationRowsToClipsWithTexture(animRows: AnimationRowDefinition[], columns: number, texture: TextureConfig, filterDirection?: SpriteDirection): AnimationClip[] {
		const clips: AnimationClip[] = [];

		for (const row of animRows) {
			if (filterDirection && row.direction && row.direction !== filterDirection) {
				continue;
			}

			const name = row.direction ? `${row.name}-${row.direction}` : row.name;

			// Calculate startFrame based on whether column is specified
			const startFrame = row.column !== undefined ? (row.row - 1) * columns + (row.column - 1) : (row.row - 1) * columns;

			const endFrame = row.column !== undefined ? startFrame : startFrame + row.frameCount - 1;

			let texturePath: string | undefined;
			if (row.textureId) {
				texturePath = GetTexturePathById(texture, row.textureId);
			} else if (!IsMultiTexture(texture)) {
				texturePath = texture;
			}

			clips.push({
				name,
				startFrame,
				endFrame,
				fps: row.fps,
				loop: row.loop ?? true,
				texturePath,
				textureId: row.textureId,
			});
		}

		return clips;
	}

	// ========================================================================
	// STATIC HELPERS
	// ========================================================================

	public static GetSpriteSheet(id: string): SpriteSheetDefinition | undefined {
		return SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>().get(id);
	}

	public static Register(config: SpriteSheet): void {
		SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>().register(config);
	}

	/** @deprecated Use Register() instead */
	public static RegisterSpriteSheet(config: SpriteSheet): void {
		SpriteSheetRegistry.Register(config);
	}

	/** Register multi-texture character. Files: {basePath}_{animationName}.{ext} */
	public static RegisterMultitextureSpriteSheet(
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
			columns?: number;
			extension?: string;
		},
	): void {
		const columns = options?.columns ?? 8;
		const size = options?.size ?? [1, 1.5];
		const ext = options?.extension ?? "png";

		const textures: TextureSource[] = animationConfigs.map((anim) => ({
			id: anim.name,
			src: `${basePath}_${anim.name}.${ext}`,
		}));

		const animations: SpriteAnimation[] = animationConfigs.map((anim) => ({
			textureId: anim.name,
			name: anim.name,
			frameCount: anim.frameCount,
			fps: anim.fps,
			loop: anim.loop,
		}));

		SpriteSheetRegistry.Register({
			id,
			texture: textures,
			columns,
			rows: 4,
			size,
			directional: true,
			animations,
			defaultAnimation: animationConfigs[0]?.name ?? "idle",
		});
	}

	public static RegisterAllSpriteSheets(): void {
		// Local player - row values are 1-indexed (what you see = what you put)
		SpriteSheetRegistry.Register({
			id: "local-player",
			texture: "/sprites/character/player.png",
			columns: 6,
			rows: 10,
			size: [3, 4],
			directional: false,
			animations: [
				{ name: "idle", row: 2, frameCount: 6, fps: 4 },
				{ name: "walk", row: 5, frameCount: 6, fps: 10 },
			],
			defaultAnimation: "idle",
			anchor: [0.5, 0.125],
		});

		SpriteSheetRegistry.Register({
			id: "slime",
			texture: "/sprites/enemies/slime.png",
			columns: 7,
			rows: 12,
			size: [2.5, 2.5],
			directional: false,
			animations: [{ name: "idle", row: 1, frameCount: 4, fps: 6 }],
			defaultAnimation: "idle",
			anchor: [0.5, 0.2],
		});

		SpriteSheetRegistry.Register({
			id: "ground-tileset",
			texture: "/sprites/tileset/ground_tileset.png",
			size: [1, 1],
			columns: 12,
			rows: 20,
		});

		// ========================================
		// ENVIRONMENT SPRITES (Static)
		// ========================================

		// Trees (4 variants) - static, no animations
		SpriteSheetRegistry.Register({
			id: "tree-00",
			texture: "/sprites/objects/tree_00.png",
			size: [4, 5],
		});
		SpriteSheetRegistry.Register({
			id: "tree-01",
			texture: "/sprites/objects/tree_01.png",
			size: [4, 5],
		});
		SpriteSheetRegistry.Register({
			id: "tree-02",
			texture: "/sprites/objects/tree_02.png",
			size: [4, 5],
		});
		SpriteSheetRegistry.Register({
			id: "tree-03",
			texture: "/sprites/objects/tree_03.png",
			size: [4, 5],
		});

		// Rocks atlas - 6 variants in 3x2 grid using static frame selection
		SpriteSheetRegistry.Register({
			id: "rock-00",
			texture: "/sprites/objects/rocks.png",
			columns: 3,
			rows: 2,
			size: [2, 1.5],
			directional: false,
			animations: [{ name: "idle", row: 1, column: 1 }], // Top-left
		});
		SpriteSheetRegistry.Register({
			id: "rock-01",
			texture: "/sprites/objects/rocks.png",
			columns: 3,
			rows: 2,
			size: [2, 1.5],
			directional: false,
			animations: [{ name: "idle", row: 1, column: 2 }], // Top-center
		});
		SpriteSheetRegistry.Register({
			id: "rock-02",
			texture: "/sprites/objects/rocks.png",
			columns: 3,
			rows: 2,
			size: [2, 1.5],
			directional: false,
			animations: [{ name: "idle", row: 1, column: 3 }], // Top-right
		});

		// Houses (2 variants) - static sprites
		SpriteSheetRegistry.Register({
			id: "house-00",
			texture: "/sprites/house_00.png",
			size: [6, 5],
		});
		SpriteSheetRegistry.Register({
			id: "shop-01",
			texture: "/sprites/shop_01.png",
			size: [6, 5],
		});
	}
}
