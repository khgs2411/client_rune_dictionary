import { GameObject } from "../GameObject";

/**
 * Base config shared by all prefab factories
 * Extends this for prefab-specific configuration
 */
export interface I_BasePrefabConfig {
	id?: string;
	useToonShading?: boolean;
	vibrant?: boolean;
	enablePhysics?: boolean;
}

/**
 * Interface for prefab factories that create multiple GameObjects
 *
 * Use this interface when a prefab needs to create multiple distinct GameObjects
 * (e.g., House creates walls + roof, Trees creates trunks + leaves).
 *
 * For single-object prefabs, extend GameObject directly instead.
 *
 * @example
 * ```typescript
 * export class House implements I_PrefabFactory<I_HouseConfig, [GameObject, GameObject]> {
 *   static create(config: I_HouseConfig): [GameObject, GameObject] {
 *     // ... create walls and roof GameObjects
 *     return [walls, roof];
 *   }
 * }
 * ```
 */
export interface I_PrefabFactory<TConfig extends I_BasePrefabConfig, TResult extends GameObject | GameObject[]> {
	create(config: TConfig): TResult;
}
