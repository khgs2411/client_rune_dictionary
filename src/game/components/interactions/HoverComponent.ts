import { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { Intersection } from "three";
import { MeshComponent } from "../rendering/MeshComponent";

export type HoverEventCallback = (intersection?: Intersection) => void;

export interface I_HoverConfig {
	glowColor?: number;
	glowIntensity?: number;
	tooltip?: {
		title: string;
		description?: string;
	};
}

/**
 * HoverComponent - Enables hover interaction and emits events
 *
 * This component provides hover capability for GameObjects.
 * It emits events that consumers (like MatchComponent) can listen to.
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
 * // Basic usage with visual effects
 * gameObject.addComponent(new HoverComponent({
 *   glowColor: 0xff8c00,
 *   tooltip: { title: 'Enemy', description: 'Double-click to fight' }
 * }));
 *
 * // Listen to hover events from another component
 * const hover = this.getComponent(HoverComponent);
 * hover?.on('start', (intersection) => {
 *   if (this.isWithinRange()) {
 *     // Show combat indicator
 *   }
 * });
 * ```
 *
 * Architecture:
 * - Follows Pattern B: emits events, consumers decide behavior
 * - Visual effects (glow, tooltip) are optional configuration
 * - Distance checks are NOT done here - consumers query UnitsComponent
 *
 * Priority: INTERACTION (300) - Runs after MeshComponent
 */
export class HoverComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	private config: I_HoverConfig;
	private events = new Map<string, HoverEventCallback[]>();
	private unregister?: () => void;
	private isHovered = false;

	constructor(config: I_HoverConfig = {}) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		const meshComp = this.requireComponent(MeshComponent);
		const interaction = context.getService("interaction");
		const vfx = context.getService("vfx");

		const glowColor = this.config.glowColor ?? 0xff8c00;
		const glowIntensity = this.config.glowIntensity ?? 0.3;

		this.unregister = interaction.registerHover(`${this.gameObject.id}-hover`, meshComp.mesh, {
			onStart: (intersection: Intersection) => {
				this.isHovered = true;

				// Apply visual effects if configured
				if (this.config.glowColor !== undefined) {
					vfx.applyEmissive(meshComp.mesh, glowColor, glowIntensity);
				}

				if (this.config.tooltip) {
					vfx.showTooltip(intersection.point, this.config.tooltip.title, this.config.tooltip.description);
				}

				// Emit event for consumers
				this.emit("start", intersection);
			},
			onEnd: () => {
				this.isHovered = false;

				// Restore visual effects
				if (this.config.glowColor !== undefined) {
					vfx.restoreEmissive(meshComp.mesh);
				}

				if (this.config.tooltip) {
					vfx.hideTooltip();
				}

				// Emit event for consumers
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
			callbacks.forEach((cb) => cb(intersection));
		}
	}

	destroy(): void {
		if (this.unregister) {
			this.unregister();
		}
		this.events.clear();
	}
}
