import { GameObject } from "../GameObject";
import { TransformComponent } from "../components/entities/TransformComponent";

export interface I_MatchCameraAnchorConfig {
	id: string;
	position: { x: number; y: number; z: number };
}

/**
 * MatchCameraAnchor - Invisible GameObject serving as camera target during matches
 *
 * **Purpose**:
 * - Provides fixed position reference for match spectator camera
 * - No visual representation (invisible)
 * - Camera targets this position during PVE_MATCH state
 * - Positioned to capture full match area (dome + grid)
 *
 * **Components**:
 * - TransformComponent: Only component needed (just a position marker)
 *
 * **Lifecycle**:
 * - Created: When match starts (with dome + grid)
 * - Destroyed: When match ends
 *
 * **Position Calculation**:
 * - Typically positioned above and behind the match area
 * - Ensures both participants and full grid are visible
 * - Example: center + offset for overhead view
 *
 * **Usage**:
 * ```typescript
 * const anchor = new MatchCameraAnchor({
 *   id: 'match-camera-anchor',
 *   position: { x: centerX, y: 10, z: centerZ + 15 }
 * });
 *
 * ```
 */
export class MatchCameraAnchor extends GameObject {
	public position: { x: number; y: number; z: number };

	constructor(config: I_MatchCameraAnchorConfig) {
		super({ id: config.id });

		this.position = { ...config.position };

		// Only needs transform (just a position marker, no visuals)
		this.addComponent(
			new TransformComponent({
				position: [config.position.x, config.position.y, config.position.z],
			}),
		);
	}
}
