import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import type {
  I_PlayerPositionUpdate,
  I_RemotePlayerConfig,
} from '@/game/common/multiplayer.types';
import { I_SceneContext } from '@/game/common/scenes.types';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { Euler, Vector3 } from 'three';

/**
 * RemotePlayerComponent - Interpolates other players' movement
 *
 * This component:
 * - Receives position updates from server via MultiplayerService
 * - Smoothly interpolates between received positions (no jitter)
 * - Uses dead reckoning to predict movement between updates
 * - Handles both position and rotation (optional)
 *
 * Usage:
 * ```typescript
 * // Server sends list of players in area
 * onPlayerList(players) {
 *   players.forEach(player => {
 *     const remotePlayer = new GameObject({ id: player.id })
 *       .addComponent(new TransformComponent({ position: player.position }))
 *       .addComponent(new GeometryComponent({ type: 'capsule', params: [0.3, 1.8] }))
 *       .addComponent(new MaterialComponent({ color: 0x00ff00 }))
 *       .addComponent(new MeshComponent())
 *       .addComponent(new RemotePlayerComponent({
 *         playerId: player.id,
 *         username: player.username,
 *       }));
 *
 *     gameObjects.add(remotePlayer);
 *   });
 * }
 * ```
 *
 * Dependencies:
 * - Requires TransformComponent
 * - Requires MultiplayerService in scene services
 */
export class RemotePlayerComponent extends GameComponent {
  public readonly priority = ComponentPriority.DEFAULT;

  private playerId: string;
  private username: string;
  private interpolationSpeed: number;

  // Interpolation state
  private currentPosition = new Vector3();
  private targetPosition = new Vector3();
  private velocity = new Vector3();
  private currentRotation = new Euler();
  private targetRotation = new Euler();

  // Timing
  private lastUpdateTime = 0;
  private timeSinceLastUpdate = 0;

  private context: I_SceneContext | null = null;

  constructor(config: I_RemotePlayerConfig) {
    super();

    this.playerId = config.playerId;
    this.username = config.username;
    this.interpolationSpeed = config.interpolationSpeed ?? 0.1; // Default: smooth lerp

    // Set initial position if provided
    if (config.initialPosition) {
      this.currentPosition.set(...config.initialPosition);
      this.targetPosition.set(...config.initialPosition);
    }
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;

    // Verify TransformComponent exists
    const transform = this.requireComponent(TransformComponent);

    // Initialize current position from transform
    this.currentPosition.copy(transform.position);
    this.targetPosition.copy(transform.position);
    this.currentRotation.copy(transform.rotation);
    this.targetRotation.copy(transform.rotation);

    console.log(
      `👤 [RemotePlayerComponent] Initialized for player: ${this.username} (${this.playerId})`,
    );
  }

  update(delta: number): void {
    if (!this.context) return;

    const transform = this.getComponent(TransformComponent);
    if (!transform) return;

    this.timeSinceLastUpdate += delta;

    // Interpolate toward target position
    this.currentPosition.lerp(this.targetPosition, this.interpolationSpeed);

    // Dead reckoning: Predict future position based on velocity
    // This smooths movement between updates
    if (this.velocity.lengthSq() > 0.001) {
      // Only apply if moving
      const predicted = this.velocity.clone().multiplyScalar(delta);
      this.currentPosition.add(predicted);
    }

    // Interpolate rotation (if changed)
    if (this.currentRotation.equals(this.targetRotation) === false) {
      // Smooth rotation interpolation
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.interpolationSpeed;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.interpolationSpeed;
      this.currentRotation.z += (this.targetRotation.z - this.currentRotation.z) * this.interpolationSpeed;
    }

    // Apply to transform
    transform.position.copy(this.currentPosition);
    transform.rotation.copy(this.currentRotation);
  }

  destroy(): void {
    // Unregister from multiplayer service

    console.log(
      `👤 [RemotePlayerComponent] Destroyed for player: ${this.username} (${this.playerId})`,
    );
  }

  /**
   * Handle position update from server
   * Updates target position and calculates velocity for dead reckoning
   */
  public updatePosition(data: I_PlayerPositionUpdate): void {
    const newPosition = new Vector3(data.position.x, data.position.y, data.position.z);

    // Calculate velocity for dead reckoning
    const timeDelta = (data.timestamp - this.lastUpdateTime) / 1000; // Convert to seconds
    if (timeDelta > 0) {
      this.velocity.subVectors(newPosition, this.targetPosition).divideScalar(timeDelta);
    }

    // Update target position
    this.targetPosition.copy(newPosition);

    // Update rotation if provided
    if (data.rotation) {
      this.targetRotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    }

    // Update timing
    this.lastUpdateTime = data.timestamp;
    this.timeSinceLastUpdate = 0;
  };

  /**
   * Teleport player to new position (no interpolation)
   * Useful for respawns, scene transitions
   */
  public teleport(position: Vector3): void {
    this.currentPosition.copy(position);
    this.targetPosition.copy(position);
    this.velocity.set(0, 0, 0);

    const transform = this.getComponent(TransformComponent);
    if (transform) {
      transform.position.copy(position);
    }
  }

  /**
   * Change interpolation speed at runtime
   * Lower = smoother but more lag, Higher = responsive but jittery
   */
  public setInterpolationSpeed(speed: number): void {
    this.interpolationSpeed = Math.max(0.01, Math.min(1, speed)); // Clamp 0.01-1
  }

  /**
   * Get player username
   */
  public getUsername(): string {
    return this.username;
  }

  /**
   * Get current velocity (useful for animations)
   */
  public getVelocity(): Vector3 {
    return this.velocity.clone();
  }

  /**
   * Check if player is moving (useful for animation states)
   */
  public isMoving(): boolean {
    return this.velocity.lengthSq() > 0.01; // Threshold for "moving"
  }

  /**
   * Get time since last update from server (useful for detecting disconnected players)
   */
  public getTimeSinceLastUpdate(): number {
    return this.timeSinceLastUpdate;
  }
}
