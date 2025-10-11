import { useCameraController } from '@/composables/useCameraController';
import { useCharacterController } from '@/composables/useCharacterController';
import { Engine } from '@/core/Engine';
import { PerspectiveCamera, Vector3 } from 'three';
import { Reactive } from 'vue';

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
