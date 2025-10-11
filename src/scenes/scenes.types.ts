import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { Engine } from '@/game/Engine';
import { SceneLifecycle } from '@/game/SceneLifecycle';
import { SettingsStore } from '@/stores/settings.store';
import { Scene } from 'three';

export interface I_GameScene {
  readonly name: string;
  readonly camera: ReturnType<typeof useCamera>;
  readonly engine: Engine;

  /**
   * Initialize the scene (lights, objects, etc.)
   */
  start(): void;

  /**
   * Called every frame with delta time.
   */
  update(delta: number): void;

  /**
   * Clean up resources, remove event listeners, etc.
   */
  destroy(): void;
}

export interface I_SceneConfig {
  engine: Engine;
}

export interface I_SceneModule {
  start(context: I_ModuleContext): Promise<void>;
  update(delta: number): void;
  destroy(): Promise<void>;
}

export interface I_ThemedSceneModule extends I_SceneModule {
  updateColors(...args: any): void;
}

// Context = everything a module might need
export interface I_ModuleContext {
  engine: Engine;
  scene: Scene;
  lifecycle: SceneLifecycle;
  settings: SettingsStore;
  sceneName: string;
  camera?: ReturnType<typeof useCamera>; // Optional: for modules that need camera (interaction, etc.)
  character?: ReturnType<typeof useCharacter>; // Optional: for modules that need character (interaction, etc.)
}
