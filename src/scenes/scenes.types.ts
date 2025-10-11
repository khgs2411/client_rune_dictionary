import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { Engine } from '@/game/Engine';
import { InteractionEntityModule } from '@/game/modules/entity/InteractionEntityModule';
import { VisualFeedbackEntityModule } from '@/game/modules/entity/VisualFeedbackEntityModule';
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
  destroy(): Promise<void>;
}

export interface I_UpdateableModule extends I_SceneModule {
  update(delta: number, ...args: any[]): void;

}

export function IsUpdateableModule(module: any): module is I_UpdateableModule {
  return module.update && typeof module.update === 'function';
}

/**
 * Interface for modules that can have interaction capabilities injected
 * Used for dependency injection of shared InteractionEntityModule and VisualFeedbackEntityModule
 */
export interface I_InteractableModule extends I_SceneModule {
  interaction?: InteractionEntityModule;
  visualFeedback?: VisualFeedbackEntityModule;

  ownsInteraction: boolean; // Changed from `true` to `boolean` for flexibility

  setInteractionEntityModule(interaction: InteractionEntityModule, feedback?: VisualFeedbackEntityModule): void;

}

export function IsInteractableModule(module: any): module is I_InteractableModule {
  return module.ownsInteraction !== null && module.ownsInteraction !== undefined;
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
