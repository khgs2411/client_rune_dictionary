import { I_SceneContext } from "@/game/common/scenes.types";
import { Vector3 } from "three";
import { GameComponent } from "../../GameComponent";
import { TransformComponent } from "./TransformComponent";

export interface I_UnitsConfig {
	unitScale?: number;
}

/**
 * UnitsComponent - Pure measurement utility for distance calculations
 *
 * This component requires:
 * - TransformComponent (for position data)
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new UnitsComponent());
 *
 * // Later, query distance
 * const units = gameObject.getComponent(UnitsComponent);
 * const distance = units.distanceToPlayer();
 * const distanceToTarget = units.distanceTo(targetPosition);
 * ```
 *
 * Architecture:
 * - Pure getter methods, no state, no events
 * - Consumers (MatchComponent, etc.) query this component for distance checks
 * - Follows "Philosophy B" - distance is external to interaction capability
 */
export class UnitsComponent extends GameComponent {
	private transformComp!: TransformComponent;
	private context!: I_SceneContext;
	private config: I_UnitsConfig;

	constructor(config: I_UnitsConfig = {}) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;
		this.transformComp = this.requireComponent(TransformComponent);
	}

	/**
	 * Unit scale multiplier (default: 1)
	 * Can be used to convert between different unit systems
	 */
	public get unitScale(): number {
		return this.config.unitScale ?? 1;
	}

	/**
	 * Get Euclidean distance to a target position
	 * @param target - Target position (Vector3 or x,y,z coordinates)
	 */
	public distanceTo(target: Vector3): number {
		const distance = this.transformComp.position.distanceTo(target);
		return distance * this.unitScale;
	}

	/**
	 * Get distance to the player character
	 * Convenience method that queries the scene context for player position
	 */
	public distanceToPlayer(): number {
		const player = this.context.character;
		if (!player) {
			console.warn(`[UnitsComponent] No player character in context for "${this.gameObject.id}"`);
			return Infinity;
		}

		const playerPosition = player.controller.getPosition();
		return this.distanceTo(playerPosition);
	}

	/**
	 * Check if within a specified range of a target
	 * @param target - Target position
	 * @param range - Maximum distance (in units)
	 */
	public isWithinRange(target: Vector3, range: number): boolean {
		return this.distanceTo(target) <= range;
	}

	/**
	 * Check if player is within a specified range
	 * @param range - Maximum distance (in units)
	 */
	public isPlayerWithinRange(range: number): boolean {
		return this.distanceToPlayer() <= range;
	}

	/**
	 * Get current position (delegate to TransformComponent)
	 */
	public get position(): Vector3 {
		return this.transformComp.position;
	}
}
