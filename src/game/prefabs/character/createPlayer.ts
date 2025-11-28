import type { GameComponent } from "@/game/GameComponent";
import { TransformComponent } from "@/game/components/rendering/TransformComponent";
import { CharacterMeshComponent } from "@/game/components/rendering/CharacterMeshComponent";

/**
 * Configuration for shared character components
 */
export interface I_PlayerComponentsConfig {
	/** Starting position [x, y, z] */
	position: [number, number, number];
	/** Body capsule radius (default: 0.5) */
	bodyRadius?: number;
	/** Body capsule height (default: 1) */
	bodyHeight?: number;
	/** Forward indicator cone radius (default: 0.2) */
	coneRadius?: number;
	/** Forward indicator cone height (default: 0.4) */
	coneHeight?: number;
	/** Forward indicator Z offset from body center (default: 0.7) */
	coneOffset?: number;
	/** Body color (hex). If not provided, uses theme primary */
	bodyColor?: number;
	/** Cone color (hex). If not provided, uses theme accent */
	coneColor?: number;
}

/**
 * Factory function to create shared character components
 *
 * Creates the components needed by ALL player types (local and remote):
 * - TransformComponent: Source of truth for position/rotation
 * - CharacterMeshComponent: Visual representation (body + cone indicator)
 *
 * This ensures:
 * - TransformComponent is the single source of truth for transforms
 * - MovementComponent (local) updates TransformComponent
 * - RemotePlayerComponent (remote) updates TransformComponent
 * - CharacterMeshComponent reads from TransformComponent to update visuals
 *
 * Usage:
 * ```typescript
 * const sharedComponents = createCharacterComponents({
 *   position: [0, 1, 0],
 *   bodyRadius: 0.5,
 *   bodyHeight: 1,
 * });
 *
 * sharedComponents.forEach(comp => gameObject.addComponent(comp));
 * // Then add behavior-specific components (MovementComponent or RemotePlayerComponent)
 * ```
 *
 * @param config - Component configuration
 * @returns Array of components ready to add to a GameObject
 */
export function createPlayer(config: I_PlayerComponentsConfig): GameComponent[] {
	return [
		new TransformComponent({
			position: config.position,
		}),
		new CharacterMeshComponent({
			bodyRadius: config.bodyRadius ?? 0.5,
			bodyHeight: config.bodyHeight ?? 1,
			coneRadius: config.coneRadius ?? 0.2,
			coneHeight: config.coneHeight ?? 0.4,
			coneOffset: config.coneOffset ?? 0.7,
			initialPosition: config.position,
			bodyColor: config.bodyColor, // Pass through (undefined = use theme)
			coneColor: config.coneColor, // Pass through (undefined = use theme)
		}),
	];
}
