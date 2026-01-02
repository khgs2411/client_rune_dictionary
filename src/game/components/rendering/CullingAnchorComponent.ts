import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";

/**
 * CullingAnchorComponent - Marks a GameObject as the culling center point
 *
 * The CullingSystem will use the position of the GameObject with this component
 * as the center for distance-based culling calculations.
 *
 * Typically added to the LocalPlayer so culling is player-centric.
 *
 * Usage:
 * ```typescript
 * // In LocalPlayer prefab
 * this.addComponent(new CullingAnchorComponent());
 * ```
 */
export class CullingAnchorComponent extends GameComponent {
	public readonly priority = ComponentPriority.DEFAULT;

	async init(context: I_SceneContext): Promise<void> {
		// Register this GameObject as the culling anchor
		const cullingSystem = context.getService("culling");
		cullingSystem.setAnchor(this.gameObject);
	}
}
