import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { watch } from 'vue';
import { I_SceneConfig } from '../game/common/scenes.types';

import { GameObject } from '@/game/GameObject';
import { DragComponent } from '@/game/components/interactions/DragComponent';
import { HoverComponent } from '@/game/components/interactions/HoverComponent';
import { PhysicsComponent } from '@/game/components/interactions/PhysicsComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { InstancedMeshComponent } from '@/game/components/rendering/InstancedMeshComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { PersistenceComponent } from '@/game/components/systems/PersistenceComponent';
import { MultiplayerModule } from '@/game/modules/networking/MultiplayerModule';
import { GameObjectsModule } from '@/game/modules/scene/GameObjectsModule';
import { Ground } from '@/game/prefabs/Ground';
import { LocalPlayer } from '@/game/prefabs/character/LocalPlayer';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  debug: DebugModule;
  gameObjectsManager: GameObjectsModule;
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
    this.addModule('gameObjectsManager', new GameObjectsModule());
    this.addModule('multiplayer', new MultiplayerModule('multiplayer', this.getModule('gameObjectsManager')!));
  }

  protected addSceneObjects() {
    // gameObjectsManager manager
    const gameObjectManager = this.getModule('gameObjectsManager')!;

    // Ground
    const ground = new Ground({ size: 200, showGrid: true });
    gameObjectManager.add(ground);

    // Editable box (native components, no prefab)
    const modelComponentBox = new GameObject({ id: 'modelComponent-editable-box' })
      .addComponent(new TransformComponent({ position: [5, 1, 5] }))
      .addComponent(new GeometryComponent({ type: 'box', params: [1.5, 1.5, 1.5] }))
      .addComponent(new MaterialComponent({ useTheme: true }))
      .addComponent(new MeshComponent())
      .addComponent(new PhysicsComponent({ type: 'static' }))
      .addComponent(
        new HoverComponent({
          tooltip: { title: 'modelComponent Box', description: 'Draggable in editor mode' },
        }),
      )
      .addComponent(
        new DragComponent({
          lockAxis: ['y'],
          snapToGrid: this.config.editor.snapToGrid,
          onEnd: (pos) => console.log('✅ modelComponent box dragged to:', pos),
        }),
      )
      .addComponent(new PersistenceComponent());

    // Tree trunks (instanced, native components)
    const treeTrunks = new GameObject({ id: 'tree-trunks' })
      .addComponent(new GeometryComponent({ type: 'cylinder', params: [0.15, 0.2, 1.5] }))
      .addComponent(new MaterialComponent({ color: 0x654321, roughness: 0.9 }))
      .addComponent(
        new InstancedMeshComponent({
          instances: [
            { position: [10, 0.75, 0] },
            { position: [12, 0.75, 2] },
            { position: [14, 0.75, -1] },
            { position: [10, 0.75, -3] },
            { position: [13, 0.75, -2] },
          ],
        }),
      )
      .addComponent(new PhysicsComponent({ type: 'static', shape: 'cylinder' }));

    // Tree leaves (instanced, native components)
    const treeLeaves = new GameObject({ id: 'tree-leaves' })
      .addComponent(new GeometryComponent({ type: 'cone', params: [0.8, 1.5, 8] }))
      .addComponent(new MaterialComponent({ color: 0x228b22, roughness: 0.9 }))
      .addComponent(
        new InstancedMeshComponent({
          instances: [
            { position: [10, 2, 0] },
            { position: [12, 2, 2] },
            { position: [14, 2, -1] },
            { position: [10, 2, -3] },
            { position: [13, 2, -2] },
          ],
        }),
      );

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

    gameObjectManager.add(modelComponentBox);
    gameObjectManager.add(treeTrunks);
    gameObjectManager.add(treeLeaves);
    gameObjectManager.add(bushes);



    // Create LocalPlayer GameObject (replaces CharacterModule)
    // Don't pass position config - let LocalPlayer read directly from controller
    const localPlayer = new LocalPlayer({
      playerId: 'local-player',
      characterController: this.character.controller,
    });

    gameObjectManager.add(localPlayer);
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

    // Update GameObjectManager (propagates to all gameObjectsManager with theme-aware components)
    this.getModule('gameObjectsManager')?.onThemeChange?.(theme);
  }
}
