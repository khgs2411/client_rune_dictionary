import type { I_MeshProvider } from "@/game/common/mesh.types";
import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, TRAIT } from "@/game/GameComponent";
import { GameObject } from "@/game/GameObject";
import { EventEmitterComponent } from "@/game/components/core/EventEmitterComponent";
import type { Intersection, Scene } from "three";

export type InteractionEventCallback = (gameObject: GameObject, intersection: Intersection) => void;

type InteractionEvents = {
	click: InteractionEventCallback;
	doubleclick: InteractionEventCallback;
};

/**
 * InteractionComponent - Generic interaction event proxy layer
 *
 * Provides a clean event emitter API for GameObject interactions.
 * Abstracts InteractionService complexity and provides reusable interaction events.
 *
 * This is like InteractionService but scoped to a specific GameObject.
 * Other components can require this component and listen to interaction events.
 *
 * Supported Events:
 * - 'click': Single left-click on GameObject
 * - 'doubleclick': Double left-click on GameObject (within 300ms)
 *
 * Usage:
 * ```typescript
 * // In another component (e.g., MatchComponent)
 * const interaction = this.requireComponent(InteractionComponent);
 *
 * interaction.on('click', (intersection) => {
 *   console.log('Clicked at:', intersection.point);
 * });
 *
 * interaction.on('doubleclick', (intersection) => {
 *   console.log('Double-clicked!');
 * });
 * ```
 *
 * Architecture:
 * - Requires I_MeshProvider (MeshComponent, SpriteComponent, etc.) for raycasting
 * - Registers with InteractionService
 * - Emits custom events to listeners
 * - Handles double-click detection internally
 *
 * Priority: INTERACTION (300) - Runs after rendering and physics
 */
export class InteractionComponent extends EventEmitterComponent<InteractionEvents> {
	public readonly priority = ComponentPriority.INTERACTION;

	// Double-click detection state
	private lastClickTime = 0;
	private readonly DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

	// Unregister functions from InteractionService
	private unregisterClick?: () => void;
	private unregisterHover?: () => void;

	public async init(context: I_SceneContext): Promise<void> {
		this.registerInteractions(context);
	}

	private registerInteractions(context: I_SceneContext): void {
		// Require any component that provides a mesh (MeshComponent, SpriteComponent, etc.)
		const meshProvider = this.requireByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		// Get InteractionService
		const interaction = context.getService("interaction");

		// Register click handler with requireHover
		this.unregisterClick = interaction.registerMouseClick(`${this.gameObject.id}-interaction-click`, "left", this.onClick.bind(this), {
			requireHover: true,
			object3D: meshProvider.getMesh(),
			gameObject: this.gameObject, // Pass gameObject so it's saved to store on click
		});
	}

	/**
	 * Handle click event from InteractionService
	 * @param _event
	 * @param intersection
	 * @returns void
	 */
	private onClick(_event: MouseEvent, intersection: Intersection | undefined): void {
		if (!intersection) return;

		// Always emit 'click' event
		this.emit("click", this.gameObject, intersection);

		// Double-click detection
		const now = Date.now();
		const timeSinceLastClick = now - this.lastClickTime;

		if (timeSinceLastClick < this.DOUBLE_CLICK_THRESHOLD) {
			// Double-click detected!
			this.emit("doubleclick", this.gameObject, intersection);
			this.lastClickTime = 0; // Reset to prevent triple-click
		} else {
			// Single click (start timer for potential double-click)
			this.lastClickTime = now;
		}
	}

	public destroy(scene: Scene): void {
		// Unregister from InteractionService
		if (this.unregisterClick) {
			this.unregisterClick();
		}
		if (this.unregisterHover) {
			this.unregisterHover();
		}

		// Let base class clear event listeners and cleanup registry
		super.destroy(scene);
	}
}
