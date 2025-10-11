
import { SettingsStore } from '@/common/types';
import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/scenes/BaseScene';
import { CharacterMeshModule } from '@/game/modules/CharacterMeshModule';
import { DebugModule } from '@/game/modules/DebugModule';
import { GroundModule } from '@/game/modules/GroundModule';
import { LightingModule } from '@/game/modules/LightingModule';
import { SceneObjectsModule, type SceneObjectConfig } from '@/game/modules/SceneObjectsModule';
import { useSettingsStore } from '@/stores/settings.store';
import { watch } from 'vue';
import { I_GameScene, I_ModuleContext, I_SceneConfig } from './scenes.types';

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

  private settings!: SettingsStore;

  // High-level entity composables
  public camera!: ReturnType<typeof useCamera>;
  private character!: ReturnType<typeof useCharacter>;

  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start();
  }

  public start(): void {
    console.log('🎬 [PlaygroundScene] Initializing scene...');

    this.settings = useSettingsStore();

    this.camera = useCamera();

    this.character = useCharacter({
      cameraAngleH: this.camera.controller.angle.horizontal,
    });

    // Build module context
    const context: I_ModuleContext = {
      engine: this.engine,
      scene: this.engine.scene,
      lifecycle: this.lifecycle,
      settings: this.settings,
    };

    // Configure scene objects (obstacles, props, environment, etc.)
    const sceneObjectConfigs: SceneObjectConfig[] = [
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

    // Register modules (type-safe!)
    this.addModule('lighting', new LightingModule());
    this.addModule('ground', new GroundModule(this.settings));
    this.addModule('sceneObjects', new SceneObjectsModule(sceneObjectConfigs));
    this.addModule('debug', new DebugModule());
    this.addModule('characterMesh', new CharacterMeshModule(this.settings, this.character.controller));

    // Init all modules
    this.forEachModule((m) => m.start(context));

    this.setLifecycleWatchers();

    this.camera.start();

    console.log('✅ [PlaygroundScene] Scene initialization complete');
  }

  update(delta: number): void {
    // Update Vue composables
    this.character.update(delta);

    // Update camera lookAt target
    this.camera.update(this.character.controller.getPosition());

    // Update modules (character mesh sync happens in module)
    this.forEachModule((m) => m.update(delta));
  }

  destroy(): void {
    console.log('🧹 [PlaygroundScene] Starting scene cleanup...');

    this.character.destroy();

    this.camera.destroy();

    this.forEachModule((m) => m.destroy());

    this.lifecycle.cleanup(this.engine.scene);

    console.log('✅ [PlaygroundScene] Scene cleanup complete');
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
      this.settings.theme.accent
    );
  }
}
