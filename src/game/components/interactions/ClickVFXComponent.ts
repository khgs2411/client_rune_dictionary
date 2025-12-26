import type { I_MeshProvider } from "@/game/common/mesh.types";
import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent, TRAIT } from "@/game/GameComponent";
import type { Intersection } from "three";

export interface I_ClickVFXConfig {
	button?: "left" | "right" | "middle"; // Mouse button (default: 'left')
	text?: string; // Click text (default: random POW/BAM/etc.)
	textColor?: string; // Text color (default: '#FFD700' - gold)
	cameraShake?: {
		intensity?: number; // Shake intensity (default: 0.1)
		duration?: number; // Shake duration in seconds (default: 0.3)
	};
	particles?: {
		count?: number; // Particle count (default: 20)
		color?: number; // Particle color (default: 0xffd700 - gold)
		speed?: number; // Particle speed (default: 3)
	};
	onClick?: (event: MouseEvent, intersection?: Intersection) => void; // Optional callback
}

/**
 * ClickVFXComponent - Visual effects on mouse click
 *
 * Uses InteractionService for click detection and VFXService for visual effects.
 * Requires MeshComponent to provide the mesh for raycasting.
 *
 * This replaces the click functionality from InteractableBuilder with a
 * reusable component that can be added to any GameObject.
 *
 * Features:
 * - POW!/BAM! text effects at click position
 * - Camera shake (optional)
 * - Particle burst (optional)
 * - Custom onClick callback (optional)
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new ClickVFXComponent({
 *   button: 'left',
 *   text: 'BOOM!',
 *   cameraShake: { intensity: 0.2, duration: 0.5 },
 *   particles: { count: 30, color: 0xff4500 },
 *   onClick: () => console.log('Clicked!')
 * }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after rendering and physics
 */
export class ClickVFXComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	private config: I_ClickVFXConfig;
	private unregister?: () => void;

	constructor(config: I_ClickVFXConfig = {}) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		// Require any mesh provider (MeshComponent, SpriteComponent, etc.)
		const meshProvider = this.requireByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);

		const interaction = context.getService("interaction");
		const vfx = context.getService("vfx");

		// Register click callback with InteractionService
		this.unregister = interaction.registerMouseClick(
			`${this.gameObject.id}-click-vfx`,
			this.config.button || "left",
			(event, intersection) => {
				if (!intersection) return;

				// Show click text effect (POW/BAM/etc.)
				vfx.showClickEffect(intersection.point, this.config.text, this.config.textColor);

				// Camera shake if configured
				if (this.config.cameraShake) {
					vfx.shakeCamera(this.config.cameraShake.intensity ?? 0.1, this.config.cameraShake.duration ?? 0.3);
				}

				// Particle burst if configured
				if (this.config.particles) {
					vfx.spawnParticles(intersection.point, this.config.particles.count ?? 20, this.config.particles.color ?? 0xffd700, this.config.particles.speed ?? 3);
				}

				// Trigger optional callback
				this.config.onClick?.(event, intersection);
			},
			{
				requireHover: true, // Only trigger if hovering over mesh
				object3D: meshProvider.getMesh(),
			},
		);
	}

	destroy(): void {
		// Unregister from InteractionService
		if (this.unregister) {
			this.unregister();
		}
	}
}
