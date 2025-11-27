import { CAMERA_PRESET_OVERWORLD } from '@/composables/composables.types';
import { I_SceneContext, I_SceneModule } from '@/game/common/scenes.types';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import SceneModule from '@/game/modules/SceneModule';
import { MatchAreaWalls } from '@/game/prefabs/MatchAreaWalls';
import { MatchCameraAnchor } from '@/game/prefabs/MatchCameraAnchor';
import { MatchGrid } from '@/game/prefabs/MatchGrid';
import { E_SceneState, type StateChangeCallback } from '@/game/services/SceneStateService';
import { DataStore } from '@/stores/DataStore';
import { Vector3 } from 'three';

/**
 * MatchModule - Lightweight match environment orchestrator
 *
 * **Responsibilities**:
 * 1. Subscribe to SceneStateService for state changes
 * 2. Spawn match environment on OVERWORLD → PVE_MATCH transition
 * 3. Destroy match environment on PVE_MATCH → OVERWORLD transition
 *
 * **Match Environment**:
 * - MatchAreaWalls: Ring of tall wall segments preventing match exit
 * - MatchGrid: Tactical grid overlay
 * - MatchCameraAnchor: Fixed camera position reference
 *
 * **Does NOT Handle**:
 * - Match creation API calls (MatchComponent)
 * - Movement/jumping limitation (KinematicMovementComponent)
 * - Mouse rotation control (useCameraMouseInput)
 * - State transitions (MatchComponent/MatchHUD)
 * - Combat logic (future system)
 *
 * **Usage**: register to PlaygroundScene module registry
 * ```typescript
 * this.registerModule('match', new MatchModule());
 * ```
 */
export class MatchModule extends SceneModule implements I_SceneModule {
  private walls: MatchAreaWalls | null = null;
  private grid: MatchGrid | null = null;
  private cameraAnchor: MatchCameraAnchor | null = null;
  private stateChangeCallback: StateChangeCallback | null = null;
  private settings = DataStore.settings;

  async init(context: I_SceneContext): Promise<void> {
    // Register with SceneStateService
    const stateService = context.getService('state');
    this.stateChangeCallback = this.onStateChange.bind(this);
    stateService.register(this.stateChangeCallback);
  }

  /**
   * React to scene state changes
   * - OVERWORLD → PVE_MATCH: Spawn match environment
   * - PVE_MATCH → OVERWORLD: Destroy match environment
   */
  private onStateChange(newState: E_SceneState, oldState: E_SceneState): void {
    if (newState === E_SceneState.PVE_MATCH && oldState !== E_SceneState.PVE_MATCH) {
      this.enterMatch();
    } else if (newState === E_SceneState.OVERWORLD && oldState === E_SceneState.PVE_MATCH) {
      this.exitMatch();
    }
  }

  /**
   * Spawn match environment (dome, grid, camera anchor)
   * Called when transitioning to PVE_MATCH state
   */
  private enterMatch(): void {
    if (!this.context) {
      console.error('⚔️ [MatchModule] Cannot enter match - no context');
      return;
    }

    if (!this.context.character) {
      console.error('⚔️ [MatchModule] Cannot enter match - no character');
      return;
    }

    const gameObjects = this.context.getService('gameObjectsManager');

    // FIXED ARENA CONFIGURATION
    // Arena is always centered at a fixed point and has a fixed size
    // This ensures consistent gameplay regardless of player/NPC starting positions

    // Option 1: Center arena at world origin (0, 0, 0)
    // Option 2: Center arena at NPC position (so NPC doesn't move)

    // Get NPC position to use as arena center
    const gameObject = DataStore.scene.getSavedGameObject();
    let arenaCenter: Vector3;

    if (gameObject) {
      const transform = gameObject.getComponent(TransformComponent);
      if (transform && transform.position) {
        arenaCenter = new Vector3(transform.position.x, 0, transform.position.z);
      } else {
        arenaCenter = new Vector3(0, 0, 0); // Fallback to world origin
        console.warn('⚔️ [MatchModule] Could not get NPC position, using world origin');
      }
    } else {
      arenaCenter = new Vector3(0, 0, 0); // Fallback to world origin
      console.warn('⚔️ [MatchModule] Training dummy not found, using world origin');
    }

    const centerX = arenaCenter.x;
    const centerZ = arenaCenter.z;
    const centerY = 0;

    // FIXED RECTANGULAR ARENA - wider than it is deep
    const arenaWidth = 40; // X axis (left-right)
    const arenaDepth = 25; // Z axis (near-far, shorter to fit in camera view)

    // Spawn match environment (4 walls forming a rectangle)
    this.walls = new MatchAreaWalls({
      id: 'match-walls',
      center: { x: centerX, y: centerY, z: centerZ },
      width: arenaWidth,
      depth: arenaDepth,
      height: 20, // Tall enough to prevent jumping over
      showDebug: this.settings.debug.showPhysicsDebug,
    });

    this.grid = new MatchGrid({
      id: 'match-grid',
      center: { x: centerX, y: centerY, z: centerZ },
      diameter: arenaWidth, // Use width for grid size
      cellSize: 1,
    });

    // FIXED CAMERA ANCHOR POSITION
    // Camera anchor is positioned to view the entire fixed arena
    // Diablo II style: lower camera, looking at slightly elevated center
    const cameraAnchorPos = {
      x: centerX,
      y: 18, // Lower camera height for better view
      z: centerZ + 18, // Distance behind arena center
    };

    this.cameraAnchor = new MatchCameraAnchor({
      id: 'match-camera-anchor',
      position: cameraAnchorPos,
    });

    // register to scene via GameObjectManager
    if (gameObjects) {
      gameObjects.register(this.walls);
      gameObjects.register(this.grid);
      gameObjects.register(this.cameraAnchor);
    } else {
      console.error('⚔️ [MatchModule] GameObjectManager not found');
    }

    // Trigger camera transition
    const camera = this.context.camera;
    if (!camera) {
      console.error('⚔️ [MatchModule] Camera not found in context');
      return;
    }

    // SMOOTH CAMERA TRANSITION to fixed match view
    // Look at a point slightly above ground for better framing
    const arenaLookAt = new Vector3(centerX, 2, centerZ); // Look 2 units above ground

    // Disable mouse rotation and zoom immediately
    camera.controller.mouseRotationEnabled.value = false;

    // Animate camera to the fixed match position
    // This will smoothly move from current position to the anchor
    camera
      .changeTarget(
        arenaLookAt, // Look at arena center
        {
          angle: {
            horizontal: 0,
            vertical: Math.PI / 3, // 60 degrees overhead
          },
          distance: new Vector3(cameraAnchorPos.x, cameraAnchorPos.y, cameraAnchorPos.z).distanceTo(
            arenaLookAt,
          ),
          fov: 75,
        },
        1000, // 1 second smooth transition
      )
      .then(() => {
        // After animation, manually set exact position (in case of rounding errors)
        camera.instance.position.set(cameraAnchorPos.x, cameraAnchorPos.y, cameraAnchorPos.z);
        camera.instance.lookAt(arenaLookAt);
        camera.instance.updateMatrixWorld(true);

        // Now freeze camera so it stays locked at this exact position
        camera.controller.freezeReactiveUpdates.value = true;
      });
  }

  /**
   * Destroy match environment (dome, grid, camera anchor)
   * Called when returning to OVERWORLD state
   */
  private exitMatch(): void {
    if (!this.context) {
      console.error('⚔️ [MatchModule] Cannot exit match - no context');
      return;
    }

    // Remove from scene via GameObjectManager
    const gameObjects = this.context.getService('gameObjectsManager');

    if (gameObjects) {
      if (this.walls) gameObjects.unregister(this.walls.id);
      if (this.grid) gameObjects.unregister(this.grid.id);
      if (this.cameraAnchor) gameObjects.unregister(this.cameraAnchor.id);
    }

    // Trigger camera return to player
    const camera = this.context.camera;
    const character = this.context.character;
    if (!camera) {
      console.error('⚔️ [MatchModule] Camera not found in context');
      return;
    }
    if (!character) {
      console.error('⚔️ [MatchModule] Character not found in context');
      return;
    }

    // Reset camera to follow the character again
    camera.controller.followTarget = null;

    // Unfreeze camera reactive updates BEFORE starting transition
    // This allows the camera to smoothly follow the character again
    camera.controller.freezeReactiveUpdates.value = false;

    camera
      .changeTarget(character.controller.getPosition(), CAMERA_PRESET_OVERWORLD, 1000)
      .then(() => {});

    // Re-enable mouse rotation and zoom
    camera.controller.mouseRotationEnabled.value = true;

    // Clear references
    this.walls = null;
    this.grid = null;
    this.cameraAnchor = null;
  }

  async destroy(): Promise<void> {
    // Unregister from SceneStateService
    if (this.stateChangeCallback && this.context) {
      const stateService = this.context.getService('state');
      stateService.unregister(this.stateChangeCallback);
    }

    // Clean up any remaining objects
    this.exitMatch();

    this.stateChangeCallback = null;
  }
}
