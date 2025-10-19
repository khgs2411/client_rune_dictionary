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
  maxActive?: number; // Max active spawned objects (default: unlimited)
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
 * - Active spawn tracking
 * - Max active limit enforcement
 * - Spawn data configuration
 * - Spawner service integration
 *
 * Subclasses implement the trigger mechanism (hotkey, click, collision, etc.)
 *
 * Priority: INTERACTION (300) - Spawning happens after physics/rendering
 */
export abstract class SpawnComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  protected config: I_SpawnConfig;
  protected context!: I_SceneContext;
  protected onCooldown = false;
  protected activeSpawns = new Set<string>(); // Track spawned object IDs

  constructor(config: I_SpawnConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;
  }

  /**
   * Attempt to spawn an object
   * Handles cooldown and max active checks
   *
   * @returns Spawned GameObject or null if spawn failed
   */
  protected trySpawn(): GameObject | null {
    // Check cooldown
    if (this.onCooldown) {
      console.log(`❄️ [SpawnComponent] Spawn blocked - on cooldown`);
      return null;
    }

    // Check max active limit
    if (this.config.maxActive !== undefined) {
      // Clean up despawned objects from tracking
      this.cleanupInactive();

      if (this.activeSpawns.size >= this.config.maxActive) {
        console.log(
          `🚫 [SpawnComponent] Spawn blocked - max active limit reached (${this.config.maxActive})`,
        );
        return null;
      }
    }

    // Get spawn data (custom or default)
    const spawnData = this.config.getSpawnData
      ? this.config.getSpawnData(this.gameObject)
      : this.getDefaultSpawnData();

    // Spawn via Spawner service
    const spawner = this.context.getService('spawner');
    const spawned = spawner.spawn(this.config.objectName, spawnData);

    // Track spawned object
    this.activeSpawns.add(spawned.id);

    // Callback
    if (this.config.onSpawn) {
      this.config.onSpawn(spawned, this.gameObject);
    }

    // Start cooldown
    this.startCooldown();

    console.log(
      `✨ [SpawnComponent] Spawned "${this.config.objectName}" (id: ${spawned.id}, active: ${this.activeSpawns.size})`,
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
   * Remove inactive spawns from tracking
   */
  protected cleanupInactive(): void {
    const spawner = this.context.getService('spawner');

    for (const id of this.activeSpawns) {
      if (!spawner.has(id)) {
        this.activeSpawns.delete(id);
      }
    }
  }

  /**
   * Get count of currently active spawned objects
   */
  public getActiveSpawnCount(): number {
    this.cleanupInactive();
    return this.activeSpawns.size;
  }

  /**
   * Check if on cooldown
   */
  public isCooldown(): boolean {
    return this.onCooldown;
  }

  destroy(): void {
    // Cleanup is automatic - spawned objects are managed by Spawner
    this.activeSpawns.clear();
  }
}
