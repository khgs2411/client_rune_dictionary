import type { I_MeshProvider } from "@/game/common/mesh.types";
import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent, TRAIT } from "@/game/GameComponent";
import type { VFXSystem } from "@/game/systems/VFXSystem";
import type { Object3D } from "three";
import { HoverComponent } from "./HoverComponent";

export interface I_HoverGlowConfig {
	glowColor?: number; // Color for emissive glow (default: 0xff8c00 - orange)
	glowIntensity?: number; // Emissive intensity (default: 0.3)
	tooltip?: {
		title: string;
		description?: string;
	};
}

/**
 * HoverGlowComponent - Applies glow effect on hover
 *
 * Requires HoverComponent for hover detection and uses VFXService for visual effects.
 * Requires I_MeshProvider (MeshComponent, SpriteComponent, etc.) for the glow target.
 *
 * Usage:
 * ```typescript
 * gameObject
 *   .addComponent(new MeshComponent())
 *   .addComponent(new HoverComponent())  // Required!
 *   .addComponent(new HoverGlowComponent({
 *     glowColor: 0xff8c00,
 *     glowIntensity: 0.3,
 *     tooltip: { title: 'Mysterious Box', description: 'Click to interact' }
 *   }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after rendering and physics
 */
export class HoverGlowComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	private config: I_HoverGlowConfig;
	private mesh!: Object3D;
	private vfx!: VFXSystem;

	constructor(config: I_HoverGlowConfig = {}) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		// Require HoverComponent for hover detection
		const hover = this.requireComponent(HoverComponent);

		// Get mesh from any mesh provider
		const meshProvider = this.requireByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		this.mesh = meshProvider.getMesh();

		this.vfx = context.getService("vfx");

		const glowColor = this.config.glowColor ?? 0xff8c00; // Orange
		const glowIntensity = this.config.glowIntensity ?? 0.3;

		// Listen to hover events
		hover.on("start", (_gameObject, intersection) => {
			// Apply glow via VFXService
			this.vfx.applyEmissive(this.mesh, glowColor, glowIntensity);

			// Show tooltip if configured
			if (this.config.tooltip && intersection) {
				this.vfx.showTooltip(intersection.point, this.config.tooltip.title, this.config.tooltip.description);
			}
		});

		hover.on("end", () => {
			// Restore original emissive
			this.vfx.restoreEmissive(this.mesh);

			// Hide tooltip
			if (this.config.tooltip) {
				this.vfx.hideTooltip();
			}
		});
	}
}
