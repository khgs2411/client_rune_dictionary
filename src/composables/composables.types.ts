import { TargetPosition } from "@/common/types";
import { PerspectiveCamera, Vector3 } from "three";
import { Ref } from "vue";
import { useCameraController } from "./camera/useCameraController";
import { useCharacterController } from "./character/useCharacterController";

export interface I_GameComposable {
	start?: () => void;
	update: (...args: any) => void;
	reset: () => void;
	destroy: () => void;
}

export interface I_JoystickControls {
	active: Ref<boolean>;
	x: Ref<number>;
	y: Ref<number>;
	startX: Ref<number>;
	startY: Ref<number>;
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
	joystick: I_JoystickControls;
	getPosition: () => Vector3;
	setPosition: (x: number, y: number, z: number) => void;
	update: (delta: number) => void;
}

export interface I_CameraPerspective {
	angle: {
		horizontal: number;
		vertical: number;
	};
	distance: number;
	fov: number;
}

export const CAMERA_PRESET_OVERWORLD: I_CameraPerspective = {
	angle: {
		horizontal: 0,
		vertical: Math.PI / 6, // 30 degrees
	},
	distance: 10,
	fov: 75,
};

export const CAMERA_PRESET_MATCH_SPECTATE: I_CameraPerspective = {
	angle: {
		horizontal: 0,
		vertical: Math.PI / 3, // 60 degrees (steeper overhead view)
	},
	distance: 15,
	fov: 75,
};

export interface I_CameraControls extends I_GameComposable {
	angle: {
		horizontal: Ref<number>;
		vertical: Ref<number>;
	};
	distance: Ref<number>;
	isDragging: Ref<boolean>;
	mouseRotationEnabled: Ref<boolean>;
	freezeReactiveUpdates: Ref<boolean>; // Freeze camera position updates (for fixed camera)
	target: TargetPosition;
	followTarget: Vector3 | null; // Optional override for camera follow target

	update: (target: Vector3) => void;
	getPosition: () => Vector3;
}

export interface I_GameCamera extends I_GameComposable {
	//js instance
	instance: PerspectiveCamera;

	// Controller state
	controller: ReturnType<typeof useCameraController>;

	// Methods
	start: () => void;
	changeTarget: (newTarget: Vector3, perspective: I_CameraPerspective, duration: number) => Promise<void>;
}

export interface I_GameCharacter extends I_GameComposable {
	// State (delegated from controller)
	controller: ReturnType<typeof useCharacterController>;
}
