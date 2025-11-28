import { Reactive, Ref } from "vue";

export type PositionVector3 = { x: number; y: number; z: number };

export type TargetPosition = Reactive<PositionVector3>;

export interface I_CharacterControlsOptions {
	cameraAngleH: Ref<number>;
}

export interface I_CameraControlsOptions {
	target?: TargetPosition;
}

export type RGBColor = [number, number, number]; // RGB color values (0-1)
export type Vec3 = [number, number, number]; // 3D vector/position/dimensions

export interface I_ClientData {
	id: string;
	name: string;
}

export interface I_ConnectedClientData extends I_ClientData {
	scene: string;
}
