import { useSettingsStore } from '@/stores/settings.store';
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

export type SettingsStore = ReturnType<typeof useSettingsStore>;

export type RGBCOlor = [number, number, number]; // Each 0-1