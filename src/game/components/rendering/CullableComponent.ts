import type { I_SceneContext } from "@/game/common/scenes.types";
import type { I_CullableConfig } from "@/game/common/culling.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";

/**
 * CullableComponent - Per-object culling configuration
 *
 * Add this component to GameObjects to customize their culling behavior.
 * Objects without this component use the system defaults.
 *
 * Usage:
 * ```typescript
 * // Never cull the player
 * this.addComponent(new CullableComponent({ neverCull: true }));
 *
 * // Custom cull distance for distant objects
 * this.addComponent(new CullableComponent({ cullDistance: 50 }));
 * ```
 */
export class CullableComponent extends GameComponent {
	public readonly priority = ComponentPriority.DEFAULT;

	private config: I_CullableConfig;

	constructor(config: I_CullableConfig = {}) {
		super();
		this.config = config;
	}

	async init(_context: I_SceneContext): Promise<void> {
		// No initialization needed - this is a data component
	}

	/** Override max distance for this object */
	get cullDistance(): number | undefined {
		return this.config.cullDistance;
	}

	/** Whether this object should never be culled */
	get neverCull(): boolean {
		return this.config.neverCull ?? false;
	}

	/** Importance level for LOD-style distance tiers */
	get importance(): "high" | "medium" | "low" | undefined {
		return this.config.importance;
	}

	/** Update culling config at runtime */
	setConfig(config: Partial<I_CullableConfig>): void {
		this.config = { ...this.config, ...config };
	}
}
