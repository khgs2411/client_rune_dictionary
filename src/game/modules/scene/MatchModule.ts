import MatchAPI from "@/api/match.api";
import { I_CreatePveMatchRequest } from "@/common/match.types";
import { CAMERA_PRESET_OVERWORLD } from "@/composables/composables.types";
import { I_SceneContext, I_SceneModule } from "@/game/common/scenes.types";
import { I_ArenaConfig, MatchComponent } from "@/game/components/match/MatchComponent";
import { TransformComponent } from "@/game/components/rendering/TransformComponent";
import SceneModule from "@/game/modules/SceneModule";
import { MatchAreaWalls } from "@/game/prefabs/MatchAreaWalls";
import { MatchCameraAnchor } from "@/game/prefabs/MatchCameraAnchor";
import { MatchGrid } from "@/game/prefabs/MatchGrid";
import { E_SceneState, type StateChangeCallback } from "@/game/services/SceneStateService";
import { DataStore } from "@/stores/DataStore";
import { Vector3 } from "three";

/**
 * MatchModule - Full match orchestrator
 *
 * **Responsibilities**:
 * 1. Subscribe to SceneStateService for state changes
 * 2. Handle MATCH_REQUEST → API call → PVE_MATCH transition
 * 3. Spawn match environment on PVE_MATCH
 * 4. Destroy match environment on OVERWORLD return
 *
 * **State Flow**:
 * OVERWORLD → MATCH_REQUEST → PVE_MATCH → OVERWORLD
 *
 * **Match Environment**:
 * - MatchAreaWalls: Rectangle of walls preventing match exit
 * - MatchGrid: Tactical grid overlay
 * - MatchCameraAnchor: Fixed camera position reference
 *
 * **Usage**:
 * ```typescript
 * this.registerModule('match', new MatchModule());
 * ```
 */
export class MatchModule extends SceneModule implements I_SceneModule {
	// Arena objects
	private walls: MatchAreaWalls | null = null;
	private grid: MatchGrid | null = null;
	private cameraAnchor: MatchCameraAnchor | null = null;

	// Services and state
	private stateChangeCallback: StateChangeCallback | null = null;
	private matchAPI = new MatchAPI();
	private settings = DataStore.settings;

	// Default arena config (used if target has no MatchComponent)
	private readonly DEFAULT_ARENA: I_ArenaConfig = {
		width: 40,
		depth: 25,
		height: 20,
	};

	/**
	 * State action handlers map
	 * Keys can be:
	 * - Single state: "NEW_STATE" - triggers on any transition TO that state
	 * - Compound state: "OLD_STATE->NEW_STATE" - triggers only on specific transition
	 */
	private readonly stateActions: Map<string, () => void | Promise<void>> = new Map([
		[E_SceneState.MATCH_REQUEST, this.onMatchRequest.bind(this)],
		[`${E_SceneState.MATCH_REQUEST}->${E_SceneState.PVE_MATCH}`, this.enterMatch.bind(this)],
		[`${E_SceneState.PVE_MATCH}->${E_SceneState.OVERWORLD}`, this.exitMatch.bind(this)],
	]);

	async init(context: I_SceneContext): Promise<void> {
		const stateService = context.getService("state");
		this.stateChangeCallback = this.onStateChange.bind(this);
		stateService.register(this.stateChangeCallback);
	}

	async destroy(): Promise<void> {
		if (this.stateChangeCallback && this.context) {
			const stateService = this.context.getService("state");
			stateService.unregister(this.stateChangeCallback);
		}
		this.destroyArena();
		this.stateChangeCallback = null;
	}

	/**
	 * React to scene state changes using the state actions map
	 */
	private async onStateChange(newState: E_SceneState, oldState: E_SceneState): Promise<void> {
		const compoundKey = `${oldState}->${newState}`;

		// Try compound key first (more specific), then fall back to single state key
		const action = this.stateActions.get(compoundKey) ?? this.stateActions.get(newState);

		if (action) await action();
	}

	/**
	 * Handle MATCH_REQUEST state - create match via API
	 */
	private async onMatchRequest() {
		try {
			await this.createMatch();
			this.context?.getService("state").setState(E_SceneState.PVE_MATCH);
		} catch (error) {
			this.handleMatchCreationError(error);
		}
	}

	/**
	 * Create match via API and update store
	 */
	private async createMatch(): Promise<void> {
		const clientData = DataStore.websocket.clientData;
		if (!clientData) {
			throw new Error("Client not connected - cannot create match");
		}

		const payload: I_CreatePveMatchRequest = { whoami: clientData };
		const response = await this.matchAPI.createPveMatch(payload);

		DataStore.match.setInitialMatchState({
			matchId: response.matchId,
			channelId: response.channelId,
			channelName: response.channelName,
			state: response.state,
		});
	}

	/**
	 * Handle match creation error - revert to OVERWORLD
	 */
	private handleMatchCreationError(error: unknown): void {
		console.error("⚔️ [MatchModule] Match creation failed:", error);
		const stateService = this.context?.getService("state");
		stateService?.setState(E_SceneState.OVERWORLD);
	}

	/**
	 * Enter match - spawn arena and transition camera
	 */
	private enterMatch(): void {
		if (!this.context?.character) {
			console.error("⚔️ [MatchModule] Cannot enter match - no character");
			return;
		}

		const config = this.getArenaConfig();
		const center = this.calculateArenaCenter();

		this.spawnArena(center, config);
		this.transitionToMatchCamera(center);
	}

	/**
	 * Exit match - destroy arena and reset camera
	 */
	private exitMatch(): void {
		this.destroyArena();
		this.transitionToOverworldCamera();
	}

	/**
	 * Get arena config from target's MatchComponent or use defaults
	 */
	private getArenaConfig(): I_ArenaConfig {
		const target = DataStore.scene.getSavedGameObject();
		if (!target) return this.DEFAULT_ARENA;

		const matchComp = target.getComponent(MatchComponent);
		if (!matchComp) return this.DEFAULT_ARENA;

		return matchComp.arenaConfig;
	}

	/**
	 * Calculate arena center - midpoint between player and target
	 */
	private calculateArenaCenter(): Vector3 {
		const target = DataStore.scene.getSavedGameObject();
		const player = this.context?.character;

		if (!target || !player) {
			console.warn("⚔️ [MatchModule] Missing target or player, using origin");
			return new Vector3(0, 0, 0);
		}

		const targetTransform = target.getComponent(TransformComponent);
		const targetPos = targetTransform?.position ?? { x: 0, y: 0, z: 0 };
		const playerPos = player.controller.getPosition();

		// Midpoint between player and target
		return new Vector3((targetPos.x + playerPos.x) / 2, 0, (targetPos.z + playerPos.z) / 2);
	}

	/**
	 * Spawn arena environment (walls, grid, camera anchor)
	 */
	private spawnArena(center: Vector3, config: I_ArenaConfig): void {
		const gameObjects = this.context?.getService("gameObjectsManager");
		if (!gameObjects) {
			console.error("⚔️ [MatchModule] GameObjectManager not found");
			return;
		}

		this.walls = new MatchAreaWalls({
			id: "match-walls",
			center: { x: center.x, y: 0, z: center.z },
			width: config.width,
			depth: config.depth,
			height: config.height,
			showDebug: this.settings.debug.showPhysicsDebug,
		});

		this.grid = new MatchGrid({
			id: "match-grid",
			center: { x: center.x, y: 0, z: center.z },
			diameter: config.width,
			cellSize: 1,
		});

		const cameraPos = this.calculateCameraPosition(center);
		this.cameraAnchor = new MatchCameraAnchor({
			id: "match-camera-anchor",
			position: cameraPos,
		});

		gameObjects.register(this.walls);
		gameObjects.register(this.grid);
		gameObjects.register(this.cameraAnchor);
	}

	/**
	 * Destroy arena environment
	 */
	private destroyArena(): void {
		const gameObjects = this.context?.getService("gameObjectsManager");
		if (!gameObjects) return;

		if (this.walls) gameObjects.unregister(this.walls.id);
		if (this.grid) gameObjects.unregister(this.grid.id);
		if (this.cameraAnchor) gameObjects.unregister(this.cameraAnchor.id);

		this.walls = null;
		this.grid = null;
		this.cameraAnchor = null;
	}

	/**
	 * Calculate camera position based on arena center
	 * TODO: Derive from arena config in Phase 3
	 */
	private calculateCameraPosition(center: Vector3): { x: number; y: number; z: number } {
		return {
			x: center.x,
			y: 18,
			z: center.z + 18,
		};
	}

	/**
	 * Transition camera to fixed match view
	 */
	private transitionToMatchCamera(center: Vector3): void {
		const camera = this.context?.camera;
		if (!camera) {
			console.error("⚔️ [MatchModule] Camera not found");
			return;
		}

		const cameraPos = this.calculateCameraPosition(center);
		const lookAt = new Vector3(center.x, 2, center.z);

		// Disable mouse control immediately
		camera.controller.mouseRotationEnabled.value = false;

		// Animate to match position
		camera
			.changeTarget(
				lookAt,
				{
					angle: { horizontal: 0, vertical: Math.PI / 3 },
					distance: new Vector3(cameraPos.x, cameraPos.y, cameraPos.z).distanceTo(lookAt),
					fov: 75,
				},
				1000,
			)
			.then(() => {
				// Lock camera at exact position
				camera.instance.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
				camera.instance.lookAt(lookAt);
				camera.instance.updateMatrixWorld(true);
				camera.controller.freezeReactiveUpdates.value = true;
			});
	}

	/**
	 * Transition camera back to overworld (follow player)
	 */
	private transitionToOverworldCamera(): void {
		const camera = this.context?.camera;
		const character = this.context?.character;

		if (!camera || !character) {
			console.error("⚔️ [MatchModule] Camera or character not found");
			return;
		}

		// Unfreeze and reset
		camera.controller.followTarget = null;
		camera.controller.freezeReactiveUpdates.value = false;

		// Animate back to player
		camera.changeTarget(character.controller.getPosition(), CAMERA_PRESET_OVERWORLD, 1000);

		// Re-enable mouse control
		camera.controller.mouseRotationEnabled.value = true;
	}
}
