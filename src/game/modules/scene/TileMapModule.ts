/**
 * TileMapModule - SceneModule managing tile chunk lifecycle and frustum culling
 *
 * Responsibilities:
 * - Spawns/despawns chunks based on player position
 * - Frustum culling (calculate once per frame, cull all chunks)
 * - Chunk pooling integration
 * - Procedural generation via TileMapGenerator
 */

import type { I_GameCamera } from "@/composables/composables.types";
import { I_SceneContext, I_SceneModule } from "@/game/common/scenes.types";
import SceneModule from "@/game/modules/SceneModule";
import { Frustum, Matrix4 } from "three";
import { TileChunk } from "../../prefabs/environment/TileChunk";
import { ChunkManager, type I_ChunkCoord } from "../../utils/ChunkManager";
import { ChunkPool } from "../../utils/ChunkPool";
import { TileMapGenerator, type I_GeneratorConfig } from "../../utils/TileMapGenerator";

/**
 * TileMapModule configuration
 */
export interface I_TileMapModuleConfig {
	/** Tiles per chunk dimension */
	chunkSize?: number;
	/** World units per tile */
	tileSize?: number;
	/** Chunks to keep active around player (radius) */
	activeRadius?: number;
	/** Max chunks to pool for reuse */
	maxPoolSize?: number;
	/** Generator configuration */
	generatorConfig?: I_GeneratorConfig;
	/** Enable frustum culling */
	enableFrustumCulling?: boolean;
	/** Enable debug logging */
	debug?: boolean;
}

/**
 * TileMapModule class
 */
export class TileMapModule extends SceneModule implements I_SceneModule {
	private config: Required<I_TileMapModuleConfig>;

	// Core systems
	private chunkManager!: ChunkManager;
	private chunkPool!: ChunkPool;
	private generator!: TileMapGenerator;

	// Active chunks
	private activeChunks: Map<string, TileChunk> = new Map();

	// Frustum culling
	private frustum = new Frustum();
	private projMatrix = new Matrix4();
	private camera!: I_GameCamera;

	// Player tracking
	private lastPlayerX = 0;
	private lastPlayerZ = 0;
	private playerMoveThreshold = 8; // Only update chunks when player moves this far

	constructor(config: I_TileMapModuleConfig = {}) {
		super("tilemap");

		this.config = {
			chunkSize: config.chunkSize ?? 32,
			tileSize: config.tileSize ?? 1,
			activeRadius: config.activeRadius ?? 2,
			maxPoolSize: config.maxPoolSize ?? 16,
			generatorConfig: config.generatorConfig ?? {},
			enableFrustumCulling: config.enableFrustumCulling ?? true,
			debug: config.debug ?? false,
		};
	}

	protected async init(context: I_SceneContext): Promise<void> {
		// Initialize subsystems
		this.chunkManager = new ChunkManager({
			chunkSize: this.config.chunkSize,
			tileSize: this.config.tileSize,
			activeRadius: this.config.activeRadius,
		});

		this.chunkPool = new ChunkPool({
			maxPoolSize: this.config.maxPoolSize,
			chunkSize: this.config.chunkSize,
			tileSize: this.config.tileSize,
		});

		this.generator = new TileMapGenerator(this.config.generatorConfig);

		// Get camera reference (required for frustum culling)
		if (!context.camera) {
			console.warn("[TileMapModule] No camera in context - frustum culling disabled");
		}
		this.camera = context.camera!;

		// Initial chunk loading around origin
		this.updateChunksAroundPosition(0, 0);

		if (this.config.debug) {
			console.log(`[TileMapModule] Initialized with config:`, this.config);
		}
	}

	/**
	 * Update - called every frame
	 * Handles frustum culling and player position tracking
	 */
	public update(delta: number): void {
		// Frustum culling
		if (this.config.enableFrustumCulling) {
			this.updateFrustumCulling();
		}
	}

	/**
	 * Update frustum and cull chunks
	 */
	private updateFrustumCulling(): void {
		// Skip if no camera available
		if (!this.camera?.instance) return;

		const cam = this.camera.instance;

		// Calculate frustum once
		cam.updateMatrixWorld();
		this.projMatrix.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
		this.frustum.setFromProjectionMatrix(this.projMatrix);

		// Cull all chunks
		let visible = 0;
		let hidden = 0;

		for (const chunk of this.activeChunks.values()) {
			const bounds = chunk.getBoundingBox();
			const isVisible = this.frustum.intersectsBox(bounds);
			chunk.setVisible(isVisible);

			if (isVisible) visible++;
			else hidden++;
		}

		// Debug logging (throttled)
		if (this.config.debug && Math.random() < 0.01) {
			console.log(`[TileMapModule] Frustum: ${visible} visible, ${hidden} hidden`);
		}
	}

	/**
	 * Update chunks around a world position
	 * Call this when player moves significantly
	 */
	public updateChunksAroundPosition(worldX: number, worldZ: number): void {
		const { toLoad, toUnload } = this.chunkManager.updateActiveChunks(worldX, worldZ);

		// Unload chunks
		for (const coord of toUnload) {
			this.unloadChunk(coord.x, coord.z);
		}

		// Load chunks
		for (const coord of toLoad) {
			this.loadChunk(coord.x, coord.z);
		}

		if (this.config.debug && (toLoad.length > 0 || toUnload.length > 0)) {
			console.log(`[TileMapModule] Loaded ${toLoad.length}, unloaded ${toUnload.length} chunks`);
		}
	}

	/**
	 * Update player position and load/unload chunks if needed
	 */
	public setPlayerPosition(worldX: number, worldZ: number): void {
		const dx = worldX - this.lastPlayerX;
		const dz = worldZ - this.lastPlayerZ;
		const distance = Math.sqrt(dx * dx + dz * dz);

		if (distance >= this.playerMoveThreshold) {
			this.lastPlayerX = worldX;
			this.lastPlayerZ = worldZ;
			this.updateChunksAroundPosition(worldX, worldZ);
		}
	}

	/**
	 * Load a chunk at the given coordinates
	 */
	private loadChunk(chunkX: number, chunkZ: number): void {
		const key = this.chunkManager.getChunkKey(chunkX, chunkZ);

		if (this.activeChunks.has(key)) {
			return; // Already loaded
		}

		// Generate chunk data
		const chunkData = this.generator.generateChunk(chunkX, chunkZ, this.config.chunkSize);

		// Create chunk via pool
		const chunk = this.chunkPool.acquire({
			chunkX,
			chunkZ,
			tileSize: this.config.tileSize,
			chunkSize: this.config.chunkSize,
			tileData: chunkData.tiles,
		});

		// Register with GameObjectsManager
		this.context.getService("gameObjectsManager").register(chunk);

		// Track active chunk
		this.activeChunks.set(key, chunk);

		if (this.config.debug) {
			console.log(`[TileMapModule] Loaded chunk (${chunkX}, ${chunkZ})`);
		}
	}

	/**
	 * Unload a chunk at the given coordinates
	 */
	private unloadChunk(chunkX: number, chunkZ: number): void {
		const key = this.chunkManager.getChunkKey(chunkX, chunkZ);
		const chunk = this.activeChunks.get(key);

		if (!chunk) {
			return; // Not loaded
		}

		// Unregister from GameObjectsManager
		this.context.getService("gameObjectsManager").unregister(chunk.id);

		// Return to pool
		this.chunkPool.release(chunk);

		// Remove from active
		this.activeChunks.delete(key);

		if (this.config.debug) {
			console.log(`[TileMapModule] Unloaded chunk (${chunkX}, ${chunkZ})`);
		}
	}

	/**
	 * Get chunk at world position
	 */
	public getChunkAtWorld(worldX: number, worldZ: number): TileChunk | undefined {
		const coord = this.chunkManager.worldToChunk(worldX, worldZ);
		const key = this.chunkManager.getChunkKey(coord.x, coord.z);
		return this.activeChunks.get(key);
	}

	/**
	 * Get all active chunks
	 */
	public getActiveChunks(): TileChunk[] {
		return Array.from(this.activeChunks.values());
	}

	/**
	 * Get active chunk count
	 */
	public getActiveChunkCount(): number {
		return this.activeChunks.size;
	}

	/**
	 * Get stats for debugging
	 */
	public getStats(): {
		activeChunks: number;
		poolStats: ReturnType<ChunkPool["getStats"]>;
		managerConfig: ReturnType<ChunkManager["getConfig"]>;
	} {
		return {
			activeChunks: this.activeChunks.size,
			poolStats: this.chunkPool.getStats(),
			managerConfig: this.chunkManager.getConfig(),
		};
	}

	/**
	 * Force reload all chunks
	 */
	public reloadAllChunks(): void {
		// Unload all
		for (const [key, chunk] of this.activeChunks) {
			this.context.getService("gameObjectsManager").unregister(chunk.id);
			this.chunkPool.release(chunk);
		}
		this.activeChunks.clear();
		this.chunkManager.clear();

		// Reload around current position
		this.updateChunksAroundPosition(this.lastPlayerX, this.lastPlayerZ);
	}

	/**
	 * Update generator seed and reload
	 */
	public setGeneratorSeed(seed: number): void {
		this.generator.setSeed(seed);
		this.reloadAllChunks();
	}

	async destroy(): Promise<void> {
		// Unload all chunks
		for (const [key, chunk] of this.activeChunks) {
			this.context.getService("gameObjectsManager").unregister(chunk.id);
		}
		this.activeChunks.clear();
		this.chunkPool.clear();
		this.chunkManager.clear();
	}
}
