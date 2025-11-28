import type { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";
import { E_SceneState } from "@/game/systems/SceneStateService";
import { UnitsComponent } from "../entities/UnitsComponent";
import { HoverComponent } from "../interactions/HoverComponent";
import { InteractionComponent } from "../interactions/InteractionComponent";
import { MeshComponent } from "../rendering/MeshComponent";

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
	glowColor?: number;
	glowIntensity?: number;
}

/**
 * MatchComponent - Bridge that makes a GameObject "matchable"
 *
 * This component listens to double-click events from InteractionComponent
 * and triggers the match request flow via scene state change.
 *
 * Responsibilities:
 * - Listen to 'doubleclick' event from InteractionComponent
 * - Listen to 'hover' events from HoverComponent
 * - Validate scene state (must be OVERWORLD)
 * - Check player is within interaction range (via UnitsComponent)
 * - Show combat glow when hovering in range (via VFXService)
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
 * - Requires HoverComponent (for hover events)
 * - Requires UnitsComponent (for range checking)
 * - Requires MeshComponent (for glow effects)
 *
 * Usage:
 * ```typescript
 * const npc = new GameObject({ id: 'training-dummy' })
 *   .addComponent(new TransformComponent({ position: [0, 0, 0] }))
 *   .addComponent(new MeshComponent())
 *   .addComponent(new UnitsComponent())
 *   .addComponent(new InteractionComponent())
 *   .addComponent(new HoverComponent())
 *   .addComponent(new MatchComponent({ interactionRange: 10, glowColor: 0xff0000 }));
 * ```
 *
 * Priority: INTERACTION (300) - Runs after InteractionComponent
 */
export class MatchComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	/** Default interaction range in units */
	private static readonly DEFAULT_INTERACTION_RANGE = 10;
	private static readonly DEFAULT_GLOW_COLOR = 0xff6666; // Subtle combat red
	private static readonly DEFAULT_GLOW_INTENSITY = 0.15; // Subtle highlight, not full glow

	/** Interaction range - player must be within this distance to start match */
	public readonly interactionRange: number;

	/** Glow color when hovering in range */
	private readonly glowColor: number;
	private readonly glowIntensity: number;

	/**
	 * Arena configuration - read by MatchModule when spawning arena
	 * Defaults match current arena dimensions
	 */
	public readonly arenaConfig: I_ArenaConfig;

	private unitsComponent!: UnitsComponent;
	private meshComponent!: MeshComponent;
	private context!: I_SceneContext;

	constructor(config: I_MatchComponentConfig = {}) {
		super();
		this.interactionRange = config.interactionRange ?? MatchComponent.DEFAULT_INTERACTION_RANGE;
		this.glowColor = config.glowColor ?? MatchComponent.DEFAULT_GLOW_COLOR;
		this.glowIntensity = config.glowIntensity ?? MatchComponent.DEFAULT_GLOW_INTENSITY;
		this.arenaConfig = {
			width: config.arenaConfig?.width ?? 40,
			depth: config.arenaConfig?.depth ?? 25,
			height: config.arenaConfig?.height ?? 20,
		};
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;
		this.unitsComponent = this.requireComponent(UnitsComponent);
		this.meshComponent = this.requireComponent(MeshComponent);
		this.setupInteractionListener(context);
		this.setupHoverListener();
	}

	private setupInteractionListener(context: I_SceneContext): void {
		const interaction = this.requireComponent(InteractionComponent);

		interaction.on("doubleclick", async () => {
			console.log(`⚔️ [MatchComponent] Double-click detected on ${this.gameObject.id}`);
			this.requestMatch(context);
		});
	}

	private setupHoverListener(): void {
		const hover = this.getComponent(HoverComponent);
		if (!hover) return;

		hover.on("start", () => {
			if (this.isWithinInteractionRange()) {
				this.showCombatGlow();
			}
		});

		hover.on("end", () => {
			this.hideCombatGlow();
		});
	}

	private showCombatGlow(): void {
		const vfx = this.context.getService("vfx");
		vfx.applyEmissive(this.meshComponent.mesh, this.glowColor, this.glowIntensity);
	}

	private hideCombatGlow(): void {
		const vfx = this.context.getService("vfx");
		vfx.restoreEmissive(this.meshComponent.mesh);
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
