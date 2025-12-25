import { Singleton } from "topsyde-utils";
import type { I_AnimationDefinition } from "../common/sprite.types";
import type { I_AnimationRowDefinition, I_ExtendedAnimationDefinition, I_QuickSpriteSheetConfig, I_SpriteSheetDefinition, I_TextureSource, SpriteDirection, TextureConfig } from "../common/spritesheet.types";
import { GetTexturePathById, IsMultiTexture } from "../common/spritesheet.types";

/**
 * SpriteSheetRegistry - Singleton registry for sprite sheet definitions
 *
 * Provides a central place to register and retrieve sprite sheet configurations.
 * Automatically generates animation definitions from sprite sheet layouts.
 *
 * Supports both single-texture and multi-texture sprite sheets.
 *
 * Features:
 * - Register sprite sheets by ID
 * - Quick setup for common 4-directional character sheets
 * - Auto-generate directional animation names (e.g., 'walk-down', 'walk-left')
 * - Build I_AnimationDefinition[] for SpriteAnimationComponent
 * - Multi-texture support for characters with separate animation files
 *
 * Single texture usage:
 * ```typescript
 * SpriteSheetRegistry.getInstance().registerQuick({
 *   id: 'knight',
 *   texture: '/sprites/knight_00.png',
 *   framesPerRow: 6,
 *   totalRows: 8,
 *   size: [1, 1.5],
 *   directional: true,
 *   animations: [
 *     { name: 'idle', frameCount: 4, fps: 6 },
 *     { name: 'walk', frameCount: 6, fps: 10 }
 *   ]
 * });
 * ```
 *
 * Multi-texture usage:
 * ```typescript
 * SpriteSheetRegistry.getInstance().registerQuick({
 *   id: 'knight',
 *   texture: [
 *     { id: 'idle', src: '/sprites/knight_idle.png' },
 *     { id: 'walk', src: '/sprites/knight_walk.png' },
 *     { id: 'attack', src: '/sprites/knight_attack.png' },
 *   ],
 *   framesPerRow: 6,
 *   totalRows: 4,  // 4 directions per texture file
 *   size: [1, 1.5],
 *   directional: true,
 *   animations: [
 *     { textureId: 'idle', name: 'idle', frameCount: 4, fps: 6 },
 *     { textureId: 'walk', name: 'walk', frameCount: 6, fps: 10 },
 *     { textureId: 'attack', name: 'attack', frameCount: 8, fps: 14, loop: false },
 *   ]
 * });
 * ```
 */
export class SpriteSheetRegistry extends Singleton {
	private definitions: Map<string, I_SpriteSheetDefinition> = new Map();

	/**
	 * Get the singleton instance
	 */

	/**
	 * Register a full sprite sheet definition
	 */
	register(definition: I_SpriteSheetDefinition): void {
		if (this.definitions.has(definition.id)) {
			console.warn(`[SpriteSheetRegistry] Overwriting definition: ${definition.id}`);
		}
		this.definitions.set(definition.id, definition);
	}

	/**
	 * Register using the quick config format
	 *
	 * This is the easiest way to register common character sprite sheets.
	 * Automatically expands to full I_SpriteSheetDefinition with all
	 * directional animations generated.
	 */
	registerQuick(config: I_QuickSpriteSheetConfig): void {
		const definition = this.expandQuickConfig(config);
		this.register(definition);
	}

	/**
	 * Get a registered sprite sheet definition
	 */
	get(id: string): I_SpriteSheetDefinition | undefined {
		return this.definitions.get(id);
	}

	/**
	 * Check if a definition exists
	 */
	has(id: string): boolean {
		return this.definitions.has(id);
	}

	/**
	 * Get all registered definition IDs
	 */
	getIds(): string[] {
		return Array.from(this.definitions.keys());
	}

	/**
	 * Remove a definition
	 */
	unregister(id: string): boolean {
		return this.definitions.delete(id);
	}

	/**
	 * Clear all definitions
	 */
	clear(): void {
		this.definitions.clear();
	}

	/**
	 * Check if a sprite sheet uses multiple textures
	 */
	isMultiTexture(id: string): boolean {
		const def = this.definitions.get(id);
		return def ? IsMultiTexture(def.texture) : false;
	}

	/**
	 * Get all texture paths for a sprite sheet
	 *
	 * Useful for preloading textures.
	 */
	getTexturePaths(id: string): string[] {
		const def = this.definitions.get(id);
		if (!def) return [];

		if (IsMultiTexture(def.texture)) {
			return def.texture.map((t) => t.src);
		}
		return [def.texture];
	}

	/**
	 * Get texture sources for multi-texture sheets
	 */
	getTextureSources(id: string): I_TextureSource[] | null {
		const def = this.definitions.get(id);
		if (!def || !IsMultiTexture(def.texture)) return null;
		return def.texture;
	}

	/**
	 * Build animation definitions for SpriteAnimationComponent
	 *
	 * For multi-texture sheets, includes texturePath for each animation.
	 *
	 * @param id - Sprite sheet definition ID
	 * @param direction - Optional: filter to only animations for this direction
	 * @returns Array of animation definitions ready for SpriteAnimationComponent
	 */
	buildAnimations(id: string, direction?: SpriteDirection): I_AnimationDefinition[] {
		const def = this.definitions.get(id);
		if (!def) {
			console.error(`[SpriteSheetRegistry] Definition not found: ${id}`);
			return [];
		}

		return this.animationRowsToDefinitions(def.animations, def.columns, def.texture, direction);
	}

	/**
	 * Build extended animation definitions with texture info
	 *
	 * Use this for DirectionalSpriteAnimator with multi-texture support.
	 */
	buildExtendedAnimations(id: string, direction?: SpriteDirection): I_ExtendedAnimationDefinition[] {
		const def = this.definitions.get(id);
		if (!def) {
			console.error(`[SpriteSheetRegistry] Definition not found: ${id}`);
			return [];
		}

		return this.animationRowsToExtendedDefinitions(def.animations, def.columns, def.texture, direction);
	}

	/**
	 * Get sprite component config from definition
	 *
	 * For multi-texture sheets, returns the first texture as default.
	 */
	getSpriteConfig(id: string): {
		texture: string;
		spriteSheet: { columns: number; rows: number };
		size: [number, number];
		anchor: [number, number];
	} | null {
		const def = this.definitions.get(id);
		if (!def) return null;

		// For multi-texture, use first texture as default
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

	/**
	 * Expand quick config to full definition
	 *
	 * Supports explicit row mapping: if `row` is provided in the animation definition,
	 * it will be used directly. Otherwise, rows are calculated sequentially.
	 */
	private expandQuickConfig(config: I_QuickSpriteSheetConfig): I_SpriteSheetDefinition {
		const directions: SpriteDirection[] = config.directionOrder ?? ["down", "left", "right", "up"];
		const animations: I_AnimationRowDefinition[] = [];
		const isMulti = IsMultiTexture(config.texture);

		// Check if any animation has explicit row mapping
		const hasExplicitRows = config.animations.some((anim) => anim.row !== undefined);

		// For multi-texture, each texture file contains all directions for ONE animation
		// So row indexing resets per animation (per texture)
		if (isMulti && config.directional) {
			for (const anim of config.animations) {
				// If animation has explicit direction, use it as single entry
				if (anim.direction !== undefined) {
					animations.push({
						name: anim.name,
						row: anim.row ?? 0,
						frameCount: anim.frameCount,
						fps: anim.fps,
						loop: anim.loop ?? true,
						direction: anim.direction,
						textureId: anim.textureId,
					});
				} else {
					// Expand to all directions
					let rowInTexture = 0;
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
		} else if (config.directional) {
			// Single texture directional
			let currentRow = 0;
			for (const anim of config.animations) {
				// If animation has explicit row + direction, use directly
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
					// Explicit row but no direction - single animation at that row
					animations.push({
						name: anim.name,
						row: anim.row,
						frameCount: anim.frameCount,
						fps: anim.fps,
						loop: anim.loop ?? true,
						textureId: anim.textureId,
					});
				} else {
					// No explicit row - expand to all directions sequentially
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
			// Non-directional
			let currentRow = 0;
			for (const anim of config.animations) {
				// Use explicit row if provided, otherwise sequential
				const row = anim.row ?? (isMulti ? 0 : currentRow);
				animations.push({
					name: anim.name,
					row,
					frameCount: anim.frameCount,
					fps: anim.fps,
					loop: anim.loop ?? true,
					textureId: anim.textureId,
				});
				if (!isMulti && anim.row === undefined) currentRow++;
			}
		}

		return {
			id: config.id,
			texture: config.texture,
			columns: config.framesPerRow,
			rows: config.totalRows,
			size: config.size,
			anchor: config.anchor ?? [0.5, 0],
			animations,
			defaultAnimation: config.defaultAnimation,
			layout: config.directional ? "directional-4" : "single",
			isMultiTexture: isMulti,
		};
	}

	/**
	 * Convert animation row definitions to SpriteAnimationComponent format
	 */
	private animationRowsToDefinitions(rows: I_AnimationRowDefinition[], columns: number, texture: TextureConfig, filterDirection?: SpriteDirection): I_AnimationDefinition[] {
		const definitions: I_AnimationDefinition[] = [];

		for (const row of rows) {
			// Skip if filtering by direction and this doesn't match
			if (filterDirection && row.direction && row.direction !== filterDirection) {
				continue;
			}

			// Build animation name (e.g., 'walk' or 'walk-down')
			const name = row.direction ? `${row.name}-${row.direction}` : row.name;

			// Calculate frame indices
			const startFrame = row.row * columns;
			const endFrame = startFrame + row.frameCount - 1;

			definitions.push({
				name,
				startFrame,
				endFrame,
				fps: row.fps,
				loop: row.loop ?? true,
			});
		}

		return definitions;
	}

	/**
	 * Convert animation row definitions to extended format with texture info
	 */
	private animationRowsToExtendedDefinitions(rows: I_AnimationRowDefinition[], columns: number, texture: TextureConfig, filterDirection?: SpriteDirection): I_ExtendedAnimationDefinition[] {
		const definitions: I_ExtendedAnimationDefinition[] = [];

		for (const row of rows) {
			// Skip if filtering by direction and this doesn't match
			if (filterDirection && row.direction && row.direction !== filterDirection) {
				continue;
			}

			// Build animation name (e.g., 'walk' or 'walk-down')
			const name = row.direction ? `${row.name}-${row.direction}` : row.name;

			// Calculate frame indices
			const startFrame = row.row * columns;
			const endFrame = startFrame + row.frameCount - 1;

			// Get texture path for this animation
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
}

/**
 * Convenience function to register a sprite sheet
 */
export function registerSpriteSheet(config: I_QuickSpriteSheetConfig): void {
	SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>().registerQuick(config);
}

/**
 * Convenience function to get a sprite sheet definition
 */
export function getSpriteSheet(id: string): I_SpriteSheetDefinition | undefined {
	return SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>().get(id);
}
