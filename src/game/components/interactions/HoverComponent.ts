import type { I_MeshProvider } from "@/game/common/mesh.types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { GameObject } from "@/game/GameObject";
import { Intersection, Scene } from "three";
import { ComponentPriority, TRAIT } from "../../GameComponent";
import { EventEmitterComponent } from "@/game/components/core/EventEmitterComponent";

export type HoverEventCallback = (target: GameObject, intersection?: Intersection) => void;

type HoverEvents = {
	start: HoverEventCallback;
	end: HoverEventCallback;
};

/**
 * HoverComponent - Pure hover capability that emits events
 *
 * This component provides hover detection for GameObjects.
 * It emits events that consumers (like MatchComponent) can listen to and react.
 *
 * Requires:
 * - I_MeshProvider (MeshComponent, SpriteComponent, etc.) for raycasting target
 *
 * Events:
 * - 'start': Fired when hover begins (with intersection)
 * - 'end': Fired when hover ends
 *
 * Usage:
 * ```typescript
 * // Add hover capability
 * gameObject.addComponent(new HoverComponent());
 *
 * // Listen to hover events from another component
 * const hover = this.getComponent(HoverComponent);
 * hover?.on('start', (intersection) => {
 *   // React to hover - apply glow, show UI, etc.
 * });
 * hover?.on('end', () => {
 *   // Clean up hover effects
 * });
 * ```
 *
 * Architecture:
 * - Pure capability - emits events only, no visual effects
 * - Consumers (MatchComponent, etc.) decide what to do on hover
 * - Follows Pattern B: low-level emits, high-level reacts
 *
 * Priority: INTERACTION (300) - Runs after MeshComponent
 */
export class HoverComponent extends EventEmitterComponent<HoverEvents> {
	public readonly priority = ComponentPriority.INTERACTION;

	private unregister?: () => void;
	private isHovered = false;

	async init(context: I_SceneContext): Promise<void> {
		const meshProvider = this.requireByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		const interaction = context.getService("interaction");

		this.unregister = interaction.registerHover(`${this.gameObject.id}-hover`, meshProvider.getMesh(), {
			onStart: (intersection: Intersection) => {
				this.isHovered = true;
				this.emit("start", this.gameObject, intersection);
			},
			onEnd: () => {
				this.isHovered = false;
				this.emit("end", this.gameObject, undefined);
			},
		});
	}

	/**
	 * Check if currently being hovered
	 */
	public get hovering(): boolean {
		return this.isHovered;
	}

	destroy(scene: Scene): void {
		if (this.unregister) {
			this.unregister();
		}
		super.destroy(scene);
	}
}
