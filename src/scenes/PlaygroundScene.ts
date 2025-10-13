import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { CharacterModule } from '@/game/modules/scene/CharacterModule';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { SceneInstancedObjectsModule } from '@/game/modules/scene/SceneInstancedObjectsModule';
import { SceneObjectsModule } from '@/game/modules/scene/SceneObjectsModule';
import { watch } from 'vue';
import { I_SceneConfig } from '../game/common/scenes.types';
import { Vector3 } from 'three';
import { Lib } from 'topsyde-utils';

// ECS imports
import { GameObjectManager } from '@/game/services/GameObjectManager';
import { GameObject } from '@/game/GameObject';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { InstancedMeshComponent } from '@/game/components/rendering/InstancedMeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { PhysicsComponent } from '@/game/components/interactions/PhysicsComponent';
import { DragComponent } from '@/game/components/interactions/DragComponent';
import { HoverComponent } from '@/game/components/interactions/HoverComponent';
import { PersistenceComponent } from '@/game/components/systems/PersistenceComponent';
import { GridHelperComponent } from '@/game/components/rendering/GridHelperComponent';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  instancedSceneObjects: SceneInstancedObjectsModule;
  sceneObjects: SceneObjectsModule;
  debug: DebugModule;
  characterMesh: CharacterModule;
  gameObjects: GameObjectManager; // ECS GameObject manager
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
    this.addModule(
      'instancedSceneObjects',
      new SceneInstancedObjectsModule([
        {
          position: [5, 1, 0],
          scale: [2, 2, 2],
          geometry: { type: 'box', params: [1, 1, 1] },
          material: { useTheme: true, roughness: 0.8 },
        },
        {
          position: [8, 1, 5],
          scale: [3, 3, 2],
          geometry: { type: 'box', params: [1, 1, 1] },
          material: { useTheme: true, roughness: 0.8 },
        },
        {
          position: [0, 1, -10],
          scale: [4, 1.5, 1.5],
          geometry: { type: 'box', params: [1, 1, 1] },
          material: { staticColor: 0x8b4513, roughness: 0.9 }, // Brown
        },
      ]),
    );

    // Unique interactive object (regular mesh) - use shared modules
    this.addModule(
      'sceneObjects',
      new SceneObjectsModule([
        {
          position: [-3, 1, 3], // Different position - not overlapping with boxes
          geometry: { type: 'box', params: [2, 2, 2] }, // Increased segments for better raycast detection
          material: { staticColor: 0xff00ff, roughness: 0.2, metalness: 0.8 }, // Shiny pink sphere
          interactive: true,
          interaction: {
            // HOVER: Glow + tooltip
            hover: {
              glow: {
                color: 0xff8c00,
                intensity: () => this.config.interaction.hoverGlowIntensity,
              },
              tooltip: {
                title: 'Draggable Box',
                description: 'Enable editor mode to drag me!',
              },
            },

            // CLICK: VFX + shake (disabled in editor mode)
            click: {
              vfx: { text: 'POW!', color: '#ff00ff' },
              shake: {
                intensity: () => this.config.interaction.cameraShakeIntensity,
                duration: 0.5,
              },
            },

            // DRAG: Lock Y axis, snap to grid (only works in editor mode)
            drag: {
              enabled: true,
              lockAxis: ['y'], // Keep at same height
              snapToGrid: this.config.editor.snapToGrid, // Snap to 0.5 unit grid
              customCallbacks: {
                onStart: (pos) => {
                  console.log('🎯 Started dragging box from:', pos);
                },
                onEnd: (pos) => {
                  console.log('✅ Finished dragging box to:', pos);
                  this.storeObjectPosition('sceneObjects', pos);
                },
              },
            },
          },
        },
      ]),
    );


    this.addModule('debug', new DebugModule());

    // ECS GameObjects
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
          color: this.settings.theme.background,
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
    const ecsBox = new GameObject({ id: 'ecs-editable-box' })
      .addComponent(new TransformComponent({ position: [5, 1, 5] }))
      .addComponent(new GeometryComponent({ type: 'box', params: [1.5, 1.5, 1.5] }))
      .addComponent(new MaterialComponent({ color: 0x00ff00 }))
      .addComponent(new MeshComponent())
      .addComponent(new PhysicsComponent({ type: 'static' }))
      .addComponent(
        new HoverComponent({
          tooltip: { title: 'ECS Box', description: 'Draggable in editor mode' },
        }),
      )
      .addComponent(
        new DragComponent({
          lockAxis: ['y'],
          snapToGrid: this.config.editor.snapToGrid,
          onEnd: (pos) => console.log('✅ ECS box dragged to:', pos),
        }),
      )
      .addComponent(new PersistenceComponent());
    gameObjectManager.add(ecsBox);

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
    this.setLifecycleWatchers();
  }

  private setLifecycleWatchers(): void {
    // Watch for theme changes (color theme: neutral, rose, blue, etc.)
    this.cleanupRegistry.watch(
      watch(
        () => this.settings.theme.currentTheme,
        () => {
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    this.cleanupRegistry.watch(
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

    // TODO: Add theme support for ECS GameObjects
    // GameObjects (ground, trees, bushes, etc.) should respond to theme changes
    // via MaterialComponent or a ThemeComponent
  }
}
