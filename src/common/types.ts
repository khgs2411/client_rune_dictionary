import { useCamera } from '@/composables/useCamera';
import { Engine } from '@/core/Engine';
import { SceneLifecycle } from '@/core/SceneLifecycle';
import { Scene } from 'three';
import { Reactive, Ref } from 'vue';

export interface I_SceneConfig {
  engine: Engine;
}

export type TargetPosition = Reactive<{
  x: number;
  z: number;
  y: number;
}>;

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

export interface I_CharacterControlsOptions {
  cameraAngleH: Ref<number>;
}
export interface I_CameraControlsOptions {
  target?: TargetPosition;
}
export interface SceneModule {
  init(context: I_ModuleContext): void;
  update(delta: number): void;
  destroy(): void;
} // Context = everything a module might need

export interface I_ModuleContext {
  engine: Engine;
  scene: Scene;
  lifecycle: SceneLifecycle;
}
