import type * as RAPIER_TYPE from "@dimforge/rapier3d";
import { PositionVector3 } from "@/common/types";

export type Vector3Like = PositionVector3 | [number, number, number];

export interface CollisionCallbacks {
	onCollisionEnter?: (otherId: string) => void;
	onCollisionStay?: (otherId: string) => void;
	onCollisionExit?: (otherId: string) => void;
}

export interface BaseBodyConfig {
	position?: Vector3Like;
	rotation?: Vector3Like; // Euler angles in radians
}

export interface StaticBodyConfig extends BaseBodyConfig {
	shape: "cuboid" | "sphere" | "capsule" | "cylinder";
	size?: Vector3Like; // For cuboid: [width, height, depth], for sphere: [radius], etc.
	radius?: number; // For sphere, capsule
	height?: number; // For capsule, cylinder
}

export interface KinematicConfig extends BaseBodyConfig {
	shape: "capsule" | "cylinder" | "cuboid";
	radius?: number; // For capsule, cylinder
	height?: number; // For capsule, cylinder
	size?: Vector3Like; // For cuboid
	enableAutostep?: boolean;
	enableSnapToGround?: boolean;
	maxStepHeight?: number;
	minStepWidth?: number;
	snapToGroundDistance?: number;
	controller?: boolean;
}

export interface MovementResult {
	x: number;
	y: number;
	z: number;
	isGrounded: boolean;
}

/**
 * Context passed to subsystems for collision detection
 */
export interface CollisionContext {
	world: RAPIER_TYPE.World;
	colliders: Map<string, RAPIER_TYPE.Collider>;
	colliderToId: Map<number, string>;
}

/**
 * Context passed to DebugWireframeSystem for creating wireframes
 */
export interface WireframeContext {
	scene: THREE.Scene;
	cleanupRegistry: {
		registerDisposable: (...disposables: { dispose: () => void }[]) => void;
		registerObject: (...objects: THREE.Object3D[]) => void;
	};
}

// Forward declare THREE types to avoid importing three in types file
declare namespace THREE {
	interface Scene {
		add(object: Object3D): void;
		remove(object: Object3D): void;
	}
	interface Object3D {
		visible: boolean;
		position: { set(x: number, y: number, z: number): void };
		quaternion: { set(x: number, y: number, z: number, w: number): void };
	}
}
