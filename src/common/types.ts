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

export type RGBColor = [number, number, number]; // RGB color values (0-1)
export type Vec3 = [number, number, number]; // 3D vector/position/dimensions
