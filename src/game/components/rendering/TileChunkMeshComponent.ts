import { I_SceneContext } from "@/game/common/scenes.types";
import {
	Box3,
	BufferAttribute,
	Color,
	Euler,
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	MeshBasicMaterial,
	PlaneGeometry,
	Quaternion,
	Vector3,
	WireframeGeometry,
	LineSegments,
	LineBasicMaterial,
} from "three";
import type { I_MeshProvider } from "../../common/mesh.types";
import { I_TileData, TILEMAP_DEFAULTS } from "../../common/tilemap.types";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";

export interface I_TileChunkMeshConfig {
	/** Chunk X coordinate in chunk space */
	chunkX: number;
	/** Chunk Z coordinate in chunk space */
	chunkZ: number;
	/** World units per tile (default: 1) */
	tileSize?: number;
	/** Tiles per chunk dimension (default: 32) */
	chunkSize?: number;
	/** Initial tile data - 2D array [row][col] */
	tileData?: I_TileData[][];
	/** Layer identifier for multi-layer (default: 'ground') */
	layer?: string;
	/** Whether to show debug wireframe overlay */
	debug?: boolean;
	/** Whether chunk receives shadows */
	receiveShadow?: boolean;
}

/**
 * TileChunkMeshComponent - Renders a chunk of tiles using InstancedMesh
 *
 * This component efficiently renders a grid of tiles (default 32x32 = 1024 tiles)
 * using a single draw call via Three.js InstancedMesh.
 *
 * Each tile is a PlaneGeometry instance with:
 * - Position set via instance matrix
 * - tileIndex attribute for future tileset atlas sampling
 * - height attribute for Y displacement
 *
 * Phase 1 uses colored tiles based on tileIndex (rainbow debug palette).
 * Phase 4 will add ShaderMaterial with tileset atlas sampling.
 *
 * @example
 * ```typescript
 * const chunkMesh = new TileChunkMeshComponent({
 *   chunkX: 0,
 *   chunkZ: 0,
 *   tileSize: 1,
 *   chunkSize: 32,
 *   tileData: myTileData,
 * });
 * ```
 */
export class TileChunkMeshComponent extends GameComponent implements I_MeshProvider {
	public readonly priority = ComponentPriority.RENDERING;

	public instancedMesh!: InstancedMesh;
	public boundingBox!: Box3;

	private config: I_TileChunkMeshConfig;
	private tileSize: number;
	private chunkSize: number;
	private tileData: I_TileData[][];
	private debugWireframe: LineSegments | null = null;
	private context!: I_SceneContext;

	// Per-instance attributes
	private tileIndexAttr!: InstancedBufferAttribute;
	private heightAttr!: InstancedBufferAttribute;

	constructor(config: I_TileChunkMeshConfig) {
		super();
		this.config = config;
		this.tileSize = config.tileSize ?? TILEMAP_DEFAULTS.TILE_SIZE;
		this.chunkSize = config.chunkSize ?? TILEMAP_DEFAULTS.CHUNK_SIZE;

		// Initialize tile data - use provided or create flat default
		if (config.tileData) {
			this.tileData = config.tileData;
		} else {
			this.tileData = this.createDefaultTileData();
		}

		// Register trait for system discovery
		this.registerTrait(TRAIT.MESH_PROVIDER);
	}

	/**
	 * Create default flat tile data with varied indices for testing
	 */
	private createDefaultTileData(): I_TileData[][] {
		const data: I_TileData[][] = [];
		for (let row = 0; row < this.chunkSize; row++) {
			data[row] = [];
			for (let col = 0; col < this.chunkSize; col++) {
				// Vary tile index based on position for visual testing
				const tileIndex = (row + col) % 16;
				data[row][col] = {
					tileIndex,
					height: 0,
					collisionType: "walkable",
				};
			}
		}
		return data;
	}

	/**
	 * Implements I_MeshProvider - returns the instanced mesh
	 */
	public getMesh(): InstancedMesh {
		return this.instancedMesh;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		// Restrict: only one mesh provider allowed per GameObject
		this.restrictByTrait(TRAIT.MESH_PROVIDER, "Use only one of: MeshComponent, InstancedMeshComponent, SpriteComponent, or TileChunkMeshComponent");

		const instanceCount = this.chunkSize * this.chunkSize;

		// Create tile plane geometry (1x1, will be scaled by tileSize in position)
		// Pre-rotate to horizontal (XZ plane) so we don't need rotation in matrix
		const geometry = new PlaneGeometry(this.tileSize, this.tileSize);
		geometry.rotateX(-Math.PI / 2); // Make horizontal

		// Phase 1: Use MeshBasicMaterial with instance colors
		// Phase 4 will replace with ShaderMaterial for tileset atlas
		const material = new MeshBasicMaterial({
			color: 0xffffff, // White base - instance colors will tint this
		});

		// Create instanced mesh
		this.instancedMesh = new InstancedMesh(geometry, material, instanceCount);
		this.instancedMesh.name = `chunk_${this.config.layer ?? "ground"}_${this.config.chunkX}_${this.config.chunkZ}`;
		this.instancedMesh.receiveShadow = this.config.receiveShadow ?? true;
		this.instancedMesh.castShadow = false; // Tiles don't cast shadows

		// Create per-instance attributes
		const tileIndices = new Float32Array(instanceCount);
		const heights = new Float32Array(instanceCount);

		// Calculate world position offset for this chunk
		const chunkWorldX = this.config.chunkX * this.chunkSize * this.tileSize;
		const chunkWorldZ = this.config.chunkZ * this.chunkSize * this.tileSize;

		// Temporary objects for matrix composition
		const matrix = new Matrix4();
		const position = new Vector3();
		const quaternion = new Quaternion(); // Identity - geometry is pre-rotated
		const scale = new Vector3(1, 1, 1);

		let instanceIndex = 0;
		for (let row = 0; row < this.chunkSize; row++) {
			for (let col = 0; col < this.chunkSize; col++) {
				const tile = this.tileData[row][col];

				// Calculate world position for this tile
				// Tile center is at (col + 0.5, height, row + 0.5) in local chunk space
				const worldX = chunkWorldX + (col + 0.5) * this.tileSize;
				const worldZ = chunkWorldZ + (row + 0.5) * this.tileSize;
				// Add 0.02 offset to render above Ground plane (which is at Y=-0.05)
				const worldY = tile.height + 0.02;

				position.set(worldX, worldY, worldZ);
				matrix.compose(position, quaternion, scale);
				this.instancedMesh.setMatrixAt(instanceIndex, matrix);

				// Store per-instance data
				tileIndices[instanceIndex] = tile.tileIndex;
				heights[instanceIndex] = tile.height;

				instanceIndex++;
			}
		}

		// Set instance matrix
		this.instancedMesh.instanceMatrix.needsUpdate = true;

		// Add per-instance attributes
		this.tileIndexAttr = new InstancedBufferAttribute(tileIndices, 1);
		this.heightAttr = new InstancedBufferAttribute(heights, 1);
		geometry.setAttribute("tileIndex", this.tileIndexAttr);
		geometry.setAttribute("height", this.heightAttr);

		// Set per-instance colors (rainbow palette for debugging)
		this.instancedMesh.instanceColor = new InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3);
		for (let i = 0; i < instanceCount; i++) {
			const color = this.getTileColor(tileIndices[i]);
			this.instancedMesh.setColorAt(i, color);
		}
		this.instancedMesh.instanceColor.needsUpdate = true;

		// Compute bounding box/sphere for frustum culling
		this.instancedMesh.computeBoundingSphere();
		this.boundingBox = new Box3().setFromObject(this.instancedMesh);

		// Add to scene
		context.scene.add(this.instancedMesh);

		// Register for cleanup
		this.cleanup.registerObject(this.instancedMesh);
		this.cleanup.registerDisposable(geometry);
		this.cleanup.registerDisposable(material);

		// Add debug wireframe if requested
		if (this.config.debug) {
			this.setDebugMode(true);
		}
	}

	/**
	 * Generate a color from tile index using rainbow HSL palette
	 */
	private getTileColor(tileIndex: number): Color {
		// Use HSL for nice rainbow gradient
		const hue = (tileIndex * 0.1) % 1.0; // Spread across hue spectrum
		const saturation = 0.7;
		const lightness = 0.5;
		return new Color().setHSL(hue, saturation, lightness);
	}

	/**
	 * Toggle debug wireframe overlay
	 */
	public setDebugMode(enabled: boolean): void {
		if (enabled && !this.debugWireframe) {
			// Create wireframe from instanced mesh geometry
			const wireGeom = new WireframeGeometry(this.instancedMesh.geometry);
			const wireMat = new LineBasicMaterial({ color: 0x000000, linewidth: 1 });
			this.debugWireframe = new LineSegments(wireGeom, wireMat);
			this.debugWireframe.name = `${this.instancedMesh.name}_wireframe`;

			// Position wireframe slightly above tiles to prevent z-fighting
			this.debugWireframe.position.y = 0.01;

			this.context.scene.add(this.debugWireframe);
			this.cleanup.registerObject(this.debugWireframe);
		} else if (!enabled && this.debugWireframe) {
			this.context.scene.remove(this.debugWireframe);
			this.debugWireframe.geometry.dispose();
			(this.debugWireframe.material as LineBasicMaterial).dispose();
			this.debugWireframe = null;
		}
	}

	/**
	 * Set visibility of the chunk (used by frustum culling in TileMapModule)
	 */
	public setVisible(visible: boolean): void {
		this.instancedMesh.visible = visible;
		if (this.debugWireframe) {
			this.debugWireframe.visible = visible;
		}
	}

	/**
	 * Get tile count
	 */
	public getTileCount(): number {
		return this.chunkSize * this.chunkSize;
	}

	/**
	 * Get chunk coordinates
	 */
	public getChunkCoords(): { x: number; z: number } {
		return { x: this.config.chunkX, z: this.config.chunkZ };
	}

	/**
	 * Get world bounds of this chunk
	 */
	public getWorldBounds(): Box3 {
		return this.boundingBox.clone();
	}

	destroy(): void {
		// Cleanup handled by CleanupRegistry via super.destroy()
		super.destroy(this.context?.scene);
	}
}
