import type { I_SceneContext, I_SceneSystem } from "@/game/common/scenes.types";
import { GameObject } from "@/game/GameObject";
import SceneSystem from "@/game/systems/SceneSystem";
import { FactoryFunction, ObjectPool } from "@/game/utils/ObjectPool";

/**
 * Factory configuration for spawn limits
 */
export interface I_FactoryConfig {
	poolSize?: number; // Max total instances globally (default: unlimited)
	maxActivePerOwner?: number; // Max active instances per owner (default: unlimited)
}

/**
 * SpawnModule - Scene module for spawning and pooling GameObjects
 *
 * This module provides:
 * - Object pooling for performance (reuse instead of create/destroy)
 * - Type-based pooling with instance IDs
 * - Dynamic factory registration
 * - Spawn/despawn lifecycle management
 * - Query utilities (get active objects by type, count, etc.)
 *
 * Architecture:
 * - Pools by TYPE (e.g., 'fireball', 'monster')
 * - Tracks by INSTANCE ID (unique per GameObject)
 * - Integrates with GameObjectsModule for scene lifecycle
 *
 * Usage:
 * ```typescript
 * // Register factory
 * spawnModule.registerFactory('fireball', (id, config) => {
 *   return new Fireball({ id, ...config });
 * });
 *
 * // Spawn instance
 * const fireball = spawnModule.spawn('fireball', {
 *   position: [0, 1, 0],
 *   direction: [1, 0, 0]
 * });
 *
 * // Despawn (returns to pool)
 * spawnModule.despawn(fireball.id);
 * ```
 */
export class Spawner extends SceneSystem implements I_SceneSystem {
	private pools = new Map<string, ObjectPool<GameObject>>();
	private factories = new Map<string, FactoryFunction>();
	private factoryConfigs = new Map<string, I_FactoryConfig>(); // type → config
	private active = new Map<string, GameObject>(); // id → instance
	private typeMap = new Map<string, string>(); // id → type (for despawn lookup)
	private ownerMap = new Map<string, string>(); // id → ownerId (for per-owner tracking)

	/**
	 * Initialize spawn module
	 */
	async init(context: I_SceneContext): Promise<void> {}

	/**
	 * Spawn a GameObject from a type or factory function
	 *
	 * @param typeOrFactory - Registered type string OR inline factory function
	 * @param ownerId - ID of the owner (for per-owner limits)
	 * @param config - Configuration passed to factory
	 * @returns Spawned GameObject instance or null if limits reached
	 *
	 * Examples:
	 * ```typescript
	 * // From registered type
	 * spawn('fireball', 'player-1', { position: [0, 1, 0] });
	 *
	 * // Inline factory (dynamic creation)
	 * spawn((id) => new GameObject({ id }), 'player-1', { poolKey: 'custom' });
	 * ```
	 */
	spawn(typeOrFactory: string | FactoryFunction, ownerId: string, config: any = {}): GameObject | null {
		let type: string;
		let factory: FactoryFunction;

		if (typeof typeOrFactory === "string") {
			// Spawning from registered type
			type = typeOrFactory;
			const _factory = this.factories.get(type);
			if (!_factory) {
				throw new Error(`[SpawnModule] No factory registered for type "${type}". Register with registerFactory() first.`);
			}
			factory = _factory;
		} else {
			// Inline factory function
			factory = typeOrFactory;
			type = config.poolKey || "dynamic";

			// Dynamically register factory if not already registered
			if (!this.factories.has(type)) {
				this.registerFactory(type, factory);
			}
		}

		// Check limits
		const factoryConfig = this.factoryConfigs.get(type);

		// 1. Check global poolSize limit
		if (factoryConfig?.poolSize !== undefined) {
			const totalActive = this.getActiveCount(type);
			if (totalActive >= factoryConfig.poolSize) {
				console.warn(`🚫 [Spawner] Spawn blocked - global poolSize limit reached for "${type}" (${totalActive}/${factoryConfig.poolSize})`);
				return null;
			}
		}

		// 2. Check per-owner maxActivePerOwner limit
		if (factoryConfig?.maxActivePerOwner !== undefined) {
			const ownerActive = this.getOwnerActiveCount(ownerId, type);
			if (ownerActive >= factoryConfig.maxActivePerOwner) {
				console.warn(`🚫 [Spawner] Spawn blocked - owner "${ownerId}" maxActive limit reached for "${type}" (${ownerActive}/${factoryConfig.maxActivePerOwner})`);
				return null;
			}
		}

		// Get or create pool for this type
		let pool = this.pools.get(type);
		if (!pool) {
			pool = new ObjectPool(type, factory);
			this.pools.set(type, pool);
		}

		// Acquire instance from pool
		const obj = pool.acquire(config);

		// Track instance
		this.active.set(obj.id, obj);
		this.typeMap.set(obj.id, type);
		this.ownerMap.set(obj.id, ownerId);

		// Add to scene via GameObjectsModule
		const gom = this.context.getService("gameObjectsManager");
		gom.register(obj, true);

		console.log(`🎯 [SpawnModule] Spawned "${type}" (id: ${obj.id}, active: ${pool.getActiveCount()})`);

		return obj;
	}

	/**
	 * Despawn a GameObject (returns to pool for reuse)
	 *
	 * @param id - GameObject instance ID to despawn
	 * @returns true if despawned, false if not found
	 */
	despawn(id: string): boolean {
		const obj = this.active.get(id);
		const type = this.typeMap.get(id);

		if (!obj || !type) {
			console.warn(`[SpawnModule] Cannot despawn - object not found: ${id}`);
			return false;
		}

		// Remove from scene
		const gom = this.context.getService("gameObjectsManager");
		gom.unregister(id);

		// Return to pool
		const pool = this.pools.get(type);
		if (pool) {
			pool.release(obj);
		}

		// Untrack
		this.active.delete(id);
		this.typeMap.delete(id);
		this.ownerMap.delete(id);

		return true;
	}

	/**
	 * Despawn all active objects (optionally filter by type)
	 *
	 * @param type - Optional type filter (despawn only this type)
	 * @returns Number of objects despawned
	 */
	despawnAll(type?: string): number {
		const toDespawn: string[] = [];

		if (type) {
			// Filter by type
			for (const [id, objType] of this.typeMap.entries()) {
				if (objType === type) {
					toDespawn.push(id);
				}
			}
		} else {
			// All active objects
			toDespawn.push(...this.active.keys());
		}

		// Despawn each
		let count = 0;
		for (const id of toDespawn) {
			if (this.despawn(id)) {
				count++;
			}
		}

		return count;
	}

	/**
	 * Register a factory function for a type
	 *
	 * @param type - Type identifier (e.g., 'fireball', 'monster')
	 * @param factory - Function that creates GameObject instances
	 * @param config - Optional spawn limits configuration
	 */
	registerFactory(type: string, factory: FactoryFunction, config: I_FactoryConfig = {}): void {
		if (this.factories.has(type)) {
			console.warn(`[SpawnModule] Factory for "${type}" already registered. Overwriting.`);
		}

		this.factories.set(type, factory);
		this.factoryConfigs.set(type, config);
	}

	/**
	 * Pre-warm a pool by creating instances ahead of time
	 *
	 * @param type - Type to pre-warm
	 * @param count - Number of instances to create
	 */
	preWarmPool(type: string, count: number): void {
		const factory = this.factories.get(type);
		if (!factory) {
			throw new Error(`[SpawnModule] Cannot pre-warm - no factory registered for type "${type}"`);
		}

		let pool = this.pools.get(type);
		if (!pool) {
			pool = new ObjectPool(type, factory);
			this.pools.set(type, pool);
		}

		pool.preWarm(count);
	}

	/**
	 * Get all active GameObjects of a type
	 *
	 * @param type - Type to filter by
	 * @returns Array of active GameObjects
	 */
	getActive(type: string): GameObject[] {
		const results: GameObject[] = [];

		for (const [id, objType] of this.typeMap.entries()) {
			if (objType === type) {
				const obj = this.active.get(id);
				if (obj) {
					results.push(obj);
				}
			}
		}

		return results;
	}

	/**
	 * Get count of active objects (optionally filter by type)
	 *
	 * @param type - Optional type filter
	 * @returns Count of active objects
	 */
	getActiveCount(type?: string): number {
		if (type) {
			return this.getActive(type).length;
		}
		return this.active.size;
	}

	/**
	 * Get count of active objects for a specific owner and type
	 *
	 * @param ownerId - Owner ID to filter by
	 * @param type - Type to filter by
	 * @returns Count of active objects owned by this owner of this type
	 */
	getOwnerActiveCount(ownerId: string, type: string): number {
		let count = 0;
		for (const [id, objType] of this.typeMap.entries()) {
			if (objType === type && this.ownerMap.get(id) === ownerId) {
				count++;
			}
		}
		return count;
	}

	/**
	 * Check if an object is currently active
	 *
	 * @param id - GameObject instance ID
	 * @returns true if active
	 */
	has(id: string): boolean {
		return this.active.has(id);
	}

	/**
	 * Get a specific active GameObject by ID
	 *
	 * @param id - GameObject instance ID
	 * @returns GameObject or null if not found
	 */
	get(id: string): GameObject | null {
		return this.active.get(id) || null;
	}

	/**
	 * Get pool statistics for debugging
	 */
	getPoolStats(type: string): {
		active: number;
		available: number;
		total: number;
	} | null {
		const pool = this.pools.get(type);
		if (!pool) return null;

		return {
			active: pool.getActiveCount(),
			available: pool.getAvailableCount(),
			total: pool.getTotalCount(),
		};
	}

	/**
	 * Get all registered types
	 */
	getRegisteredTypes(): string[] {
		return Array.from(this.factories.keys());
	}

	/**
	 * Cleanup all pools and active objects
	 */
	async destroy(): Promise<void> {
		// Despawn all active objects
		this.despawnAll();

		// Clear all pools
		for (const pool of this.pools.values()) {
			pool.clear();
		}

		this.pools.clear();
		this.factories.clear();
		this.factoryConfigs.clear();
		this.active.clear();
		this.typeMap.clear();
		this.ownerMap.clear();
	}
}
