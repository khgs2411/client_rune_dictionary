import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";
import type { Intersection, Object3D } from "three";

export interface I_MouseClickConfig {
	button?: "left" | "right" | "middle"; // Mouse button (default: 'left')
	onClick: (event: MouseEvent, intersection?: Intersection) => void; // Callback when clicked
	requireHover?: boolean; // Only trigger if hovering over object3D
	provideObject3D?: () => Object3D; // Optional - provide object for raycasting/hover
}

/**
 * MouseClickComponent - Generic mouse click component
 *
 * Registers a mouse click callback with InteractionService.
 * The callback can do anything - spawn objects, select entities, etc.
 *
 * This replaces ClickSpawnComponent with a more generic, reusable component.
 *
 * Usage:
 * ```typescript
 * // For spawning at cursor position
 * player.addComponent(new MouseClickComponent({
 *   button: 'left',
 *   onClick: (event, intersection) => {
 *     const spawner = context.getService('spawner');
 *     spawner.spawn('ice-shard', player.id, {
 *       position: intersection?.point || [0, 0, 0]
 *     });
 *   }
 * }));
 *
 * // For clicking on objects
 * box.addComponent(new MouseClickComponent({
 *   button: 'left',
 *   requireHover: true,
 *   provideObject3D: () => box.getComponent(MeshComponent).mesh,
 *   onClick: (event, intersection) => {
 *     console.log('Box clicked at:', intersection?.point);
 *   }
 * }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after physics/rendering
 */
export class MouseClickComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	private config: I_MouseClickConfig;
	private unregister?: () => void;

	constructor(config: I_MouseClickConfig) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		const interaction = context.getService("interaction");

		// Get object3D if provided (for raycasting/hover)
		const object3D = this.config.provideObject3D ? this.config.provideObject3D() : undefined;

		// Register mouse click callback with InteractionService
		this.unregister = interaction.registerMouseClick(
			`${this.gameObject.id}-click-${this.config.button || "left"}`,
			this.config.button || "left",
			(event, intersection) => {
				// Delegate to callback (component logic decided by user)
				this.config.onClick(event, intersection);
			},
			{
				requireHover: this.config.requireHover,
				object3D,
			},
		);
	}

	destroy(): void {
		// Unregister from InteractionService
		if (this.unregister) {
			this.unregister();
		}

		console.log(`🖱️  [MouseClickComponent] Unregistered ${this.config.button || "left"}-click for GameObject "${this.gameObject.id}"`);
	}
}
