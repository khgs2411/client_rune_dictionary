import { useCamera } from '@/composables/useCamera';
import { useCharacter } from '@/composables/useCharacter';
import { Engine } from '@/game/Engine';
import { InteractionSystemModule } from '@/game/modules/entity/InteractionSystemModule';
import { SceneLifecycle } from '@/game/SceneLifecycle';
import { SettingsStore } from '@/stores/settings.store';
import { Object3D, Scene } from 'three';
import type { I_InteractionEntityConfig } from '@/game/modules/entity/interaction.types';

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
 * Used for dependency injection of shared InteractionSystemModule
 *
 * Modules implementing this interface can:
 * - Declare which objects are interactable
 * - Automatically register those objects with the interaction system
 */
export interface I_InteractableModule extends I_SceneModule {
  /**
   * Set the interaction system and auto-register all interactable objects
   */
  setInteractionSystem(system: InteractionSystemModule): void;
  clearInteractionSystem(system: InteractionSystemModule): void;

  /**
   * Get all interactable objects from this module
   * Called by setInteractionSystem to auto-register objects
   */
  getInteractableObjects(): Array<{
    id: string;
    object: Object3D;
    config: I_InteractionEntityConfig;
  }>;
}

export function IsInteractableModule(module: any): module is I_InteractableModule {
  return typeof module.setInteractionSystem === 'function' && typeof module.getInteractableObjects === 'function' && typeof module.clearInteractionSystem === 'function';
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
