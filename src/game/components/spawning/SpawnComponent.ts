import type { I_SceneContext } from '@/game/common/scenes.types';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import type { GameObject } from '@/game/GameObject';
import type { Vector3Like } from 'three';

/**
 * Configuration for spawning objects
 */
export interface I_SpawnConfig {
  objectName: string; // Registered spawn type (e.g., 'fireball', 'bullet')
  cooldown?: number; // Cooldown in milliseconds (default: 0)
  getSpawnData?: (owner: GameObject) => I_SpawnData; // Custom spawn data provider
  onSpawn?: (spawned: GameObject, owner: GameObject) => void; // Callback after spawn
  onCooldownStart?: () => void; // Callback when cooldown starts
  onCooldownEnd?: () => void; // Callback when cooldown ends
}

/**
 * Data passed to spawner when creating object
 */
export interface I_SpawnData {
  position?: Vector3Like | [number, number, number]; // Spawn position
  direction?: Vector3Like | [number, number, number]; // Initial direction
  velocity?: number; // Initial velocity
  [key: string]: any; // Additional custom data
}

/**
 * Base SpawnComponent - Shared functionality for all spawn triggers
 *
 * Provides:
 * - Cooldown management
 * - Spawn data configuration
 * - Spawner service integration
 * - Owner ID passing (for per-owner spawn limits in Spawner)
 *
 * Subclasses implement the trigger mechanism (hotkey, click, collision, etc.)
 * Limit enforcement is handled by Spawner service (poolSize and maxActivePerOwner)
 *
 * Priority: INTERACTION (300) - Spawning happens after physics/rendering
 */
export abstract class SpawnComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  protected config: I_SpawnConfig;
  protected context!: I_SceneContext;
  protected onCooldown = false;

  constructor(config: I_SpawnConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;
  }

  /**
   * Attempt to spawn an object
   * Handles cooldown check, delegates limit checking to Spawner service
   *
   * @returns Spawned GameObject or null if spawn failed
   */
  protected trySpawn(): GameObject | null {
    // Check cooldown
    if (this.onCooldown) {
      console.log(`❄️ [SpawnComponent] Spawn blocked - on cooldown`);
      return null;
    }

    // Get spawn data (custom or default)
    const spawnData = this.config.getSpawnData
      ? this.config.getSpawnData(this.gameObject)
      : this.getDefaultSpawnData();

    // Spawn via Spawner service (pass owner ID for per-owner limits)
    const spawner = this.context.getService('spawner');
    const spawned = spawner.spawn(this.config.objectName, this.gameObject.id, spawnData);

    // Spawn may return null if limits reached
    if (!spawned) {
      return null;
    }

    // Callback
    if (this.config.onSpawn) {
      this.config.onSpawn(spawned, this.gameObject);
    }

    // Start cooldown
    this.startCooldown();

    console.log(
      `✨ [SpawnComponent] Owner "${this.gameObject.id}" spawned "${this.config.objectName}" (id: ${spawned.id})`,
    );

    return spawned;
  }

  /**
   * Default spawn data (position at owner's location)
   * Subclasses can override or use config.getSpawnData
   */
  protected getDefaultSpawnData(): I_SpawnData {
    const transform = this.gameObject.getComponent(TransformComponent);
    return {
      position: transform ? transform.position.clone() : { x: 0, y: 0, z: 0 },
    };
  }

  /**
   * Start cooldown timer
   */
  protected startCooldown(): void {
    const cooldownMs = this.config.cooldown ?? 0;
    if (cooldownMs === 0) return;

    this.onCooldown = true;
    this.config.onCooldownStart?.();

    setTimeout(() => {
      this.onCooldown = false;
      this.config.onCooldownEnd?.();
    }, cooldownMs);
  }

  /**
   * Check if on cooldown
   */
  public isCooldown(): boolean {
    return this.onCooldown;
  }

  destroy(): void {
    // Cleanup is automatic - spawned objects are managed by Spawner
  }
}
