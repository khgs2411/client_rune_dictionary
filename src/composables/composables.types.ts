import { TargetPosition } from '@/common/types';
import { PerspectiveCamera, Vector3 } from 'three';
import { Ref } from 'vue';
import { useCameraController } from './useCameraController';
import { useCharacterController } from './useCharacterController';

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

export interface I_GameCamera extends I_GameComposable {
    //js instance
    instance: PerspectiveCamera;

    // Controller state
    controller: ReturnType<typeof useCameraController>;

    // Methods
    start: () => void;
}

export interface I_GameCharacter extends I_GameComposable {
    // State (delegated from controller)
    controller: ReturnType<typeof useCharacterController>;
}
