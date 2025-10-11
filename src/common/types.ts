import { Reactive, Ref } from 'vue';

export type TargetPosition = Reactive<{
  x: number;
  z: number;
  y: number;
}>;

export interface I_CharacterControlsOptions {
  cameraAngleH: Ref<number>;
}

export interface I_CameraControlsOptions {
  target?: TargetPosition;
}

export type RGBColor = [number, number, number]; // Each 0-1
