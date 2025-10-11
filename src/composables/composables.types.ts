import { TargetPosition } from '@/common/types';
import { Vector3 } from 'three';
import { Ref } from 'vue';

export interface I_GameComposable {
  start?: () => void;
  update: (...args: any) => void;
  reset: () => void;
  destroy: () => void;
}

export interface I_CharacterControls extends I_GameComposable {
  position: {
    x: Ref<number>;
    y: Ref<number>;
    z: Ref<number>;
  };
  rotation: Ref<number>;
  speed: Ref<number>;
  isJumping: Ref<boolean>;
  joystick: {
    active: Ref<boolean>;
    x: Ref<number>;
    y: Ref<number>;
    startX: Ref<number>;
    startY: Ref<number>;
  };
  update: (delta: number) => void;
}

export interface I_CameraControls extends I_GameComposable {
  angle: {
    horizontal: Ref<number>;
    vertical: Ref<number>;
  };
  distance: Ref<number>;
  isDragging: Ref<boolean>;
  target: TargetPosition;

  update: (target: Vector3) => void;
}
