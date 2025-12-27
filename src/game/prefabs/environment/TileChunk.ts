import { TransformComponent } from "../../components/entities/TransformComponent";
import { TileChunkMeshComponent } from "../../components/rendering/TileChunkMeshComponent";
import { I_TileChunkConfig, I_TileData, TILEMAP_DEFAULTS } from "../../common/tilemap.types";
import { GameObject } from "../../GameObject";
import { Box3 } from "three";

/**
 * TileChunk Prefab - A chunk of tiles rendered efficiently via InstancedMesh
 *
 * This prefab creates a GameObject representing a rectangular chunk of tiles
 * (default 32x32 = 1024 tiles) that renders with a single draw call.
 *
 * Designed for the Tiled Ground System:
 * - Phase 1: Colored placeholder tiles for testing
 * - Phase 3: Managed by TileMapModule for large map support
 * - Phase 4: Tileset atlas textures via custom shader
 * - Phase 6: Collision via TileChunkCollisionComponent
 *
 * @example
 * ```typescript
 * // Create a chunk at position (0,0) in chunk coordinates
 * const chunk = new TileChunk({
 *   chunkX: 0,
 *   chunkZ: 0,
 *   tileSize: 1,
 *   chunkSize: 32,
 * });
 *
 * // Register with GameObjectsManager
 * const gom = scene.getService("gameObjectsManager");
 * gom.register(chunk);
 * ```
 */
export class TileChunk extends GameObject {
	private meshComponent!: TileChunkMeshComponent;
	private readonly chunkConfig: I_TileChunkConfig;

	constructor(config: I_TileChunkConfig) {
		const layer = config.layer ?? TILEMAP_DEFAULTS.DEFAULT_LAYER;
		super({
			id: `chunk_${layer}_${config.chunkX}_${config.chunkZ}`,
			type: "environment",
		});

		this.chunkConfig = config;

		// Create the mesh component
		this.meshComponent = new TileChunkMeshComponent({
			chunkX: config.chunkX,
			chunkZ: config.chunkZ,
			tileSize: config.tileSize ?? TILEMAP_DEFAULTS.TILE_SIZE,
			chunkSize: config.chunkSize ?? TILEMAP_DEFAULTS.CHUNK_SIZE,
			tileData: config.tileData,
			layer: layer,
			debug: config.debug ?? false,
			tileset: config.tileset,
		});

		// Add components
		// TransformComponent at origin - actual tile positions are in TileChunkMeshComponent
		this.addComponent(
			new TransformComponent({
				position: [0, 0, 0],
			}),
		).addComponent(this.meshComponent);

		// Phase 6 will add: CollisionComponent
	}

	/**
	 * Get the chunk coordinates
	 */
	public getChunkCoords(): { x: number; z: number } {
		return {
			x: this.chunkConfig.chunkX,
			z: this.chunkConfig.chunkZ,
		};
	}

	/**
	 * Get the world bounding box of this chunk
	 */
	public getBoundingBox(): Box3 {
		return this.meshComponent.getWorldBounds();
	}

	/**
	 * Set visibility of the chunk (used by frustum culling)
	 */
	public setVisible(visible: boolean): void {
		this.meshComponent.setVisible(visible);
	}

	/**
	 * Toggle debug wireframe overlay
	 */
	public setDebugMode(enabled: boolean): void {
		this.meshComponent.setDebugMode(enabled);
	}

	/**
	 * Reset chunk for reuse in chunk pooling
	 * Updates chunk coordinates and clears tile data
	 */
	public reset(chunkX: number, chunkZ: number, tileData?: I_TileData[][]): void {
		// Note: Full reset implementation will be added in Phase 3
		// when ChunkPool is implemented
		console.warn("[TileChunk] reset() not fully implemented - create new chunk instead");
	}

	/**
	 * Clear tile data for pooling (keeps geometry allocated)
	 */
	public clear(): void {
		// Note: Implementation will be added in Phase 3
		console.warn("[TileChunk] clear() not fully implemented");
	}
}
