import { Engine } from "@/core/Engine";
import { Ref } from "vue";
import * as THREE from "three";
export interface I_SceneConfig {
    engine: Engine
}

export interface I_GameComposable {
    start?: () => void;

    update: (...args: any) => void;
    reset: () => void;
    destroy: () => void;
}

export interface I_CharacterControlsOptions {
    cameraAngleH: Ref<number>;
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

export type TargetPosition = {
    x: Ref<number>;
    z: Ref<number>;
};

export interface I_CameraControlsOptions {
    target?: TargetPosition;
}

export interface I_CameraControls extends I_GameComposable {
    instance: THREE.PerspectiveCamera;
    angle: {
        horizontal: Ref<number>;
        vertical: Ref<number>;
    };
    distance: Ref<number>;
    isDragging: Ref<boolean>;
    target: TargetPosition;
    

    update: (target: THREE.Vector3) => void;

}
