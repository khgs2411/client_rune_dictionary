import { I_SceneContext } from "@/game/common/scenes.types";
import {
	Box3,
	Color,
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	MeshBasicMaterial,
	PlaneGeometry,
	Quaternion,
	ShaderMaterial,
	Texture,
	TextureLoader,
	Vector2,
	Vector3,
	WireframeGeometry,
	LineSegments,
	LineBasicMaterial,
	NearestFilter,
	SRGBColorSpace,
} from "three";
import type { I_MeshProvider } from "../../common/mesh.types";
import { I_TileData, I_TilesetConfig, TILEMAP_DEFAULTS } from "../../common/tilemap.types";
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
	/** Tileset configuration - if provided, uses tileset shader instead of debug colors */
	tileset?: I_TilesetConfig;
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
// Static texture cache to avoid reloading the same tileset
const textureCache = new Map<string, Texture>();

/**
 * Vertex shader for tileset rendering
 * Passes tileIndex to fragment shader for UV calculation
 */
const TILESET_VERTEX_SHADER = /* glsl */ `
	attribute float tileIndex;
	varying vec2 vUv;
	varying float vTileIndex;

	void main() {
		vUv = uv;
		vTileIndex = tileIndex;
		gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
	}
`;

/**
 * Fragment shader for tileset rendering
 * Samples the correct tile from the atlas based on tileIndex
 * 
 * Atlas layout assumption:
 * - Row 0 is at TOP of texture (standard image convention)
 * - Tiles are read left-to-right, top-to-bottom
 * - tileIndex 0 = top-left of group, tileIndex 15 = bottom-right of 4x4 group
 */
const TILESET_FRAGMENT_SHADER = /* glsl */ `
	uniform sampler2D tilesetTexture;
	uniform vec2 atlasSize;       // Total tiles in atlas (columns, rows)
	uniform vec2 tileUvSize;      // Size of one tile in UV space (1/columns, 1/rows)
	uniform vec2 groupStart;      // Starting tile position (column, row) in atlas
	uniform vec2 groupSize;       // Size of our tile group (columns, rows)
	uniform vec2 texelSize;       // Size of one texel (1/pixelWidth, 1/pixelHeight)

	varying vec2 vUv;
	varying float vTileIndex;

	void main() {
		// Calculate which tile in our group
		float idx = floor(vTileIndex + 0.5); // Round to nearest int
		float groupCol = mod(idx, groupSize.x);
		float groupRow = floor(idx / groupSize.x);

		// Calculate actual atlas position (column, row in full atlas)
		float atlasCol = groupStart.x + groupCol;
		float atlasRow = groupStart.y + groupRow;

		// PlaneGeometry after rotateX(-PI/2) has UVs where:
		// - U increases along +X (correct)
		// - V increases along +Z (world), which maps to rows going "down" visually
		// We need to flip V so that row 0 of the tile appears at the "top" (far Z)
		vec2 localUv = vec2(vUv.x, 1.0 - vUv.y);

		// Calculate tile origin in UV space
		// Row 0 is at V=1 (top of texture), so we invert the row
		vec2 tileOrigin = vec2(
			atlasCol * tileUvSize.x,
			1.0 - (atlasRow + 1.0) * tileUvSize.y
		);

		// Half-texel inset to prevent bleeding from adjacent tiles
		// We shrink the sample area by 1 texel on each edge
		float inset = 0.5; // Half texel inset (in texels)
		vec2 insetUvMin = texelSize * inset / tileUvSize; // Min UV within tile (normalized 0-1)
		vec2 insetUvMax = 1.0 - insetUvMin;                // Max UV within tile
		vec2 clampedLocalUv = clamp(localUv, insetUvMin, insetUvMax);

		// Final UV = tile origin + position within tile (scaled to tile size)
		vec2 finalUv = tileOrigin + clampedLocalUv * tileUvSize;

		vec4 texColor = texture2D(tilesetTexture, finalUv);

		// Discard fully transparent pixels
		if (texColor.a < 0.1) discard;

		gl_FragColor = texColor;
	}
`;

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
	private material!: MeshBasicMaterial | ShaderMaterial;

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

		// Create material - tileset shader if config provided, else debug colors
		if (this.config.tileset) {
			this.material = await this.createTilesetMaterial(this.config.tileset);
		} else {
			this.material = new MeshBasicMaterial({
				color: 0xffffff, // White base - instance colors will tint this
			});
		}

		// Create instanced mesh
		this.instancedMesh = new InstancedMesh(geometry, this.material, instanceCount);
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

		// Debug: Log tile index distribution
		if (this.config.debug || this.config.tileset) {
			const indexCounts = new Map<number, number>();
			for (let i = 0; i < tileIndices.length; i++) {
				const idx = tileIndices[i];
				indexCounts.set(idx, (indexCounts.get(idx) ?? 0) + 1);
			}
			console.log(`[TileChunkMesh] Tile index distribution for chunk (${this.config.chunkX}, ${this.config.chunkZ}):`);
			for (const [idx, count] of indexCounts.entries()) {
				console.log(`  Index ${idx}: ${count} tiles`);
			}
		}

		// Add per-instance attributes
		this.tileIndexAttr = new InstancedBufferAttribute(tileIndices, 1);
		this.heightAttr = new InstancedBufferAttribute(heights, 1);
		geometry.setAttribute("tileIndex", this.tileIndexAttr);
		geometry.setAttribute("height", this.heightAttr);

		// Set per-instance colors only for debug mode (no tileset)
		if (!this.config.tileset) {
			this.instancedMesh.instanceColor = new InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3);
			for (let i = 0; i < instanceCount; i++) {
				const color = this.getTileColor(tileIndices[i]);
				this.instancedMesh.setColorAt(i, color);
			}
			this.instancedMesh.instanceColor.needsUpdate = true;
		}

		// Compute bounding box/sphere for frustum culling
		this.instancedMesh.computeBoundingSphere();
		this.boundingBox = new Box3().setFromObject(this.instancedMesh);

		// Add to scene
		context.scene.add(this.instancedMesh);

		// Register for cleanup
		this.cleanup.registerObject(this.instancedMesh);
		this.cleanup.registerDisposable(geometry);
		this.cleanup.registerDisposable(this.material);

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
	 * Create a ShaderMaterial for tileset atlas sampling
	 */
	private async createTilesetMaterial(tileset: I_TilesetConfig): Promise<ShaderMaterial> {
		// Load or get cached texture
		let texture = textureCache.get(tileset.texturePath);
		if (!texture) {
			const loader = new TextureLoader();
			texture = await loader.loadAsync(tileset.texturePath);

			// Configure texture for pixel art (no blurring)
			texture.magFilter = NearestFilter;
			texture.minFilter = NearestFilter;
			texture.colorSpace = SRGBColorSpace;
			texture.generateMipmaps = false;

			textureCache.set(tileset.texturePath, texture);
		}

		// Get actual texture dimensions
		const img = texture.image as HTMLImageElement;
		let atlasPixelWidth = tileset.atlasColumns * tileset.tilePixelSize;
		let atlasPixelHeight = tileset.atlasRows * tileset.tilePixelSize;
		let actualCols = tileset.atlasColumns;
		let actualRows = tileset.atlasRows;

		if (img) {
			// Calculate actual tile counts from image dimensions
			actualCols = Math.floor(img.width / tileset.tilePixelSize);
			actualRows = Math.floor(img.height / tileset.tilePixelSize);

			console.log(`[TileChunkMesh] Tileset loaded: ${img.width}x${img.height}px`);
			console.log(`[TileChunkMesh] Detected: ${actualCols}x${actualRows} tiles @ ${tileset.tilePixelSize}px`);
			console.log(`[TileChunkMesh] Config:   ${tileset.atlasColumns}x${tileset.atlasRows} tiles`);
			console.log(`[TileChunkMesh] Group: cols ${tileset.startColumn}-${tileset.startColumn + (tileset.groupColumns ?? 4) - 1}, rows ${tileset.startRow}-${tileset.startRow + (tileset.groupRows ?? 4) - 1}`);

			if (actualCols !== tileset.atlasColumns || actualRows !== tileset.atlasRows) {
				console.warn(`[TileChunkMesh] ⚠️ DIMENSION MISMATCH! Using actual image dimensions for UV calculation.`);
			}

			// Use actual dimensions for correct UV calculation
			atlasPixelWidth = img.width;
			atlasPixelHeight = img.height;
		}

		// Calculate UV sizes using ACTUAL texture dimensions
		const groupCols = tileset.groupColumns ?? 4;
		const groupRows = tileset.groupRows ?? 4;

		// Use actual dimensions for UV calculations
		const tileUvWidth = tileset.tilePixelSize / atlasPixelWidth;
		const tileUvHeight = tileset.tilePixelSize / atlasPixelHeight;

		console.log(`[TileChunkMesh] UV per tile: ${tileUvWidth.toFixed(4)} x ${tileUvHeight.toFixed(4)}`);
		console.log(`[TileChunkMesh] Texel size: ${(1/atlasPixelWidth).toFixed(6)} x ${(1/atlasPixelHeight).toFixed(6)}`);

		const shaderMaterial = new ShaderMaterial({
			uniforms: {
				tilesetTexture: { value: texture },
				atlasSize: { value: new Vector2(actualCols, actualRows) },
				tileUvSize: { value: new Vector2(tileUvWidth, tileUvHeight) },
				groupStart: { value: new Vector2(tileset.startColumn, tileset.startRow) },
				groupSize: { value: new Vector2(groupCols, groupRows) },
				texelSize: { value: new Vector2(1 / atlasPixelWidth, 1 / atlasPixelHeight) },
			},
			vertexShader: TILESET_VERTEX_SHADER,
			fragmentShader: TILESET_FRAGMENT_SHADER,
			transparent: true,
		});

		return shaderMaterial;
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
