import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { CharacterMeshModule } from '@/game/modules/scene/CharacterMeshModule';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { GroundModule } from '@/game/modules/scene/GroundModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { SceneObjectsModule, } from '@/game/modules/scene/SceneObjectsModule';
import { watch } from 'vue';
import { I_GameScene, I_SceneConfig } from './scenes.types';
import { I_SceneObjectConfig } from '@/data/sceneObjectConfig.dto';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry {
  lighting: LightingModule;
  ground: GroundModule;
  sceneObjects: SceneObjectsModule;
  debug: DebugModule;
  characterMesh: CharacterMeshModule;
}

export class PlaygroundScene extends GameScene<PlaygroundModuleRegistry> implements I_GameScene {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  // Scene object configurations
  private readonly sceneObjectConfigs: I_SceneObjectConfig[] = [
    // Themed obstacles (change color with theme)
    {
      position: [5, 1, 0],
      scale: [2, 2, 2],
      geometry: { type: 'box', params: [1, 1, 1] },
      material: { useTheme: true, roughness: 0.8 },
    },
    {
      position: [-8, 1.5, 5],
      scale: [3, 3, 2],
      geometry: { type: 'box', params: [1, 1, 1] },
      material: { useTheme: true, roughness: 0.8 },
    },
    // Static colored obstacle (brown/wood color)
    {
      position: [0, 0.75, -10],
      scale: [4, 1.5, 1.5],
      geometry: { type: 'box', params: [1, 1, 1] },
      material: { staticColor: 0x8b4513, roughness: 0.9 }, // Brown
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
    this.addModule('lighting', new LightingModule());
    this.addModule('ground', new GroundModule(this.settings));
    this.addModule('sceneObjects', new SceneObjectsModule(this.sceneObjectConfigs));
    this.addModule('debug', new DebugModule());
    this.addModule(
      'characterMesh',
      new CharacterMeshModule(this.settings, this.character.controller),
    );
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
  }

  private updateMaterialColors(): void {
    // Update scene objects (only themed ones will change)
    this.modules.sceneObjects?.updateColors(this.settings.theme.primaryForeground);

    // Update character mesh colors
    this.modules.characterMesh?.updateColors(
      this.settings.theme.primary,
      this.settings.theme.accent,
    );
  }
}
