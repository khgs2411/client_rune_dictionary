import { NearestFilter, Texture, TextureLoader } from "three";
import type { I_TextureOptions } from "../common/sprite.types";

interface CachedTexture {
	texture: Texture;
	refCount: number;
}

/**
 * TextureCache - Singleton utility for loading and caching textures
 *
 * Features:
 * - Loads textures asynchronously with configurable options
 * - Caches textures by path to prevent duplicate loading
 * - Reference counting for safe disposal when textures are no longer needed
 * - Default settings optimized for pixel art (NearestFilter, no mipmaps)
 *
 * Usage:
 * ```typescript
 * const cache = TextureCache.getInstance();
 *
 * // Load or get cached texture
 * const texture = await cache.load('/assets/sprites/player.png');
 *
 * // Increment ref count when component uses it
 * cache.retain('/assets/sprites/player.png');
 *
 * // Decrement ref count when component is destroyed
 * // (texture disposed when refCount reaches 0)
 * cache.release('/assets/sprites/player.png');
 * ```
 */
export class TextureCache {
	private static instance: TextureCache;
	private cache: Map<string, CachedTexture> = new Map();
	private loader: TextureLoader = new TextureLoader();

	private constructor() {}

	/**
	 * Get the singleton instance
	 */
	static getInstance(): TextureCache {
		if (!TextureCache.instance) {
			TextureCache.instance = new TextureCache();
		}
		return TextureCache.instance;
	}

	/**
	 * Load a texture or retrieve from cache
	 *
	 * @param path - Path to texture file
	 * @param options - Texture options (defaults to pixel-art optimized settings)
	 * @returns Promise resolving to the loaded texture
	 */
	async load(path: string, options?: I_TextureOptions): Promise<Texture> {
		// Return cached texture if exists
		const cached = this.cache.get(path);
		if (cached) {
			return cached.texture;
		}

		// Load new texture
		const texture = await this.loadTexture(path);

		// Apply options (defaults optimized for pixel art)
		texture.minFilter = options?.minFilter ?? NearestFilter;
		texture.magFilter = options?.magFilter ?? NearestFilter;
		texture.generateMipmaps = options?.generateMipmaps ?? false;

		if (options?.wrapS !== undefined) {
			texture.wrapS = options.wrapS;
		}
		if (options?.wrapT !== undefined) {
			texture.wrapT = options.wrapT;
		}

		texture.needsUpdate = true;

		// Cache with initial refCount of 0 (caller should retain)
		this.cache.set(path, { texture, refCount: 0 });

		return texture;
	}

	/**
	 * Load texture using TextureLoader (wrapped in Promise)
	 */
	private loadTexture(path: string): Promise<Texture> {
		return new Promise((resolve, reject) => {
			this.loader.load(
				path,
				(texture) => resolve(texture),
				undefined, // onProgress not used
				(error) => reject(new Error(`[TextureCache] Failed to load texture: ${path} - ${error}`)),
			);
		});
	}

	/**
	 * Increment reference count for a texture
	 * Call this when a component starts using a texture
	 *
	 * @param path - Path to texture
	 */
	retain(path: string): void {
		const cached = this.cache.get(path);
		if (cached) {
			cached.refCount++;
		} else {
			console.warn(`[TextureCache] Cannot retain unknown texture: ${path}`);
		}
	}

	/**
	 * Decrement reference count for a texture
	 * Disposes texture when refCount reaches 0
	 *
	 * @param path - Path to texture
	 */
	release(path: string): void {
		const cached = this.cache.get(path);
		if (!cached) {
			console.warn(`[TextureCache] Cannot release unknown texture: ${path}`);
			return;
		}

		cached.refCount--;

		if (cached.refCount <= 0) {
			// Dispose texture and remove from cache
			cached.texture.dispose();
			this.cache.delete(path);
		}
	}

	/**
	 * Check if a texture is cached
	 */
	has(path: string): boolean {
		return this.cache.has(path);
	}

	/**
	 * Get current reference count for a texture
	 */
	getRefCount(path: string): number {
		return this.cache.get(path)?.refCount ?? 0;
	}

	/**
	 * Force clear all cached textures
	 * Use only for scene cleanup or testing
	 */
	clear(): void {
		for (const [, cached] of this.cache) {
			cached.texture.dispose();
		}
		this.cache.clear();
	}

	/**
	 * Get cache statistics for debugging
	 */
	getStats(): { count: number; paths: string[] } {
		return {
			count: this.cache.size,
			paths: Array.from(this.cache.keys()),
		};
	}
}
