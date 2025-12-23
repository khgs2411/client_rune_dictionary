import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from "three";
import type { I_MeshProvider } from "../../common/mesh.types";
import type { I_SceneContext } from "../../common/scenes.types";
import type { I_SpriteComponentConfig } from "../../common/sprite.types";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";
import { TextureCache } from "../../utils/TextureCache";
import { TransformComponent } from "../entities/TransformComponent";

/**
 * SpriteComponent - Renders a textured plane as a 2D sprite in 3D space
 *
 * Uses PlaneGeometry (not THREE.Sprite) to support cylindrical billboarding.
 * Works with BillboardComponent for camera-facing behavior.
 *
 * Features:
 * - Single texture or sprite sheet support
 * - Runtime texture swapping (for multi-texture animations)
 * - Configurable anchor point (bottom-center default for standing sprites)
 * - Proper transparency handling with alpha test
 * - Integrates with TransformComponent for positioning
 * - Implements I_MeshProvider for InteractionSystem compatibility
 * - Early warning for known-bad texture paths (cached from previous load failures)
 *
 * Usage:
 * ```typescript
 * new GameObject({ id: 'tree' })
 *   .addComponent(new TransformComponent({ position: [0, 0, 0] }))
 *   .addComponent(new SpriteComponent({
 *     texture: '/assets/sprites/tree.png',
 *     size: [2, 3],
 *     anchor: [0.5, 0]  // Bottom-center
 *   }))
 *   .addComponent(new BillboardComponent({ mode: 'cylindrical' }));
 * ```
 */
export class SpriteComponent extends GameComponent implements I_MeshProvider {
	public readonly priority = ComponentPriority.RENDERING;

	// Static texture validation cache (shared across all instances)
	private static verifiedTextures = new Set<string>();
	private static invalidTextures = new Set<string>();

	private config: I_SpriteComponentConfig;
	private mesh!: Mesh;
	private geometry!: PlaneGeometry;
	private material!: MeshBasicMaterial;
	private texture: Texture | null = null;
	private loaded = false;
	private context!: I_SceneContext;

	// Current texture path (for multi-texture support)
	private currentTexturePath: string;

	// Sprite sheet state
	private currentFrame = 0;
	private frameColumns = 1;
	private frameRows = 1;

	// Preloaded textures cache (for multi-texture sprites)
	private preloadedTextures: Map<string, Texture> = new Map();

	constructor(config: I_SpriteComponentConfig) {
		super();
		this.config = config;
		this.currentTexturePath = config.texture;
		this.registerTrait(TRAIT.MESH_PROVIDER);

		// Early validation: warn if texture is already known to be invalid
		this.validateTexturePath(config.texture);
	}

	/**
	 * Validate texture path against known good/bad cache
	 * Warns immediately if texture has previously failed to load
	 */
	private validateTexturePath(path: string): void {
		// Check if already known to be invalid
		if (SpriteComponent.invalidTextures.has(path)) {
			console.warn(`[SpriteComponent] Texture "${path}" has previously failed to load. Sprite will be invisible.`);
			return;
		}

		// Basic path format validation
		if (!path || typeof path !== "string") {
			console.warn(`[SpriteComponent] Invalid texture path: ${path}`);
			SpriteComponent.invalidTextures.add(path);
			return;
		}

		// Check for common path issues (optional, helps catch typos early)
		if (!path.startsWith("/") && !path.startsWith("http")) {
			console.warn(`[SpriteComponent] Texture path "${path}" should start with "/" for public assets or "http" for external URLs`);
		}
	}

	/**
	 * Mark a texture as verified (successfully loaded)
	 */
	private static markTextureVerified(path: string): void {
		SpriteComponent.verifiedTextures.add(path);
		SpriteComponent.invalidTextures.delete(path);
	}

	/**
	 * Mark a texture as invalid (failed to load)
	 */
	private static markTextureInvalid(path: string): void {
		SpriteComponent.invalidTextures.add(path);
		SpriteComponent.verifiedTextures.delete(path);
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		// Restrict: only one mesh provider allowed per GameObject
		this.restrictByTrait(TRAIT.MESH_PROVIDER, "Use only one of: MeshComponent, InstancedMeshComponent, or SpriteComponent");

		// Extract config with defaults
		const size = this.config.size ?? [1, 1];
		const anchor = this.config.anchor ?? [0.5, 0]; // Bottom-center default
		const opacity = this.config.opacity ?? 1;
		const alphaTest = this.config.alphaTest ?? 0.1;
		const depthWrite = this.config.depthWrite ?? false;
		const renderOrder = this.config.renderOrder ?? 0;

		// Store sprite sheet config
		if (this.config.spriteSheet) {
			this.frameColumns = this.config.spriteSheet.columns;
			this.frameRows = this.config.spriteSheet.rows;
		}
		this.currentFrame = this.config.initialFrame ?? 0;

		// Create geometry with anchor offset
		const offsetX = (0.5 - anchor[0]) * size[0];
		const offsetY = (0.5 - anchor[1]) * size[1];

		this.geometry = new PlaneGeometry(size[0], size[1]);
		this.geometry.translate(offsetX, offsetY, 0);

		// Create material (texture loaded async)
		this.material = new MeshBasicMaterial({
			transparent: true,
			opacity,
			alphaTest,
			depthWrite,
			side: DoubleSide,
		});

		// Create mesh
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.name = `sprite-${this.gameObject.id}`;
		this.mesh.renderOrder = renderOrder;
		this.mesh.castShadow = this.config.castShadow ?? false;
		this.mesh.receiveShadow = this.config.receiveShadow ?? false;

		// Sync initial position from TransformComponent
		this.syncTransform();

		// Add to scene
		context.scene.add(this.mesh);

		// Register for cleanup
		context.cleanupRegistry.registerObject(this.mesh);
		context.cleanupRegistry.registerDisposable(this.geometry);
		context.cleanupRegistry.registerDisposable(this.material);

		// Load texture async
		await this.loadTexture();
	}

	/**
	 * Load texture and apply to material
	 */
	private async loadTexture(): Promise<void> {
		try {
			const cache = TextureCache.getInstance();
			this.texture = await cache.load(this.config.texture);
			cache.retain(this.config.texture);

			this.material.map = this.texture;
			this.material.needsUpdate = true;

			// Cache in preloaded map
			this.preloadedTextures.set(this.config.texture, this.texture);

			// Set initial UV for sprite sheet
			if (this.config.spriteSheet) {
				this.updateUVs();
			}

			this.loaded = true;
			SpriteComponent.markTextureVerified(this.config.texture);
		} catch (error) {
			SpriteComponent.markTextureInvalid(this.config.texture);
			console.error(`[SpriteComponent] Failed to load texture "${this.config.texture}" for "${this.gameObject.id}":`, error);
		}
	}

	/**
	 * Preload additional textures for multi-texture sprite sheets
	 *
	 * Call this during init to preload all textures for smooth animation switching.
	 *
	 * @param texturePaths - Array of texture paths to preload
	 */
	async preloadTextures(texturePaths: string[]): Promise<void> {
		const cache = TextureCache.getInstance();

		const loadPromises = texturePaths.map(async (path) => {
			if (this.preloadedTextures.has(path)) return;

			try {
				const texture = await cache.load(path);
				cache.retain(path);
				this.preloadedTextures.set(path, texture);
				SpriteComponent.markTextureVerified(path);
			} catch (error) {
				SpriteComponent.markTextureInvalid(path);
				console.error(`[SpriteComponent] Failed to preload texture "${path}":`, error);
			}
		});

		await Promise.all(loadPromises);
	}

	/**
	 * Swap to a different texture
	 *
	 * For multi-texture sprite sheets where each animation is in a different file.
	 * If the texture is preloaded, swap is instant. Otherwise loads async.
	 *
	 * @param texturePath - Path to the new texture
	 * @param spriteSheet - Optional: new sprite sheet dimensions for this texture
	 * @returns Promise that resolves when texture is swapped
	 */
	async swapTexture(
		texturePath: string,
		spriteSheet?: { columns: number; rows: number },
	): Promise<void> {
		// Skip if already using this texture
		if (texturePath === this.currentTexturePath) return;

		// Update sprite sheet dimensions if provided
		if (spriteSheet) {
			this.frameColumns = spriteSheet.columns;
			this.frameRows = spriteSheet.rows;
		}

		// Check if texture is preloaded
		const preloaded = this.preloadedTextures.get(texturePath);
		if (preloaded) {
			this.texture = preloaded;
			this.material.map = preloaded;
			this.material.needsUpdate = true;
			this.currentTexturePath = texturePath;
			this.updateUVs();
			return;
		}

		// Load texture if not preloaded
		try {
			const cache = TextureCache.getInstance();
			const newTexture = await cache.load(texturePath);
			cache.retain(texturePath);

			this.texture = newTexture;
			this.material.map = newTexture;
			this.material.needsUpdate = true;

			// Cache for future use
			this.preloadedTextures.set(texturePath, newTexture);
			this.currentTexturePath = texturePath;

			this.updateUVs();
			SpriteComponent.markTextureVerified(texturePath);
		} catch (error) {
			SpriteComponent.markTextureInvalid(texturePath);
			console.error(`[SpriteComponent] Failed to swap texture to "${texturePath}":`, error);
		}
	}

	/**
	 * Synchronously swap to a preloaded texture
	 *
	 * Only works if the texture was preloaded. Returns false if texture not found.
	 *
	 * @param texturePath - Path to the preloaded texture
	 * @param spriteSheet - Optional: new sprite sheet dimensions
	 * @returns true if swap succeeded, false if texture not preloaded
	 */
	swapTextureSync(
		texturePath: string,
		spriteSheet?: { columns: number; rows: number },
	): boolean {
		if (texturePath === this.currentTexturePath) return true;

		const preloaded = this.preloadedTextures.get(texturePath);
		if (!preloaded) {
			console.warn(`[SpriteComponent] Texture "${texturePath}" not preloaded. Use preloadTextures() first.`);
			return false;
		}

		if (spriteSheet) {
			this.frameColumns = spriteSheet.columns;
			this.frameRows = spriteSheet.rows;
		}

		this.texture = preloaded;
		this.material.map = preloaded;
		this.material.needsUpdate = true;
		this.currentTexturePath = texturePath;
		this.updateUVs();

		return true;
	}

	/**
	 * Get current texture path
	 */
	getCurrentTexturePath(): string {
		return this.currentTexturePath;
	}

	/**
	 * Check if a texture is preloaded
	 */
	isTexturePreloaded(texturePath: string): boolean {
		return this.preloadedTextures.has(texturePath);
	}

	/**
	 * Update UVs for current frame (sprite sheet support)
	 */
	private updateUVs(): void {
		if (!this.texture || (this.frameColumns <= 1 && this.frameRows <= 1)) {
			return;
		}

		const col = this.currentFrame % this.frameColumns;
		const row = Math.floor(this.currentFrame / this.frameColumns);

		const frameWidth = 1 / this.frameColumns;
		const frameHeight = 1 / this.frameRows;

		// UV coordinates (bottom-left origin in Three.js)
		// Row 0 is at top of texture, so we invert Y
		const u0 = col * frameWidth;
		const u1 = u0 + frameWidth;
		const v0 = 1 - (row + 1) * frameHeight;
		const v1 = 1 - row * frameHeight;

		// PlaneGeometry UV attribute order
		const uvs = this.geometry.attributes.uv;
		uvs.setXY(0, u0, v1); // Top-left
		uvs.setXY(1, u1, v1); // Top-right
		uvs.setXY(2, u0, v0); // Bottom-left
		uvs.setXY(3, u1, v0); // Bottom-right
		uvs.needsUpdate = true;
	}

	/**
	 * Sync mesh transform with TransformComponent
	 * Preserves flip state (scale.x sign) when syncing scale
	 */
	private syncTransform(): void {
		const transform = this.getComponent(TransformComponent);
		if (transform && this.mesh) {
			this.mesh.position.copy(transform.position);
			this.mesh.rotation.copy(transform.rotation);
			// Preserve flip state (negative scale.x) when syncing
			const wasFlipped = this.mesh.scale.x < 0;
			this.mesh.scale.copy(transform.scale);
			if (wasFlipped) {
				this.mesh.scale.x = -Math.abs(this.mesh.scale.x);
			}
		}
	}

	/**
	 * Update called every frame - syncs transform
	 */
	update(_delta: number): void {
		this.syncTransform();
	}

	/**
	 * Set the current frame by index
	 */
	setFrame(index: number): void {
		const maxFrame = this.frameColumns * this.frameRows - 1;
		this.currentFrame = Math.max(0, Math.min(index, maxFrame));
		this.updateUVs();
	}

	/**
	 * Set the current frame by column and row
	 */
	setFrameByPosition(column: number, row: number): void {
		const index = row * this.frameColumns + column;
		this.setFrame(index);
	}

	/**
	 * Get current frame index
	 */
	getFrame(): number {
		return this.currentFrame;
	}

	/**
	 * Check if texture is loaded
	 */
	isLoaded(): boolean {
		return this.loaded;
	}

	/**
	 * Get the texture (may be null if not loaded)
	 */
	getTexture(): Texture | null {
		return this.texture;
	}

	/**
	 * Get the mesh (implements I_MeshProvider)
	 */
	getMesh(): Mesh {
		return this.mesh;
	}

	/**
	 * Set sprite opacity
	 */
	setOpacity(opacity: number): void {
		this.material.opacity = Math.max(0, Math.min(1, opacity));
	}

	/**
	 * Set sprite tint color
	 */
	setTint(color: number): void {
		this.material.color.setHex(color);
	}

	/**
	 * Flip sprite horizontally
	 *
	 * Used by DirectionalSpriteAnimator for direction fallback
	 * (e.g., using 'right' animation flipped for 'left' direction)
	 *
	 * @param flip - true to flip horizontally, false for normal
	 */
	setFlipX(flip: boolean): void {
		if (!this.mesh) return;
		this.mesh.scale.x = flip ? -Math.abs(this.mesh.scale.x) : Math.abs(this.mesh.scale.x);
	}

	/**
	 * Check if sprite is flipped horizontally
	 */
	isFlippedX(): boolean {
		return this.mesh?.scale.x < 0;
	}

	/**
	 * Set sprite size (recreates geometry)
	 */
	setSize(width: number, height: number): void {
		const anchor = this.config.anchor ?? [0.5, 0];
		const offsetX = (0.5 - anchor[0]) * width;
		const offsetY = (0.5 - anchor[1]) * height;

		// Dispose old geometry
		this.geometry.dispose();

		// Create new geometry
		this.geometry = new PlaneGeometry(width, height);
		this.geometry.translate(offsetX, offsetY, 0);
		this.mesh.geometry = this.geometry;

		// Re-apply UVs if sprite sheet
		if (this.config.spriteSheet) {
			this.updateUVs();
		}

		// Register new geometry for cleanup
		this.context.cleanupRegistry.registerDisposable(this.geometry);
	}

	/**
	 * Cleanup - release all textures and remove mesh
	 */
	destroy(): void {
		const cache = TextureCache.getInstance();

		// Release all preloaded textures
		for (const [path] of this.preloadedTextures) {
			cache.release(path);
		}
		this.preloadedTextures.clear();

		// Manual mesh removal
		if (this.mesh?.parent) {
			this.mesh.parent.remove(this.mesh);
		}

		// Only call super.destroy if context was initialized
		if (this.context?.scene) {
			super.destroy(this.context.scene);
		}
	}
}
