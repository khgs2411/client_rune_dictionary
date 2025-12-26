import { CollisionComponent } from "@/game/components/physics/CollisionComponent";
import { GameObject } from "../GameObject";
import { I_SceneContext } from "../common/scenes.types";
import { TransformComponent } from "../components/entities/TransformComponent";
import { GeometryComponent } from "../components/rendering/GeometryComponent";
import { MaterialComponent } from "../components/rendering/MaterialComponent";
import { MeshComponent } from "../components/rendering/MeshComponent";

export interface I_MatchAreaDomeConfig {
	id: string;
	center: { x: number; y: number; z: number };
	radius: number;
	showDebug?: boolean;
}

/**
 * MatchAreaDome - Invisible collision sphere that prevents players from leaving match area
 *
 * **Purpose**:
 * - Creates physical boundary around match participants
 * - Prevents escape from match area during PVE_MATCH state
 * - Positioned at midpoint between player and NPC
 * - Size based on participant distance + buffer
 *
 * **Components**:
 * - TransformComponent: Position at calculated center
 * - GeometryComponent: Sphere geometry
 * - MaterialComponent: Invisible (or wireframe for debug)
 * - MeshComponent: Combines geometry + material
 * - PhysicsComponent: Static collision body
 *
 * **Lifecycle**:
 * - Created: When match starts (MATCH_REQUEST → PVE_MATCH)
 * - Destroyed: When match ends (return to OVERWORLD)
 *
 * **Usage**:
 * ```typescript
 * const dome = new MatchAreaDome({
 *   id: 'match-dome',
 *   center: { x: centerX, y: 0, z: centerZ },
 *   radius: (distance * 2 + 5) / 2,
 *   showDebug: DataStore.settings.debug.showPhysicsDebug
 * });
 * ```
 */
export class MatchAreaDome extends GameObject {
	private config: I_MatchAreaDomeConfig;

	constructor(config: I_MatchAreaDomeConfig) {
		super({ id: config.id });
		this.config = config;

		// Add components in priority order
		// Mesh is required for CollisionComponent, but we'll hide it if not debugging
		this.addComponent(
			new TransformComponent({
				position: [config.center.x, config.center.y, config.center.z],
			}),
		)
			.addComponent(
				new GeometryComponent({
					type: "sphere",
					params: [config.radius, 32, 32], // radius, widthSegments, heightSegments
				}),
			)
			.addComponent(
				new MaterialComponent({
					color: config.showDebug ? 0xff00ff : 0x000000, // Magenta for debug, black otherwise
					roughness: 1.0,
					metalness: 0.0,
				}),
			)
			.addComponent(new MeshComponent())
			.addComponent(
				new CollisionComponent({
					type: "static",
					shape: {
						type: "sphere",
						radius: config.radius,
					},
				}),
			);
	}

	async init(context: I_SceneContext): Promise<void> {
		// Initialize all components first
		await super.init(context);

		const meshComp = this.getComponent(MeshComponent);
		if (!meshComp || !meshComp.mesh) return;

		if (this.config.showDebug) {
			// Show as wireframe in debug mode
			const material = meshComp.mesh.material as any;
			if (material) {
				material.wireframe = true;
				material.opacity = 0.3;
				material.transparent = true;
			}
		} else {
			// Hide mesh completely when not debugging
			meshComp.mesh.visible = false;
		}
	}

	destroy(): void {
		super.destroy();
	}
}
