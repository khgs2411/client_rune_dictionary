import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { watch } from 'vue';
import { I_SceneConfig } from '../game/common/scenes.types';

import { GameObject } from '@/game/GameObject';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { InstancedMeshComponent } from '@/game/components/rendering/InstancedMeshComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { ClickSpawnComponent } from '@/game/components/spawning/ClickSpawnComponent';
import { HotkeySpawnComponent } from '@/game/components/spawning/HotkeySpawnComponent';
import { MultiplayerModule } from '@/game/modules/networking/MultiplayerModule';
import { EditableBox } from '@/game/prefabs/EditableBox';
import { Fireball } from '@/game/prefabs/Fireball';
import { Ground } from '@/game/prefabs/Ground';
import { Trees } from '@/game/prefabs/Trees';
import { LocalPlayer } from '@/game/prefabs/character/LocalPlayer';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  debug: DebugModule;
}

export class PlaygroundScene extends GameScene<PlaygroundModuleRegistry> {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;


  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start();
  }

  /**
   * Register scene-specific modules
   */
  protected registerModules(): void {
    this.addModule('lighting', new LightingModule());
    this.addModule('multiplayer', new MultiplayerModule());
  }

  protected addSceneObjects() {
    // Ground
    const ground = new Ground({ size: 200, showGrid: true });
    const gom = this.getService('gameObjectsManager');
    gom.register(ground);

    // Editable box (using prefab)
    const modelComponentBox = new EditableBox({
      id: 'modelComponent-editable-box',
      position: [5, 1, 5],
      size: [1.5, 1.5, 1.5],
      useTheme: true,
      snapToGrid: this.config.editor.snapToGrid,
      tooltip: { title: 'modelComponent Box', description: 'Draggable in editor mode' },
      onDragEnd: (pos) => console.log('✅ modelComponent box dragged to:', pos),
    });

    // Trees (using prefab)
    const [treeTrunks, treeLeaves] = Trees.create({
      positions: [
        { x: 10, y: 0, z: 0 },
        { x: 12, y: 0, z: 2 },
        { x: 14, y: 0, z: -1 },
        { x: 10, y: 0, z: -3 },
        { x: 13, y: 0, z: -2 },
      ],
    });

    // Bushes (instanced, native components)
    const bushes = new GameObject({ id: 'bushes' })
      .addComponent(new GeometryComponent({ type: 'sphere', params: [0.4, 8, 8] }))
      .addComponent(new MaterialComponent({ color: 0x2d5016, roughness: 1.0 }))
      .addComponent(
        new InstancedMeshComponent({
          instances: [
            { position: [8, 0.3, 1] },
            { position: [11, 0.3, -1] },
            { position: [15, 0.3, 0] },
            { position: [9, 0.3, -4] },
          ],
        }),
      );

    gom.register(modelComponentBox);
    gom.register(treeTrunks);
    gom.register(treeLeaves);
    gom.register(bushes);



    // ========================================
    // SPAWN SYSTEM DEMO
    // ========================================

    // Get spawner service
    const spawner = this.getService('spawner');

    // 1. PREFAB APPROACH - Register Fireball factory
    spawner.registerFactory('fireball', (id, config) => {
      return new Fireball({ id, ...config });
    });

    // 2. MANUAL APPROACH - Register custom spawnable (non-prefab)
    spawner.registerFactory('ice-shard', (id, config) => {
      const iceShard = new GameObject({ id })
        .addComponent(
          new TransformComponent({
            position: config.position || [0, 1, 0],
          }),
        )
        .addComponent(
          new GeometryComponent({
            type: 'cone',
            params: [0.2, 0.8, 8], // Sharp cone for ice shard
          }),
        )
        .addComponent(
          new MaterialComponent({
            color: 0x00bfff, // Deep sky blue
            emissive: 0x00bfff,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.8,
          }),
        )
        .addComponent(new MeshComponent());

      // TODO: Add TrajectoryComponent and CollisionComponent once implemented

      return iceShard;
    });

    // Create LocalPlayer GameObject (replaces CharacterModule)
    // Don't pass position config - let LocalPlayer read directly from controller
    const localPlayer = new LocalPlayer({
      playerId: 'local-player',
      characterController: this.character.controller,
    });

    // Add spawn trigger components to player BEFORE registration
    localPlayer.addComponent(
      new HotkeySpawnComponent({
        key: '1',
        objectName: 'fireball',
        getSpawnData: (owner) => {
          const transform = owner.getComponent(TransformComponent);
          if (!transform) return {};

          // Get forward direction from player rotation
          const forward = transform.forward;

          return {
            position: [
              transform.position.x + forward.x,
              transform.position.y + 1,
              transform.position.z + forward.z,
            ],
            direction: [forward.x, 0.1, forward.z], // Slight upward arc
            velocity: 15,
          };
        },
        onSpawn: (spawned, owner) => {
          console.log(`🔥 [PlaygroundScene] ${owner.id} spawned ${spawned.id}`);
        },
      }),
    );

    localPlayer.addComponent(
      new ClickSpawnComponent({
        button: 'right',
        objectName: 'ice-shard',
        cooldown: 500, // 0.5 second cooldown
        spawnAtCursor: true,
        spawnHeight: 1,
        getSpawnData: (owner) => {
          const transform = owner.getComponent(TransformComponent);
          return {
            direction: [0, -1, 0], // Downward
            velocity: 5,
          };
        },
        onSpawn: (spawned, owner) => {
          console.log(`❄️  [PlaygroundScene] ${owner.id} spawned ${spawned.id} at cursor`);
        },
      }),
    );

    // Register player AFTER all components are added
    gom.register(localPlayer);

    console.log(`
🎯 [PlaygroundScene] Spawn system initialized:
- Press '1' to spawn Fireball (prefab)
- Right-click to spawn Ice Shard (manual) at cursor
    `);
  }

  /**
   * Add scene-specific setup (theme watchers)
   */
  protected finalizeSetup(): void {
    super.finalizeSetup();
    this.setWatchers();
  }

  private setWatchers(): void {
    // Watch for theme changes (color theme: neutral, rose, blue, etc.)
    this.cleanupRegistry.registerWatcher(
      watch(
        () => this.settings.theme.currentTheme,
        () => {
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    this.cleanupRegistry.registerWatcher(
      watch(
        () => this.settings.theme.colorMode,
        () => {
          console.log('🌗 [PlaygroundScene] Dark mode toggled, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );
  }

  private updateMaterialColors(): void {
    // Build theme colors object from settings
    const theme: I_ThemeColors = {
      primary: this.settings.theme.primary,
      primaryForeground: this.settings.theme.primaryForeground,
      accent: this.settings.theme.accent,
      accentForeground: this.settings.theme.accentForeground,
      background: this.settings.theme.background,
      foreground: this.settings.theme.foreground,
      muted: this.settings.theme.muted,
      card: this.settings.theme.card,
      border: this.settings.theme.border,
    };

    this.getService('gameObjectsManager').onThemeChange(theme);
  }
}
