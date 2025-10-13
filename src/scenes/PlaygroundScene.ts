import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { CharacterModule } from '@/game/modules/scene/CharacterModule';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { Vector3 } from 'three';
import { watch } from 'vue';
import { I_SceneConfig } from '../game/common/scenes.types';

import { GameObject } from '@/game/GameObject';
import { DragComponent } from '@/game/components/interactions/DragComponent';
import { HoverComponent } from '@/game/components/interactions/HoverComponent';
import { PhysicsComponent } from '@/game/components/interactions/PhysicsComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { GridHelperComponent } from '@/game/components/rendering/GridHelperComponent';
import { InstancedMeshComponent } from '@/game/components/rendering/InstancedMeshComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { PersistenceComponent } from '@/game/components/systems/PersistenceComponent';
import { GameObjectManager } from '@/game/services/GameObjectManager';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  debug: DebugModule;
  characterMesh: CharacterModule;
  gameObjects: GameObjectManager; 
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
   * Note: No need to register InteractionSystemModule - it's now a service!
   */
  protected registerModules(): void {
    this.addModule('lighting', new LightingModule());
    this.addModule('characterMesh', new CharacterModule(this.character.controller));
    this.addModule('gameObjects', new GameObjectManager());
  }

  protected addSceneObjects() {

    // GameObjects manager
    const gameObjectManager = this.getModule('gameObjects')!;

    // Ground GameObject (native components, no prefab)
    const ground = new GameObject({ id: 'ground' })
      .addComponent(
        new TransformComponent({
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0], // Rotate to horizontal
        }),
      )
      .addComponent(new GeometryComponent({ type: 'plane', params: [100, 100] }))
      .addComponent(
        new MaterialComponent({
          color: this.settings.theme.palette.dark.hex,
          roughness: 0.8,
          metalness: 0,
        }),
      )
      .addComponent(new MeshComponent({ castShadow: false, receiveShadow: true }))
      .addComponent(
        new GridHelperComponent({
          size: 100,
          divisions: 50,
          centerColor: 0x444444,
          gridColor: 0x888888,
        }),
      )
      .addComponent(new PhysicsComponent({ type: 'static', shape: 'cuboid' }));
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
    gameObjectManager.add(modelComponentBox);

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
    gameObjectManager.add(treeTrunks);

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
    gameObjectManager.add(treeLeaves);

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
    gameObjectManager.add(bushes);
  }

  private storeObjectPosition(objectKey: string, pos: Vector3) {
    // Update physics collider to match new position
    // ID format: scene-object-{moduleId}-{index}
    const module = this.getModule(objectKey);
    if (module) {
      const objectId = `scene-object-${(module as any).id}-0`;

      // Update physics
      if (this.services.physics.isReady()) {
        this.services.physics.updateStaticBodyPosition(objectId, pos);
        console.log(`🔄 Updated physics body: ${objectId}`);
      }

      // Save position to store
      this.store.saveObjectPosition(this.name, objectId, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
      });
    }
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


    // Update all modules with the same unified API
    this.getModule('instancedSceneObjects')?.onThemeChange?.(theme);
    this.getModule('sceneObjects')?.onThemeChange?.(theme);
    this.getModule('characterMesh')?.onThemeChange?.(theme);
    this.getModule('gameObjects')?.onThemeChange?.(theme);

    // TODO: Add theme support for modelComponent GameObjects
    // GameObjects (ground, trees, bushes, etc.) should respond to theme changes
    // via MaterialComponent or a ThemeComponent
  }
}
