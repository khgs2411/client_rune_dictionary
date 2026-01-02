import {
	InstancedMesh,
	PlaneGeometry,
	ShaderMaterial,
	InstancedBufferAttribute,
	Matrix4,
	TextureLoader,
	NearestFilter,
	type Texture,
} from "three";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import type { I_SceneContext } from "../../common/scenes.types";
import type { I_TileGridConfig, TileSelection, TileSelectorContext } from "../../common/tile.types";
import { TransformComponent } from "../entities/TransformComponent";
import { SpriteSheetRegistry } from "../../SpriteSheetRegistry";

/**
 * TileGridComponent - Renders a grid of tiles using InstancedMesh
 *
 * Uses GPU instancing for efficient rendering of many tiles with a single draw call.
 * Each tile can display a different sprite from the tileset.
 *
 * Features:
 * - Efficient InstancedMesh rendering
 * - Per-tile UV selection from sprite sheet
 * - Configurable grid dimensions
 * - Extensible tile selector for future TileRuleset support
 *
 * @example Simple fixed tile
 * ```typescript
 * new TileGridComponent({
 *   tilesetId: "grass-tileset",
 *   size: [10, 10],
 *   defaultTile: { row: 1, column: 1 },
 * });
 * ```
 *
 * @example Random grass tiles
 * ```typescript
 * new TileGridComponent({
 *   tilesetId: "grass-tileset",
 *   gridWidth: 10,
 *   gridHeight: 10,
 *   tileSelector: (x, y) => ({
 *     row: 1,
 *     column: Math.floor(Math.random() * 4) + 1,
 *   }),
 * });
 * ```
 */
export class TileGridComponent extends GameComponent {
	public readonly priority = ComponentPriority.RENDERING;

	private config: I_TileGridConfig;
	private instancedMesh: InstancedMesh | null = null;
	private texture: Texture | null = null;

	// Resolved values
	private gridWidth = 0;
	private gridHeight = 0;
	private tileSize = 1;
	private columns = 1;
	private rows = 1;

	constructor(config: I_TileGridConfig) {
		super();
		this.config = config;
		this.tileSize = config.tileSize ?? 1;
	}

	async init(context: I_SceneContext): Promise<void> {
		// 1. Resolve grid dimensions
		const dimensions = this.resolveDimensions();
		this.gridWidth = dimensions.width;
		this.gridHeight = dimensions.height;

		// 2. Load tileset from registry
		const tilesetConfig = this.loadTilesetConfig();
		if (!tilesetConfig) {
			throw new Error(`[TileGridComponent] Tileset "${this.config.tilesetId}" not found in registry`);
		}

		this.columns = tilesetConfig.columns;
		this.rows = tilesetConfig.rows;

		// 3. Load texture
		this.texture = await this.loadTexture(tilesetConfig.texture);

		// 4. Create InstancedMesh
		this.createInstancedMesh(context);

		// 5. Populate instances
		this.populateInstances();
	}

	/**
	 * Resolve grid dimensions from config or fallbacks
	 */
	private resolveDimensions(): { width: number; height: number } {
		// 1. Try explicit grid dimensions
		if (this.config.gridWidth && this.config.gridHeight) {
			return { width: this.config.gridWidth, height: this.config.gridHeight };
		}

		// 2. Calculate from size prop
		if (this.config.size) {
			return {
				width: Math.ceil(this.config.size[0] / this.tileSize),
				height: Math.ceil(this.config.size[1] / this.tileSize),
			};
		}

		// 3. Try TransformComponent scale as size hint
		const transform = this.getComponent(TransformComponent);
		if (transform) {
			const scale = transform.getScaleArray();
			return {
				width: Math.ceil(scale[0] / this.tileSize),
				height: Math.ceil(scale[2] / this.tileSize), // Z is depth in XZ plane
			};
		}

		throw new Error("[TileGridComponent] Could not resolve grid dimensions. Provide gridWidth/gridHeight or size.");
	}

	/**
	 * Load tileset configuration from registry
	 */
	private loadTilesetConfig(): { texture: string; columns: number; rows: number } | null {
		const registry = SpriteSheetRegistry.GetInstance<SpriteSheetRegistry>();
		const config = registry.getSpriteConfig(this.config.tilesetId);

		if (!config) {
			return null;
		}

		return {
			texture: config.texture,
			columns: config.spriteSheet.columns,
			rows: config.spriteSheet.rows,
		};
	}

	/**
	 * Load texture with pixel-art friendly settings
	 */
	private loadTexture(path: string): Promise<Texture> {
		return new Promise((resolve, reject) => {
			const loader = new TextureLoader();
			loader.load(
				path,
				(texture) => {
					// Pixel-art settings
					texture.minFilter = NearestFilter;
					texture.magFilter = NearestFilter;
					texture.generateMipmaps = false;
					// Use standard image coordinates (V=0 at top, matches row indexing)
					texture.flipY = false;
					resolve(texture);
				},
				undefined,
				reject,
			);
		});
	}

	/**
	 * Create the InstancedMesh with custom shader for per-tile UVs
	 */
	private createInstancedMesh(context: I_SceneContext): void {
		const instanceCount = this.gridWidth * this.gridHeight;

		// Create tile geometry (XZ plane, facing up)
		// Add tiny overlap to prevent gaps from floating-point precision
		// More overlap on X axis (width) to handle isometric view angle
		const overlapX = 1.02;
		const overlapZ = 1.01;
		const geometry = new PlaneGeometry(this.tileSize * overlapX, this.tileSize * overlapZ);
		geometry.rotateX(-Math.PI / 2); // Rotate to lie flat on XZ plane

		// Create custom shader material for per-instance UVs
		const material = this.createShaderMaterial();

		// Create instanced mesh
		this.instancedMesh = new InstancedMesh(geometry, material, instanceCount);

		// Position relative to transform Y (if available) plus offset to prevent z-fighting
		const transform = this.getComponent(TransformComponent);
		const baseY = transform ? transform.position.y : 0;
		this.instancedMesh.position.y = baseY + (this.config.yOffset ?? 0.01);

		// Render order for depth sorting (lower = renders first/behind)
		this.instancedMesh.renderOrder = this.config.renderOrder ?? 0;

		// Flip X to correct UV orientation after plane rotation
		this.instancedMesh.scale.x = -1;

		// Add instance UV attribute (2 floats per instance: offsetX, offsetY)
		const uvOffsets = new Float32Array(instanceCount * 2);
		geometry.setAttribute("instanceUvOffset", new InstancedBufferAttribute(uvOffsets, 2));

		// Add to scene and register for cleanup
		context.scene.add(this.instancedMesh);
		this.cleanup.registerObject(this.instancedMesh);
		this.cleanup.registerDisposable(geometry);
		this.cleanup.registerDisposable(material);
		if (this.texture) {
			this.cleanup.registerDisposable(this.texture);
		}
	}

	/**
	 * Create shader material for tile rendering
	 */
	private createShaderMaterial(): ShaderMaterial {
		const uvScaleX = 1 / this.columns;
		const uvScaleY = 1 / this.rows;

		return new ShaderMaterial({
			uniforms: {
				tileTexture: { value: this.texture },
				uvScale: { value: { x: uvScaleX, y: uvScaleY } },
			},
			vertexShader: `
				attribute vec2 instanceUvOffset;
				varying vec2 vUv;
				varying vec2 vUvOffset;

				void main() {
					vUv = uv;
					vUvOffset = instanceUvOffset;
					gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform sampler2D tileTexture;
				uniform vec2 uvScale;
				varying vec2 vUv;
				varying vec2 vUvOffset;

				void main() {
					// Calculate final UV with offset and scale
					vec2 finalUv = vUvOffset + vUv * uvScale;
					vec4 texColor = texture2D(tileTexture, finalUv);

					// Discard fully transparent pixels
					if (texColor.a < 0.1) discard;

					gl_FragColor = texColor;
				}
			`,
			transparent: true,
			depthWrite: true, // Prevent objects from being hidden behind tiles
		});
	}

	/**
	 * Populate tile instances with positions and UVs
	 */
	private populateInstances(): void {
		if (!this.instancedMesh) return;

		const geometry = this.instancedMesh.geometry;
		const uvOffsetAttr = geometry.getAttribute("instanceUvOffset") as InstancedBufferAttribute;

		const matrix = new Matrix4();
		const context: TileSelectorContext = {
			gridWidth: this.gridWidth,
			gridHeight: this.gridHeight,
		};

		// Get transform for positioning relative to parent
		const transform = this.getComponent(TransformComponent);
		const baseX = transform ? transform.position.x - (this.gridWidth * this.tileSize) / 2 + this.tileSize / 2 : 0;
		const baseZ = transform ? transform.position.z - (this.gridHeight * this.tileSize) / 2 + this.tileSize / 2 : 0;

		let instanceIndex = 0;
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				// Get tile selection (null = hide this instance)
				const tile = this.selectTile(x, y, context);

				if (tile === null) {
					// Hide instance by scaling to zero
					matrix.makeScale(0, 0, 0);
					this.instancedMesh.setMatrixAt(instanceIndex, matrix);
					// UV doesn't matter for hidden tiles, but set to 0,0
					uvOffsetAttr.setXY(instanceIndex, 0, 0);
				} else {
					// Set instance position
					const worldX = baseX + x * this.tileSize;
					const worldZ = baseZ + y * this.tileSize;
					matrix.makeTranslation(worldX, 0, worldZ);
					this.instancedMesh.setMatrixAt(instanceIndex, matrix);

					// Set UV offset for this tile (row/col are 1-indexed, flipY=false so V=0 is top)
					const uvOffsetX = (tile.column - 1) / this.columns;
					const uvOffsetY = (tile.row - 1) / this.rows;
					uvOffsetAttr.setXY(instanceIndex, uvOffsetX, uvOffsetY);
				}

				instanceIndex++;
			}
		}

		// Mark attributes as needing update
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		uvOffsetAttr.needsUpdate = true;
	}

	/**
	 * Select which tile to render at a grid position
	 * Returns null to hide the tile (scale to zero)
	 */
	private selectTile(x: number, y: number, context: TileSelectorContext): TileSelection | null {
		// Use selector if provided
		if (this.config.tileSelector) {
			return this.config.tileSelector(x, y, context);
		}

		// Fall back to default tile
		if (this.config.defaultTile) {
			return this.config.defaultTile;
		}

		// Default to first tile
		return { row: 1, column: 1 };
	}

	/**
	 * Get the grid dimensions
	 */
	public getGridSize(): { width: number; height: number } {
		return { width: this.gridWidth, height: this.gridHeight };
	}

	/**
	 * Get tile size in world units
	 */
	public getTileSize(): number {
		return this.tileSize;
	}
}
