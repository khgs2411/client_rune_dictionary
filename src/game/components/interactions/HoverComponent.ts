import { I_SceneContext } from "@/game/common/scenes.types";
import { GameObject } from "@/game/GameObject";
import { Intersection } from "three";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { MeshComponent } from "../rendering/MeshComponent";

export type HoverEventCallback = (target: GameObject, intersection?: Intersection) => void;

/**
 * HoverComponent - Pure hover capability that emits events
 *
 * This component provides hover detection for GameObjects.
 * It emits events that consumers (like MatchComponent) can listen to and react.
 *
 * Requires:
 * - MeshComponent (for raycasting target)
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
export class HoverComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	private events = new Map<string, HoverEventCallback[]>();
	private unregister?: () => void;
	private isHovered = false;

	async init(context: I_SceneContext): Promise<void> {
		const meshComp = this.requireComponent(MeshComponent);
		const interaction = context.getService("interaction");

		this.unregister = interaction.registerHover(`${this.gameObject.id}-hover`, meshComp.mesh, {
			onStart: (intersection: Intersection) => {
				this.isHovered = true;
				this.emit("start", intersection);
			},
			onEnd: () => {
				this.isHovered = false;
				this.emit("end");
			},
		});
	}

	/**
	 * Register event listener
	 * @param event - Event type ('start' or 'end')
	 * @param callback - Function to call when event fires
	 */
	public on(event: "start" | "end", callback: HoverEventCallback): void {
		if (!this.events.has(event)) {
			this.events.set(event, []);
		}
		this.events.get(event)!.push(callback);
	}

	/**
	 * Check if currently being hovered
	 */
	public get hovering(): boolean {
		return this.isHovered;
	}

	/**
	 * Emit event to all registered listeners
	 */
	private emit(event: string, intersection?: Intersection): void {
		const callbacks = this.events.get(event);
		if (callbacks) {
			callbacks.forEach((cb) => cb(this.gameObject, intersection));
		}
	}

	destroy(): void {
		if (this.unregister) {
			this.unregister();
		}
		this.events.clear();
	}
}
