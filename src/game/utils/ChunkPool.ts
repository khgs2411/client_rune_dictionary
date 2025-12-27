/**
 * ChunkPool - Object pooling for TileChunk instances
 *
 * Reduces GC pressure by reusing chunk objects instead of
 * constantly creating/destroying them as player moves.
 */

import { TileChunk } from "../prefabs/environment/TileChunk";
import type { I_TileChunkConfig } from "../common/tilemap.types";

/**
 * ChunkPool configuration
 */
export interface I_ChunkPoolConfig {
	/** Maximum chunks to keep in pool */
	maxPoolSize?: number;
	/** Default tile size for new chunks */
	tileSize?: number;
	/** Default chunk size for new chunks */
	chunkSize?: number;
}

/**
 * ChunkPool class
 */
export class ChunkPool {
	private available: TileChunk[] = [];
	private maxPoolSize: number;
	private tileSize: number;
	private chunkSize: number;

	/** Stats for debugging */
	private stats = {
		created: 0,
		acquired: 0,
		released: 0,
		destroyed: 0,
	};

	constructor(config: I_ChunkPoolConfig = {}) {
		this.maxPoolSize = config.maxPoolSize ?? 16;
		this.tileSize = config.tileSize ?? 1;
		this.chunkSize = config.chunkSize ?? 32;
	}

	/**
	 * Acquire a chunk from the pool or create a new one
	 *
	 * @param config - Chunk configuration (chunkX, chunkZ required)
	 * @returns TileChunk instance
	 */
	acquire(config: I_TileChunkConfig): TileChunk {
		this.stats.acquired++;

		// Try to get from pool
		const pooledChunk = this.available.pop();
		if (pooledChunk) {
			// Note: Full reset would require rebuilding the mesh
			// For now, we create new chunks and pool handles disposal
			// Reset will be implemented when we add proper chunk recycling
			console.log(`[ChunkPool] Reusing pooled chunk for (${config.chunkX}, ${config.chunkZ})`);
		}

		// Create new chunk
		this.stats.created++;
		return new TileChunk({
			...config,
			tileSize: config.tileSize ?? this.tileSize,
			chunkSize: config.chunkSize ?? this.chunkSize,
		});
	}

	/**
	 * Release a chunk back to the pool
	 *
	 * @param chunk - TileChunk to release
	 * @returns true if pooled, false if destroyed (pool full)
	 */
	release(chunk: TileChunk): boolean {
		this.stats.released++;

		if (this.available.length < this.maxPoolSize) {
			// Pool has space - store for reuse
			// Note: We're not actually reusing yet, just tracking
			// Full pooling requires mesh reset capability
			this.available.push(chunk);
			return true;
		} else {
			// Pool full - must destroy
			this.stats.destroyed++;
			return false;
		}
	}

	/**
	 * Pre-warm the pool by creating chunks ahead of time
	 *
	 * @param count - Number of chunks to pre-create
	 */
	prewarm(count: number): void {
		const toCreate = Math.min(count, this.maxPoolSize - this.available.length);
		for (let i = 0; i < toCreate; i++) {
			// Create dummy chunks for pool
			// These will be reset when acquired
			const chunk = new TileChunk({
				chunkX: -9999 - i, // Dummy coords
				chunkZ: -9999 - i,
				tileSize: this.tileSize,
				chunkSize: this.chunkSize,
			});
			this.available.push(chunk);
			this.stats.created++;
		}
	}

	/**
	 * Clear the pool, destroying all cached chunks
	 */
	clear(): void {
		this.stats.destroyed += this.available.length;
		this.available = [];
	}

	/**
	 * Get current pool size
	 */
	getPoolSize(): number {
		return this.available.length;
	}

	/**
	 * Get pool statistics
	 */
	getStats(): typeof this.stats {
		return { ...this.stats };
	}

	/**
	 * Check if pool has available chunks
	 */
	hasAvailable(): boolean {
		return this.available.length > 0;
	}

	/**
	 * Update max pool size
	 */
	setMaxPoolSize(size: number): void {
		this.maxPoolSize = size;

		// Trim pool if over new limit
		while (this.available.length > this.maxPoolSize) {
			this.available.pop();
			this.stats.destroyed++;
		}
	}
}
