/**
 * TileMapGenerator - Procedural terrain generation using noise
 *
 * Generates tile maps with:
 * - Terrain type based on noise thresholds
 * - Height variation from noise
 * - Auto-tiling integration for seamless edges
 */

import type { TerrainType } from "../common/autotile.types";
import { type I_ChunkData, type I_TileData, TILEMAP_DEFAULTS } from "../common/tilemap.types";
import { AutoTiler, type I_AutoTileTile } from "./AutoTiler";

/**
 * Simple 2D noise implementation (Perlin-like)
 * For production, consider using a library like simplex-noise
 */
function noise2D(x: number, z: number, seed: number = 0): number {
	// Simple hash-based pseudo-random noise
	const hash = (n: number): number => {
		const s = Math.sin(n + seed) * 43758.5453123;
		return s - Math.floor(s);
	};

	const ix = Math.floor(x);
	const iz = Math.floor(z);
	const fx = x - ix;
	const fz = z - iz;

	// Smoothstep interpolation
	const smoothstep = (t: number): number => t * t * (3 - 2 * t);
	const sx = smoothstep(fx);
	const sz = smoothstep(fz);

	// Corner values
	const n00 = hash(ix + iz * 57);
	const n10 = hash(ix + 1 + iz * 57);
	const n01 = hash(ix + (iz + 1) * 57);
	const n11 = hash(ix + 1 + (iz + 1) * 57);

	// Bilinear interpolation
	const nx0 = n00 * (1 - sx) + n10 * sx;
	const nx1 = n01 * (1 - sx) + n11 * sx;

	return nx0 * (1 - sz) + nx1 * sz;
}

/**
 * Fractal Brownian Motion - layered noise for more natural terrain
 */
function fbm(x: number, z: number, octaves: number = 4, seed: number = 0): number {
	let value = 0;
	let amplitude = 1;
	let frequency = 1;
	let maxValue = 0;

	for (let i = 0; i < octaves; i++) {
		value += amplitude * noise2D(x * frequency, z * frequency, seed + i * 100);
		maxValue += amplitude;
		amplitude *= 0.5;
		frequency *= 2;
	}

	return value / maxValue;
}

/**
 * Terrain threshold configuration
 */
export interface I_TerrainThreshold {
	terrain: TerrainType;
	maxValue: number; // Noise value threshold (0-1)
}

/**
 * Generator configuration
 */
export interface I_GeneratorConfig {
	/** Random seed for reproducible generation */
	seed?: number;
	/** Noise scale (larger = more zoomed out, smoother) */
	noiseScale?: number;
	/** Number of octaves for fractal noise */
	octaves?: number;
	/** Terrain thresholds (sorted by maxValue ascending) */
	terrainThresholds?: I_TerrainThreshold[];
	/** Height multiplier */
	heightScale?: number;
	/** Whether to apply auto-tiling */
	useAutoTiling?: boolean;
}

/**
 * Default terrain thresholds
 */
const DEFAULT_TERRAIN_THRESHOLDS: I_TerrainThreshold[] = [
	{ terrain: "water", maxValue: 0.3 },
	{ terrain: "sand", maxValue: 0.4 },
	{ terrain: "grass", maxValue: 0.7 },
	{ terrain: "dirt", maxValue: 0.85 },
	{ terrain: "stone", maxValue: 1.0 },
];

/**
 * TileMapGenerator class
 */
export class TileMapGenerator {
	private seed: number;
	private noiseScale: number;
	private octaves: number;
	private terrainThresholds: I_TerrainThreshold[];
	private heightScale: number;
	private useAutoTiling: boolean;
	private autoTiler: AutoTiler;

	constructor(config: I_GeneratorConfig = {}) {
		this.seed = config.seed ?? Math.random() * 10000;
		this.noiseScale = config.noiseScale ?? 0.1;
		this.octaves = config.octaves ?? 4;
		this.terrainThresholds = config.terrainThresholds ?? DEFAULT_TERRAIN_THRESHOLDS;
		this.heightScale = config.heightScale ?? 0;
		this.useAutoTiling = config.useAutoTiling ?? true;
		this.autoTiler = new AutoTiler();
	}

	/**
	 * Get terrain type from noise value
	 */
	private getTerrainFromNoise(noiseValue: number): TerrainType {
		for (const threshold of this.terrainThresholds) {
			if (noiseValue <= threshold.maxValue) {
				return threshold.terrain;
			}
		}
		return this.terrainThresholds[this.terrainThresholds.length - 1].terrain;
	}

	/**
	 * Generate chunk data
	 *
	 * @param chunkX - Chunk X coordinate
	 * @param chunkZ - Chunk Z coordinate
	 * @param chunkSize - Tiles per chunk dimension
	 * @returns Generated chunk data
	 */
	generateChunk(chunkX: number, chunkZ: number, chunkSize: number = TILEMAP_DEFAULTS.CHUNK_SIZE): I_ChunkData {
		// First pass: generate terrain types and heights
		const autoTileGrid: I_AutoTileTile[][] = [];

		for (let row = 0; row < chunkSize; row++) {
			autoTileGrid[row] = [];
			for (let col = 0; col < chunkSize; col++) {
				// World coordinates for noise sampling
				const worldX = chunkX * chunkSize + col;
				const worldZ = chunkZ * chunkSize + row;

				// Sample noise for terrain
				const terrainNoise = fbm(worldX * this.noiseScale, worldZ * this.noiseScale, this.octaves, this.seed);

				// Sample separate noise for height (different seed)
				const heightNoise = fbm(
					worldX * this.noiseScale * 0.5,
					worldZ * this.noiseScale * 0.5,
					this.octaves,
					this.seed + 1000,
				);

				const terrain = this.getTerrainFromNoise(terrainNoise);
				const height = heightNoise * this.heightScale;

				autoTileGrid[row][col] = { terrain, height };
			}
		}

		// Second pass: calculate tile indices with auto-tiling
		const tiles: I_TileData[][] = [];

		for (let row = 0; row < chunkSize; row++) {
			tiles[row] = [];
			for (let col = 0; col < chunkSize; col++) {
				const autoTile = autoTileGrid[row][col];

				let tileIndex: number;
				if (this.useAutoTiling) {
					tileIndex = this.autoTiler.processTile(autoTileGrid, row, col);
				} else {
					// TEMP: Test tile index 0 (top-left of our group)
					// With groupColumns=2, groupRows=5:
					// 0 = (0,0), 1 = (1,0), 2 = (0,1), 3 = (1,1), etc.
					tileIndex = 0;
				}

				tiles[row][col] = {
					tileIndex,
					height: autoTile.height,
					collisionType: autoTile.terrain === "water" ? "blocked" : "walkable",
				};
			}
		}

		return {
			chunkX,
			chunkZ,
			tiles,
		};
	}

	/**
	 * Generate a simple flat chunk with single terrain
	 * Useful for testing
	 */
	generateFlatChunk(
		chunkX: number,
		chunkZ: number,
		terrain: TerrainType = "grass",
		chunkSize: number = TILEMAP_DEFAULTS.CHUNK_SIZE,
	): I_ChunkData {
		const tiles: I_TileData[][] = [];

		for (let row = 0; row < chunkSize; row++) {
			tiles[row] = [];
			for (let col = 0; col < chunkSize; col++) {
				tiles[row][col] = {
					tileIndex: 15, // All neighbors = center tile (fully surrounded)
					height: 0,
					collisionType: "walkable",
				};
			}
		}

		return { chunkX, chunkZ, tiles };
	}

	/**
	 * Generate a checkerboard pattern chunk for testing
	 */
	generateCheckerboardChunk(chunkX: number, chunkZ: number, chunkSize: number = TILEMAP_DEFAULTS.CHUNK_SIZE): I_ChunkData {
		const tiles: I_TileData[][] = [];

		for (let row = 0; row < chunkSize; row++) {
			tiles[row] = [];
			for (let col = 0; col < chunkSize; col++) {
				const isEven = (row + col) % 2 === 0;
				tiles[row][col] = {
					tileIndex: isEven ? 0 : 1,
					height: 0,
					collisionType: "walkable",
				};
			}
		}

		return { chunkX, chunkZ, tiles };
	}

	/**
	 * Generate a height test chunk with varying elevations
	 */
	generateHeightTestChunk(chunkX: number, chunkZ: number, chunkSize: number = TILEMAP_DEFAULTS.CHUNK_SIZE): I_ChunkData {
		const tiles: I_TileData[][] = [];

		for (let row = 0; row < chunkSize; row++) {
			tiles[row] = [];
			for (let col = 0; col < chunkSize; col++) {
				// Create stepped height based on position
				const step = Math.floor(col / (chunkSize / 4));
				const height = step * 0.5; // 0, 0.5, 1.0, 1.5

				tiles[row][col] = {
					tileIndex: step, // Different color per height level
					height,
					collisionType: "walkable",
				};
			}
		}

		return { chunkX, chunkZ, tiles };
	}

	/**
	 * Update generator seed
	 */
	setSeed(seed: number): void {
		this.seed = seed;
	}

	/**
	 * Update noise scale
	 */
	setNoiseScale(scale: number): void {
		this.noiseScale = scale;
	}

	/**
	 * Update terrain thresholds
	 */
	setTerrainThresholds(thresholds: I_TerrainThreshold[]): void {
		this.terrainThresholds = thresholds;
	}
}

/**
 * Singleton instance for convenience
 */
let defaultGenerator: TileMapGenerator | null = null;

export function getTileMapGenerator(): TileMapGenerator {
	if (!defaultGenerator) {
		defaultGenerator = new TileMapGenerator();
	}
	return defaultGenerator;
}
