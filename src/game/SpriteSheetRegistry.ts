import { Singleton } from "topsyde-utils";
import type { I_AnimationDefinition } from "./common/sprite.types";
import type { I_AnimationRowDefinition, I_ExtendedAnimationDefinition, I_SpriteSheetConfig, I_SpriteSheetDefinition, I_TextureSource, SpriteDirection, TextureConfig } from "./common/spritesheet.types";
import { GetTexturePathById, IsMultiTexture, isAnimatedDef } from "./common/spritesheet.types";

/** Singleton registry for sprite sheet definitions. Supports single and multi-texture sheets. */
export class SpriteSheetRegistry extends Singleton {
	private definitions: Map<string, I_SpriteSheetDefinition> = new Map();

	register(definition: I_SpriteSheetDefinition): void {
		if (this.definitions.has(definition.id)) {
			console.warn(`[SpriteSheetRegistry] Overwriting definition: ${definition.id}`);
		}
		this.definitions.set(definition.id, definition);
	}

	/** Register using quick config format. Auto-expands directional animations. */
	registerByConfig(config: I_SpriteSheetConfig): void {
		const definition = this.expandConfig(config);
		this.register(definition);
	}

	get(id: string): I_SpriteSheetDefinition | undefined {
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

	/** Get all texture paths for preloading. */
	getTexturePaths(id: string): string[] {
		const def = this.definitions.get(id);
		if (!def) return [];

		if (IsMultiTexture(def.texture)) {
			return def.texture.map((t) => t.src);
		}
		return [def.texture];
	}

	getTextureSources(id: string): I_TextureSource[] | null {
		const def = this.definitions.get(id);
		if (!def || !IsMultiTexture(def.texture)) return null;
		return def.texture;
	}

	/** Build animation definitions for SpriteAnimatorComponent. */
	buildAnimations(id: string, direction?: SpriteDirection): I_AnimationDefinition[] {
		const def = this.definitions.get(id);
		if (!def) {
			console.error(`[SpriteSheetRegistry] Definition not found: ${id}`);
			return [];
		}

		return this.animationRowsToDefinitions(def.animations, def.columns, def.texture, direction);
	}

	/** Build extended animation definitions with texture info (for multi-texture support). */
	buildExtendedAnimations(id: string, direction?: SpriteDirection): I_ExtendedAnimationDefinition[] {
		const def = this.definitions.get(id);
		if (!def) {
			console.error(`[SpriteSheetRegistry] Definition not found: ${id}`);
			return [];
		}

		return this.animationRowsToExtendedDefinitions(def.animations, def.columns, def.texture, direction);
	}

	/** Get config for SpriteComponent. Multi-texture sheets use first texture. */
	getSpriteConfig(id: string): {
		texture: string;
		spriteSheet: { columns: number; rows: number };
		size: [number, number];
		anchor: [number, number];
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
		};
	}

	/** Expand quick config to full definition. Explicit `row` uses that row; otherwise sequential. */
	private expandConfig(config: I_SpriteSheetConfig): I_SpriteSheetDefinition {
		// Apply defaults for static sprites
		const framesPerRow = config.framesPerRow ?? 1;
		const totalRows = config.totalRows ?? 1;
		const inputAnimations = config.animations ?? [];
		const directional = config.directional ?? false;

		const directions: SpriteDirection[] = config.directionOrder ?? ["down", "left", "right", "up"];
		const animations: I_AnimationRowDefinition[] = [];
		const isMulti = IsMultiTexture(config.texture);

		// Multi-texture directional: row index resets per texture file (1-indexed)
		// Note: Static frames (I_StaticFrameDef) are skipped in directional paths - they don't have directions
		if (isMulti && directional) {
			for (const anim of inputAnimations) {
				if (!isAnimatedDef(anim)) continue; // Skip static frames in directional mode
				if (anim.direction !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row ?? 1,
						frameCount: anim.frameCount,
						fps: anim.fps,
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
							frameCount: anim.frameCount,
							fps: anim.fps,
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
				if (!isAnimatedDef(anim)) continue; // Skip static frames in directional mode
				if (anim.row !== undefined && anim.direction !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row,
						frameCount: anim.frameCount,
						fps: anim.fps,
						loop: anim.loop ?? true,
						direction: anim.direction,
						textureId: anim.textureId,
					});
				} else if (anim.row !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row,
						frameCount: anim.frameCount,
						fps: anim.fps,
						loop: anim.loop ?? true,
						textureId: anim.textureId,
					});
				} else {
					for (const dir of directions) {
						animations.push({
							name: anim.name,
							row: currentRow,
							frameCount: anim.frameCount,
							fps: anim.fps,
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
				if (isAnimatedDef(anim)) {
					// Animated sprite - existing logic
					const row = anim.row ?? (isMulti ? 1 : currentRow);
					animations.push({
						name: anim.name,
						row,
						frameCount: anim.frameCount,
						fps: anim.fps,
						loop: anim.loop ?? true,
						textureId: anim.textureId,
					});
					if (!isMulti && anim.row === undefined) currentRow++;
				} else {
					// Static frame - single frame at specific [row, column]
					animations.push({
						name: anim.name,
						row: anim.row,
						column: anim.column, // Carry column through pipeline
						frameCount: 1, // Required by interface but ignored
						fps: 1, // Required by interface but ignored
						loop: false,
						textureId: anim.textureId,
					});
				}
			}
		}

		return {
			id: config.id,
			texture: config.texture,
			columns: framesPerRow,
			rows: totalRows,
			size: config.size,
			anchor: config.anchor ?? [0.5, 0],
			animations,
			defaultAnimation: config.defaultAnimation,
			layout: directional ? "directional-4" : "single",
			isMultiTexture: isMulti,
		};
	}

	private animationRowsToDefinitions(rows: I_AnimationRowDefinition[], columns: number, _texture: TextureConfig, filterDirection?: SpriteDirection): I_AnimationDefinition[] {
		const definitions: I_AnimationDefinition[] = [];

		for (const row of rows) {
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

			definitions.push({
				name,
				startFrame,
				endFrame,
				fps: row.fps, // For static: 1 (ignored since startFrame === endFrame)
				loop: row.loop ?? true,
			});
		}

		return definitions;
	}

	private animationRowsToExtendedDefinitions(rows: I_AnimationRowDefinition[], columns: number, texture: TextureConfig, filterDirection?: SpriteDirection): I_ExtendedAnimationDefinition[] {
		const definitions: I_ExtendedAnimationDefinition[] = [];

		for (const row of rows) {
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

			let texturePath: string | undefined;
			if (row.textureId) {
				texturePath = GetTexturePathById(texture, row.textureId);
			} else if (!IsMultiTexture(texture)) {
				texturePath = texture;
			}

			definitions.push({
				name,
				startFrame,
				endFrame,
				fps: row.fps,
				loop: row.loop ?? true,
				texturePath,
				textureId: row.textureId,
			});
		}

		return definitions;
	}

	public static GetSpriteSheet(id: string): I_SpriteSheetDefinition | undefined {
		return SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>().get(id);
	}

	public static RegisterSpriteSheet(config: I_SpriteSheetConfig): void {
		SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>().registerByConfig(config);
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
			framesPerRow?: number;
			extension?: string;
		},
	): void {
		const framesPerRow = options?.framesPerRow ?? 8;
		const size = options?.size ?? [1, 1.5];
		const ext = options?.extension ?? "png";

		const textures = animationConfigs.map((anim) => ({
			id: anim.name,
			src: `${basePath}_${anim.name}.${ext}`,
		}));

		const animations = animationConfigs.map((anim) => ({
			textureId: anim.name,
			name: anim.name,
			frameCount: anim.frameCount,
			fps: anim.fps,
			loop: anim.loop,
		}));

		SpriteSheetRegistry.RegisterSpriteSheet({
			id,
			texture: textures,
			framesPerRow,
			totalRows: 4,
			size,
			directional: true,
			animations,
			defaultAnimation: animationConfigs[0]?.name ?? "idle",
		});
	}

	public static RegisterAllSpriteSheets(): void {
		// Local player - row values are 1-indexed (what you see = what you put)
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "local-player",
			texture: "/sprites/character/player.png",
			framesPerRow: 6,
			totalRows: 10,
			size: [3, 4],
			directional: false,
			animations: [
				{ name: "idle", row: 2, frameCount: 6, fps: 4 },
				{ name: "walk", row: 5, frameCount: 6, fps: 10 },
			],
			defaultAnimation: "idle",
			anchor: [0.5, 0.125],
		});

		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "slime",
			texture: "/sprites/enemies/slime.png",
			framesPerRow: 7,
			totalRows: 12,
			size: [2.5, 2.5], // Smaller size to match actual slime graphic (not full cell)
			directional: false,
			animations: [{ name: "idle", row: 1, frameCount: 4, fps: 6 }],
			defaultAnimation: "idle",
			anchor: [0.5, 0.2],
		});

		// ========================================
		// ENVIRONMENT SPRITES (Static)
		// ========================================

		// Trees (4 variants) - static, no animations
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "tree-00",
			texture: "/sprites/objects/tree_00.png",
			size: [4, 5],
		});
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "tree-01",
			texture: "/sprites/objects/tree_01.png",
			size: [4, 5],
		});
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "tree-02",
			texture: "/sprites/objects/tree_02.png",
			size: [4, 5],
		});
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "tree-03",
			texture: "/sprites/objects/tree_03.png",
			size: [4, 5],
		});

		// Rocks atlas - 6 variants in 3x2 grid using static frame selection
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "rock-00",
			texture: "/sprites/objects/rocks.png",
			framesPerRow: 3,
			totalRows: 2,
			size: [2, 1.5],
			directional: false,
			animations: [{ name: "idle", row: 1, column: 1 }], // Top-left
		});
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "rock-01",
			texture: "/sprites/objects/rocks.png",
			framesPerRow: 3,
			totalRows: 2,
			size: [2, 1.5],
			directional: false,
			animations: [{ name: "idle", row: 1, column: 2 }], // Top-center
		});
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "rock-02",
			texture: "/sprites/objects/rocks.png",
			framesPerRow: 3,
			totalRows: 2,
			size: [2, 1.5],
			directional: false,
			animations: [{ name: "idle", row: 1, column: 3 }], // Top-right
		});

		// Houses (2 variants) - static sprites
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "house-00",
			texture: "/sprites/house_00.png",
			size: [6, 5],
		});
		SpriteSheetRegistry.RegisterSpriteSheet({
			id: "shop-01",
			texture: "/sprites/shop_01.png",
			size: [6, 5],
		});
	}
}
