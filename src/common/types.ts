import { useCamera } from '@/composables/useCamera';
import { useCameraController } from '@/composables/useCameraController';
import { useCharacterController } from '@/composables/useCharacterController';
import { Engine } from '@/core/Engine';
import { PerspectiveCamera, Vector3 } from 'three';
import { Reactive, Ref } from 'vue';
import { TargetPosition } from './types';

export interface I_SceneConfig {
  engine: Engine;
}

export type TargetPosition = Reactive<{
  x: number;
  z: number;
  y: number;
}>;

export interface I_GameCamera {
  //js instance
  instance: PerspectiveCamera;

  // Controller state
  controller: ReturnType<typeof useCameraController>;

  // Methods
  start: () => void;
  update: (lookAtVector: Vector3) => void;
  reset: () => void;
  destroy: () => void;
}

export interface I_GameCharacter {
  // State (delegated from controller)
  controller: ReturnType<typeof useCharacterController>;

  // Methods
  update: (delta: number) => void;
  reset: () => void;
  destroy: () => void;
}
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
