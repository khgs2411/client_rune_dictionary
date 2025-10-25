import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { MatchModule } from '@/game/modules/scene/MatchModule';
import { watch } from 'vue';
import { I_SceneConfig } from '../game/common/scenes.types';

import { GameObject } from '@/game/GameObject';
import { ClickVFXComponent } from '@/game/components/interactions/ClickVFXComponent';
import { DragComponent } from '@/game/components/interactions/DragComponent';
import { HoverGlowComponent } from '@/game/components/interactions/HoverGlowComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { InstancedMeshComponent } from '@/game/components/rendering/InstancedMeshComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { MultiplayerModule } from '@/game/modules/networking/MultiplayerModule';
import { Fireball } from '@/game/prefabs/Fireball';
import { Ground } from '@/game/prefabs/Ground';
import { Trees } from '@/game/prefabs/Trees';
import { LocalPlayer } from '@/game/prefabs/character/LocalPlayer';
import { TrainingDummy } from '@/game/prefabs/npc/TrainingDummy';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  debug: DebugModule;
  match: MatchModule;
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
    this.addModule('match', new MatchModule());
  }

  protected addSceneObjects() {
    // Ground
    const ground = new Ground({ size: 200, showGrid: false });
    const gom = this.getService('gameObjectsManager');
    gom.register(ground);

    // Add environment objects
    this.addEnvironmentObjects();

    // Training Dummy NPC (for match creation testing)
    const trainingDummy = new TrainingDummy({
      id: 'training-dummy-1',
      type: "npc",
      position: [-5, 0.9, 5], // Positioned away from other objects
      color: 0xff0000, // Red (indicates enemy/NPC)
    });
    gom.register(trainingDummy);

    // ========================================
    // SPAWN SYSTEM DEMO
    // ========================================

    // Get spawner service
    const spawner = this.getService('spawner');

    // 1. PREFAB APPROACH - Register Fireball factory
    spawner.registerFactory(
      'fireball',
      (id, config) => {
        return new Fireball({ id, ...config });
      },
      {
        poolSize: 10, // Max 10 fireballs globally
        maxActivePerOwner: 5, // Max 5 per player
      },
    );

    // 2. MANUAL APPROACH - Register custom spawnable (non-prefab)
    spawner.registerFactory(
      'ice-shard',
      (id, config) => {
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
      },
      {
        poolSize: 20, // Max 20 ice shards globally
        maxActivePerOwner: 10, // Max 10 per player
      },
    );

    // Create LocalPlayer GameObject (replaces CharacterModule)
    // Don't pass position config - let LocalPlayer read directly from controller
    const localPlayer = new LocalPlayer({
      playerId: 'local-player',
      characterController: this.character.controller,
    });



    // Register player AFTER all components are added
    gom.register(localPlayer);

    console.log(`
🎯 [PlaygroundScene] Spawn system initialized:
- Press '1' to spawn Fireball (prefab)
- Right-click to spawn Ice Shard (manual) at cursor
    `);
  }

  private addEnvironmentObjects() {
    const gom = this.getService('gameObjectsManager');

    const interactiveBox = new GameObject({ id: 'interactive-box' })
      .addComponent(new TransformComponent({ position: [5, 1, 5] }))
      .addComponent(new GeometryComponent({ type: 'box', params: [1.5, 1.5, 1.5] }))
      .addComponent(new MaterialComponent({ color: 0xff1493, roughness: 0.8, metalness: 0.2 }))
      .addComponent(new MeshComponent())
      .addComponent(new HoverGlowComponent({
        glowColor: 0xff8c00,
        glowIntensity: 0.5,
        tooltip: { title: 'Interactive Box', description: 'Click for VFX, drag in editor mode' }
      }))
      .addComponent(new ClickVFXComponent({
        text: 'BOOM!',
        textColor: '#FF69B4',
        cameraShake: { intensity: 0.2, duration: 0.5 },
        particles: { count: 30, color: 0xff1493, speed: 4 }
      }))
      .addComponent(new DragComponent({
        lockAxis: ['y'],
        // snapToGrid omitted - will use live gameConfig.editor.snapToGrid value
        onDragEnd: (pos) => console.log('✅ Interactive box dragged to:', pos)
      }));

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
        })
      );

    gom.register(interactiveBox);
    gom.register(treeTrunks);
    gom.register(treeLeaves);
    gom.register(bushes);
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
