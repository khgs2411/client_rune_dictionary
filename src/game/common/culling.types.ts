// ============================================================================
// CULLING SYSTEM TYPES
// ============================================================================

/**
 * Configuration for the CullingSystem
 */
export interface I_CullingConfig {
	/** Max distance from camera before objects are hidden (default: 100) */
	maxDistance?: number;
	/** Distance from edge where fade starts (default: 5). Objects fade from full opacity to invisible over this distance. */
	fadeDistance?: number;
	/** Enable frustum-based culling checks (default: true) */
	frustumCulling?: boolean;
	/** Enable distance-based culling (default: true) */
	distanceCulling?: boolean;
	/** Show debug stats in console (default: false) */
	debug?: boolean;
}

/**
 * Per-GameObject culling settings (used by CullableComponent)
 */
export interface I_CullableConfig {
	/** Override max distance for this object (default: use system default) */
	cullDistance?: number;
	/** Never cull this object - always visible (e.g., player, important NPCs) */
	neverCull?: boolean;
	/** Importance level for LOD-style distance tiers (future enhancement) */
	importance?: "high" | "medium" | "low";
}

/**
 * Stats exposed by CullingSystem for debugging
 */
export interface I_CullingStats {
	visibleCount: number;
	culledCount: number;
	totalCount: number;
}
