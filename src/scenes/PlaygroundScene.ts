import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { CharacterMeshModule } from '@/game/modules/scene/CharacterMeshModule';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { GroundModule } from '@/game/modules/scene/GroundModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { SceneInstancedObjectsModule } from '@/game/modules/scene/SceneInstancedObjectsModule';
import { SceneObjectsModule } from '@/game/modules/scene/SceneObjectsModule';
import { InteractionSystemModule } from '@/game/modules/entity/InteractionSystemModule';
import { watch } from 'vue';
import { I_GameScene, I_SceneConfig } from './scenes.types';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  ground: GroundModule;
  interaction: InteractionSystemModule;
  instancedSceneObjects: SceneInstancedObjectsModule;
  sceneObjects: SceneObjectsModule;
  treeTrunks: SceneInstancedObjectsModule;
  treeLeaves: SceneInstancedObjectsModule;
  bushes: SceneInstancedObjectsModule;
  debug: DebugModule;
  characterMesh: CharacterMeshModule;
}

export class PlaygroundScene extends GameScene<PlaygroundModuleRegistry> implements I_GameScene {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  // Unified interaction system (ONE instance for entire scene)

  // Scene object configurations
  private readonly sceneObjectConfigs: I_SceneObjectConfig[] = [
    // Themed obstacles (change color with theme) - INTERACTIVE
    {
      position: [5, 1, 0],
      scale: [2, 2, 2],
      geometry: { type: 'box', params: [1, 1, 1] },
      material: { useTheme: true, roughness: 0.8 },
      interactive: true, // ✨ Make this object clickable/hoverable
      interaction: {
        tooltip: {
          title: 'Themed Box',
          description: 'This box changes color with the theme!',
        },
      },
    },
    {
      position: [-8, 1.5, 5],
      scale: [3, 3, 2],
      geometry: { type: 'box', params: [1, 1, 1] },
      material: { useTheme: true, roughness: 0.8 },
      interactive: true, // ✨ Make this object clickable/hoverable
      interaction: {
        tooltip: {
          title: 'Another Themed Box',
          description: 'Click me!',
        },
      },
    },
    // Static colored obstacle (brown/wood color) - NOT INTERACTIVE
    {
      position: [0, 0.75, -10],
      scale: [4, 1.5, 1.5],
      geometry: { type: 'box', params: [1, 1, 1] },
      material: { staticColor: 0x8b4513, roughness: 0.9 }, // Brown
      interactive: false, // This object is NOT interactive
    },
  ];

  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start();
  }

  /**
   * Register scene-specific modules
   */
  protected registerModules(): void {
    this.addModule('interaction', new InteractionSystemModule());
    this.addModule('lighting', new LightingModule());
    this.addModule('ground', new GroundModule(this.settings));
    this.addModule('characterMesh', new CharacterMeshModule(this.settings, this.character.controller));
  }

  protected addSceneObjects() {
    this.addModule('instancedSceneObjects', new SceneInstancedObjectsModule(
      this.sceneObjectConfigs,
    ));

    // Unique interactive object (regular mesh) - use shared modules
    this.addModule('sceneObjects', new SceneObjectsModule([
      {
        position: [-3, 1, 3], // Different position - not overlapping with boxes
        geometry: { type: 'sphere', params: [0.5, 16, 16] },
        material: { staticColor: 0xff00ff, roughness: 0.2, metalness: 0.8 }, // Shiny pink sphere
        interactive: true,
        interaction: {
          tooltip: {
            title: 'Unique Sphere!',
            description: 'This is a regular Mesh, not instanced'
          }
        }
      },
    ]));

    // Tree trunks (brown cylinders) - instanced for performance (use shared modules)
    this.addModule('treeTrunks', new SceneInstancedObjectsModule([
      { position: [10, 0.75, 0], geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] }, material: { staticColor: 0x654321 } },
      { position: [12, 0.75, 2], geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] }, material: { staticColor: 0x654321 } },
      { position: [14, 0.75, -1], geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] }, material: { staticColor: 0x654321 } },
      { position: [10, 0.75, -3], geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] }, material: { staticColor: 0x654321 } },
      { position: [13, 0.75, -2], geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] }, material: { staticColor: 0x654321 } },
    ]));

    // Tree leaves (green cones) - instanced (use shared modules)
    this.addModule('treeLeaves', new SceneInstancedObjectsModule([
      { position: [10, 2, 0], geometry: { type: 'cone', params: [0.8, 1.5, 8] }, material: { staticColor: 0x228b22, roughness: 0.9 } },
      { position: [12, 2, 2], geometry: { type: 'cone', params: [0.8, 1.5, 8] }, material: { staticColor: 0x228b22, roughness: 0.9 } },
      { position: [14, 2, -1], geometry: { type: 'cone', params: [0.8, 1.5, 8] }, material: { staticColor: 0x228b22, roughness: 0.9 } },
      { position: [10, 2, -3], geometry: { type: 'cone', params: [0.8, 1.5, 8] }, material: { staticColor: 0x228b22, roughness: 0.9 } },
      { position: [13, 2, -2], geometry: { type: 'cone', params: [0.8, 1.5, 8] }, material: { staticColor: 0x228b22, roughness: 0.9 } },
    ]));

    // Bushes (green spheres) - instanced (use shared modules)
    this.addModule('bushes', new SceneInstancedObjectsModule([
      { position: [8, 0.3, 1], geometry: { type: 'sphere', params: [0.4, 8, 8] }, material: { staticColor: 0x2d5016, roughness: 1.0 } },
      { position: [11, 0.3, -1], geometry: { type: 'sphere', params: [0.4, 8, 8] }, material: { staticColor: 0x2d5016, roughness: 1.0 } },
      { position: [15, 0.3, 0], geometry: { type: 'sphere', params: [0.4, 8, 8] }, material: { staticColor: 0x2d5016, roughness: 1.0 } },
      { position: [9, 0.3, -4], geometry: { type: 'sphere', params: [0.4, 8, 8] }, material: { staticColor: 0x2d5016, roughness: 1.0 } },
    ]));

    this.addModule('debug', new DebugModule());
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
    this.lifecycle.watch(
      watch(
        () => this.settings.theme.currentTheme,
        () => {
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    this.lifecycle.watch(
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
    // Update scene objects (only themed ones will change)
    this.modules.instancedSceneObjects?.updateColors(this.settings.theme.primaryForeground);
    this.modules.sceneObjects?.updateColors(this.settings.theme.primaryForeground);

    this.modules.ground?.updateColors(this.settings.theme.background);

    // Update character mesh colors
    this.modules.characterMesh?.updateColors(
      this.settings.theme.primary,
      this.settings.theme.accent,
    );
  }
}
