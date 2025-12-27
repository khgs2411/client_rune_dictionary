/**
 * ChunkManager - Chunk coordinate math and active chunk tracking
 *
 * Handles:
 * - World ↔ chunk coordinate conversion
 * - Active chunk radius calculation
 * - Chunk key generation for Map storage
 */

import { TILEMAP_DEFAULTS } from "../common/tilemap.types";

/**
 * Chunk coordinates
 */
export interface I_ChunkCoord {
	x: number;
	z: number;
}

/**
 * ChunkManager configuration
 */
export interface I_ChunkManagerConfig {
	/** Tiles per chunk dimension */
	chunkSize?: number;
	/** World units per tile */
	tileSize?: number;
	/** Number of chunks to keep active around player (radius) */
	activeRadius?: number;
}

/**
 * ChunkManager class
 */
export class ChunkManager {
	private chunkSize: number;
	private tileSize: number;
	private activeRadius: number;

	/** Currently active chunk coordinates */
	private activeChunks: Set<string> = new Set();

	constructor(config: I_ChunkManagerConfig = {}) {
		this.chunkSize = config.chunkSize ?? TILEMAP_DEFAULTS.CHUNK_SIZE;
		this.tileSize = config.tileSize ?? TILEMAP_DEFAULTS.TILE_SIZE;
		this.activeRadius = config.activeRadius ?? 2;
	}

	/**
	 * Convert world position to chunk coordinates
	 */
	worldToChunk(worldX: number, worldZ: number): I_ChunkCoord {
		const chunkWorldSize = this.chunkSize * this.tileSize;
		return {
			x: Math.floor(worldX / chunkWorldSize),
			z: Math.floor(worldZ / chunkWorldSize),
		};
	}

	/**
	 * Convert chunk coordinates to world position (chunk origin)
	 */
	chunkToWorld(chunkX: number, chunkZ: number): { x: number; z: number } {
		const chunkWorldSize = this.chunkSize * this.tileSize;
		return {
			x: chunkX * chunkWorldSize,
			z: chunkZ * chunkWorldSize,
		};
	}

	/**
	 * Get chunk center in world coordinates
	 */
	getChunkCenter(chunkX: number, chunkZ: number): { x: number; z: number } {
		const origin = this.chunkToWorld(chunkX, chunkZ);
		const halfSize = (this.chunkSize * this.tileSize) / 2;
		return {
			x: origin.x + halfSize,
			z: origin.z + halfSize,
		};
	}

	/**
	 * Generate unique key for chunk coordinates
	 */
	getChunkKey(chunkX: number, chunkZ: number): string {
		return `${chunkX},${chunkZ}`;
	}

	/**
	 * Parse chunk key back to coordinates
	 */
	parseChunkKey(key: string): I_ChunkCoord {
		const [x, z] = key.split(",").map(Number);
		return { x, z };
	}

	/**
	 * Get all chunk coordinates within active radius of a world position
	 */
	getChunksInRadius(worldX: number, worldZ: number): I_ChunkCoord[] {
		const centerChunk = this.worldToChunk(worldX, worldZ);
		const chunks: I_ChunkCoord[] = [];

		for (let dx = -this.activeRadius; dx <= this.activeRadius; dx++) {
			for (let dz = -this.activeRadius; dz <= this.activeRadius; dz++) {
				chunks.push({
					x: centerChunk.x + dx,
					z: centerChunk.z + dz,
				});
			}
		}

		return chunks;
	}

	/**
	 * Update active chunks based on player position
	 * Returns chunks to load and chunks to unload
	 */
	updateActiveChunks(worldX: number, worldZ: number): {
		toLoad: I_ChunkCoord[];
		toUnload: I_ChunkCoord[];
	} {
		const newActiveChunks = new Set<string>();
		const chunksInRadius = this.getChunksInRadius(worldX, worldZ);

		// Mark new active chunks
		for (const chunk of chunksInRadius) {
			newActiveChunks.add(this.getChunkKey(chunk.x, chunk.z));
		}

		// Find chunks to load (in new set but not in old)
		const toLoad: I_ChunkCoord[] = [];
		for (const key of newActiveChunks) {
			if (!this.activeChunks.has(key)) {
				toLoad.push(this.parseChunkKey(key));
			}
		}

		// Find chunks to unload (in old set but not in new)
		const toUnload: I_ChunkCoord[] = [];
		for (const key of this.activeChunks) {
			if (!newActiveChunks.has(key)) {
				toUnload.push(this.parseChunkKey(key));
			}
		}

		// Update active set
		this.activeChunks = newActiveChunks;

		return { toLoad, toUnload };
	}

	/**
	 * Check if a chunk is currently active
	 */
	isChunkActive(chunkX: number, chunkZ: number): boolean {
		return this.activeChunks.has(this.getChunkKey(chunkX, chunkZ));
	}

	/**
	 * Get all currently active chunk coordinates
	 */
	getActiveChunks(): I_ChunkCoord[] {
		return Array.from(this.activeChunks).map((key) => this.parseChunkKey(key));
	}

	/**
	 * Get active chunk count
	 */
	getActiveChunkCount(): number {
		return this.activeChunks.size;
	}

	/**
	 * Clear all active chunks
	 */
	clear(): void {
		this.activeChunks.clear();
	}

	/**
	 * Update configuration
	 */
	setActiveRadius(radius: number): void {
		this.activeRadius = radius;
	}

	/**
	 * Get chunk size in world units
	 */
	getChunkWorldSize(): number {
		return this.chunkSize * this.tileSize;
	}

	/**
	 * Get configuration
	 */
	getConfig(): { chunkSize: number; tileSize: number; activeRadius: number } {
		return {
			chunkSize: this.chunkSize,
			tileSize: this.tileSize,
			activeRadius: this.activeRadius,
		};
	}
}
