import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";
import { E_SceneState } from "@/game/services/SceneStateService";
import { InteractionComponent } from "../interactions/InteractionComponent";
import { UnitsComponent } from "../systems/UnitsComponent";

/**
 * Arena configuration for match environment
 */
export interface I_ArenaConfig {
	width: number;
	depth: number;
	height: number;
}

export interface I_MatchComponentConfig {
	interactionRange?: number;
	arenaConfig?: Partial<I_ArenaConfig>;
}

/**
 * MatchComponent - Bridge that makes a GameObject "matchable"
 *
 * This component listens to double-click events from InteractionComponent
 * and triggers the match request flow via scene state change.
 *
 * Responsibilities:
 * - Listen to 'doubleclick' event from InteractionComponent
 * - Validate scene state (must be OVERWORLD)
 * - Check player is within interaction range (via UnitsComponent)
 * - Trigger MATCH_REQUEST state (MatchModule handles the rest)
 * - Hold arena configuration for match environment
 *
 * Does NOT handle:
 * - API calls (moved to MatchModule)
 * - Store updates (moved to MatchModule)
 * - Error handling (moved to MatchModule)
 *
 * Dependencies:
 * - Requires InteractionComponent (for doubleclick event)
 * - Requires UnitsComponent (for range checking)
 *
 * Usage:
 * ```typescript
 * const npc = new GameObject({ id: 'training-dummy' })
 *   .addComponent(new TransformComponent({ position: [0, 0, 0] }))
 *   .addComponent(new UnitsComponent())
 *   .addComponent(new InteractionComponent())
 *   .addComponent(new MatchComponent({ interactionRange: 10 }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after InteractionComponent
 */
export class MatchComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	/** Default interaction range in units */
	private static readonly DEFAULT_INTERACTION_RANGE = 10;

	/** Interaction range - player must be within this distance to start match */
	public readonly interactionRange: number;

	/**
	 * Arena configuration - read by MatchModule when spawning arena
	 * Defaults match current arena dimensions
	 */
	public readonly arenaConfig: I_ArenaConfig;

	private unitsComponent!: UnitsComponent;

	constructor(config: I_MatchComponentConfig = {}) {
		super();
		this.interactionRange = config.interactionRange ?? MatchComponent.DEFAULT_INTERACTION_RANGE;
		this.arenaConfig = {
			width: config.arenaConfig?.width ?? 40,
			depth: config.arenaConfig?.depth ?? 25,
			height: config.arenaConfig?.height ?? 20,
		};
	}

	async init(context: I_SceneContext): Promise<void> {
		this.unitsComponent = this.requireComponent(UnitsComponent);
		this.setupInteractionListener(context);
	}

	private setupInteractionListener(context: I_SceneContext): void {
		const interaction = this.requireComponent(InteractionComponent);

		interaction.on("doubleclick", async () => {
			console.log(`⚔️ [MatchComponent] Double-click detected on ${this.gameObject.id}`);
			this.requestMatch(context);
		});
	}

	/**
	 * Check if player is within interaction range
	 */
	public isWithinInteractionRange(): boolean {
		return this.unitsComponent.isPlayerWithinRange(this.interactionRange);
	}

	/**
	 * Request match start - triggers state change
	 * MatchModule handles API calls, arena spawning, camera transitions
	 */
	private requestMatch(context: I_SceneContext): void {
		const stateService = context.getService("state");

		if (!stateService.isOverworld()) {
			console.warn("⚔️ [MatchComponent] Cannot start match - not in OVERWORLD state");
			return;
		}

		// Check range before starting match
		if (!this.isWithinInteractionRange()) {
			const distance = this.unitsComponent.distanceToPlayer();
			console.log(`⚔️ [MatchComponent] Cannot start match - player too far (${distance.toFixed(1)} units, need ${this.interactionRange})`);
			return;
		}

		// Just trigger state change - MatchModule handles everything else
		stateService.setState(E_SceneState.MATCH_REQUEST);
	}

	destroy(): void {
		// InteractionComponent handles its own cleanup
	}
}
