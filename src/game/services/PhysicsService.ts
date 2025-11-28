import { PositionVector3 } from "@/common/types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { DataStore } from "@/stores/DataStore";
import type * as RAPIER_TYPE from "@dimforge/rapier3d";
import { ShapeType } from "@dimforge/rapier3d";
import {
	BoxGeometry,
	CapsuleGeometry,
	ConeGeometry,
	CylinderGeometry,
	EdgesGeometry,
	InstancedMesh,
	LineBasicMaterial,
	LineSegments,
	Matrix4,
	Mesh,
	Object3D,
	PlaneGeometry,
	Quaternion,
	SphereGeometry,
	Vector3,
} from "three";
import { watch } from "vue";
import SceneSystem from "./SceneService";

// Dynamic WASM import (loaded at runtime)
const RAPIER = import("@dimforge/rapier3d") as any;

const PHYSICS_CONSTANTS = {
	CONTROLLER_OFFSET: 0.01,
	DEFAULT_STEP_HEIGHT: 0.5,
	DEFAULT_STEP_WIDTH: 0.2,
	DEFAULT_SNAP_DISTANCE: 0.5,
	PLANE_THICKNESS: 0.1,
} as const;

type Vector3Like = PositionVector3 | [number, number, number];

interface BaseBodyConfig {
	position?: Vector3Like;
	rotation?: Vector3Like; // Euler angles in radians
}

interface CollisionCallbacks {
	onCollisionEnter?: (otherId: string) => void;
	onCollisionStay?: (otherId: string) => void;
	onCollisionExit?: (otherId: string) => void;
}

interface StaticBodyConfig extends BaseBodyConfig {
	shape: "cuboid" | "sphere" | "capsule" | "cylinder";
	size?: Vector3Like; // For cuboid: [width, height, depth], for sphere: [radius], etc.
	radius?: number; // For sphere, capsule
	height?: number; // For capsule, cylinder
}

interface KinematicConfig extends BaseBodyConfig {
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

interface MovementResult {
	x: number;
	y: number;
	z: number;
	isGrounded: boolean;
}

/**
 * PhysicsService
 *
 * Simple facade over Rapier physics engine
 * Single file, minimal API, hides Rapier complexity
 *
 * Usage:
 * - registerStatic(): Create static colliders (ground, walls, obstacles)
 * - registerKinematic(): Create kinematic characters (player, NPCs)
 * - moveKinematic(): Move kinematic body with collision detection
 * - isGrounded(): Check if kinematic is on ground
 * - remove(): Clean up physics body
 */
export class PhysicsService extends SceneSystem {
	private world!: RAPIER_TYPE.World;
	private RAPIER!: typeof RAPIER_TYPE;
	private isInitialized = false;

	// Tracking maps
	private bodies = new Map<string, RAPIER_TYPE.RigidBody>();
	private colliders = new Map<string, RAPIER_TYPE.Collider>();
	private kinematicControllers = new Map<string, RAPIER_TYPE.KinematicCharacterController>();

	// Collision tracking
	private collisionHandlers = new Map<string, CollisionCallbacks>();
	private activeCollisions = new Map<string, Set<string>>(); // id -> Set of colliding ids
	private colliderToId = new Map<number, string>(); // Rapier collider handle -> GameObject id

	// Debug wireframes
	private debugWireframes = new Map<string, LineSegments>();
	private debugMaterial = new LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

	// ============================================================================
	// Lifecycle
	// ============================================================================

	protected async init(context: I_SceneContext): Promise<void> {
		// Load Rapier WASM module
		this.RAPIER = await RAPIER;

		// Create physics world with gravity
		const gravity = { x: 0.0, y: -9.81, z: 0.0 };
		this.world = new this.RAPIER.World(gravity);

		this.isInitialized = true;

		// Register debug material for disposal
		context.cleanupRegistry.registerDisposable(this.debugMaterial);

		// Watch global debug setting and toggle wireframe visibility
		this.addEventListeners(context);
	}

	private addEventListeners(context: I_SceneContext) {
		const settings = DataStore.settings;
		const stopWatch = watch(
			() => settings.debug.showPhysicsDebug,
			(newValue) => {
				this.setDebugWireframesVisible(newValue);
			},
			{ immediate: true }, // Run immediately with current value
		);

		// Register watcher for cleanup
		context.cleanupRegistry.registerWatcher(stopWatch);
	}

	public update(delta: number): void {
		if (!this.isInitialized) return;
		this.world.step();

		// Check for collisions
		this.detectCollisions();

		// Update debug wireframes if any exist
		if (this.debugWireframes.size > 0) {
			this.updateDebugWireframes();
		}
	}

	public async destroy(): Promise<void> {
		// Clean up all tracked objects
		this.kinematicControllers.forEach((controller) => this.world.removeCharacterController(controller));
		this.colliders.clear();
		this.bodies.clear();
		this.kinematicControllers.clear();
		this.collisionHandlers.clear();
		this.activeCollisions.clear();
		this.colliderToId.clear();

		if (this.world) {
			this.world.free();
		}
		this.isInitialized = false;
	}

	public isReady(): boolean {
		return this.isInitialized;
	}

	// ============================================================================
	// Collision Detection
	// ============================================================================

	/**
	 * Detect collisions and invoke callbacks
	 * Called every frame in update()
	 */
	private detectCollisions(): void {
		const currentFrameCollisions = new Map<string, Set<string>>();

		// Iterate through all tracked colliders and check their contact pairs
		for (const [handle, id1] of this.colliderToId) {
			const collider1 = this.world.getCollider(handle);
			if (!collider1) continue;

			// Check all colliders in contact with this one
			this.world.contactPairsWith(collider1, (collider2) => {
				const id2 = this.colliderToId.get(collider2.handle);
				if (!id2) return;

				// Track this frame's collisions
				if (!currentFrameCollisions.has(id1)) {
					currentFrameCollisions.set(id1, new Set());
				}
				currentFrameCollisions.get(id1)!.add(id2);
			});
		}

		// Determine enter/stay/exit for each tracked object
		for (const [id, handlers] of this.collisionHandlers) {
			const currentColliding = currentFrameCollisions.get(id) || new Set<string>();
			const previousColliding = this.activeCollisions.get(id) || new Set<string>();

			// Enter: In current but not in previous
			for (const otherId of currentColliding) {
				if (!previousColliding.has(otherId)) {
					handlers.onCollisionEnter?.(otherId);
				} else {
					// Stay: In both current and previous
					handlers.onCollisionStay?.(otherId);
				}
			}

			// Exit: In previous but not in current
			for (const otherId of previousColliding) {
				if (!currentColliding.has(otherId)) {
					handlers.onCollisionExit?.(otherId);
				}
			}

			// Update active collisions for next frame
			this.activeCollisions.set(id, currentColliding);
		}
	}

	/**
	 * Register collision callbacks for a GameObject
	 */
	public registerCollisionCallbacks(id: string, callbacks: CollisionCallbacks): void {
		this.collisionHandlers.set(id, callbacks);
	}

	/**
	 * Unregister collision callbacks
	 */
	public unregisterCollisionCallbacks(id: string): void {
		this.collisionHandlers.delete(id);
		this.activeCollisions.delete(id);
	}

	// ============================================================================
	// Registration API
	// ============================================================================

	/**
	 * Register a static physics body (ground, walls, obstacles)
	 * Static bodies never move and are optimized for collision detection
	 */
	public registerStatic(id: string, config: StaticBodyConfig, options?: { showDebug?: boolean }): void {
		this.assertReady();

		const position = this.toVector3(config.position ?? [0, 0, 0]);
		const rotation = this.toVector3(config.rotation ?? [0, 0, 0]);

		// Create rigid body descriptor
		const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z).setRotation(this.eulerToQuaternion(rotation));

		// Create collider descriptor based on shape
		const colliderDesc = this.createColliderDesc(config);

		// Use unified body creation (supports debug wireframes)
		const showDebug = this.shouldShowDebug(options?.showDebug);
		this.createAndRegisterBody(id, bodyDesc, colliderDesc, null, showDebug);
	}

	/**
	 * Register a kinematic character controller (player, NPCs)
	 * Kinematic bodies move via explicit position updates with collision detection
	 */
	public registerKinematic(id: string, config: KinematicConfig): void {
		this.assertReady();

		const position = this.toVector3(config.position ?? [0, 0, 0]);
		const rotation = this.toVector3(config.rotation ?? [0, 0, 0]);

		// Create kinematic rigid body
		const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position.x, position.y, position.z).setRotation(this.eulerToQuaternion(rotation));

		const body = this.world.createRigidBody(bodyDesc);

		// Create collider
		const colliderDesc = this.createColliderDesc(config);
		const collider = this.world.createCollider(colliderDesc, body);

		// Create character controller
		if (config.controller) this.createKinematicController(config, id, body, collider);
	}

	private createKinematicController(config: KinematicConfig, id: string, body: RAPIER_TYPE.RigidBody, collider: RAPIER_TYPE.Collider) {
		const controller = this.createController(config);

		this.bodies.set(id, body);
		this.colliders.set(id, collider);
		this.kinematicControllers.set(id, controller);
	}

	/**
	 * Register a static body from a Three.js mesh or instanced mesh
	 * Automatically extracts geometry type, size, position, rotation, and scale
	 */
	public registerStaticFromMesh(id: string, mesh: Mesh | InstancedMesh | Object3D, options?: { showDebug?: boolean }): void {
		this.assertReady();

		const { position, rotation, geometry, scale } = this.extractMeshProperties(mesh);
		const colliderDesc = this.createColliderFromGeometry(geometry, scale);
		const bodyDesc = this.createStaticBodyDesc(position, rotation, geometry);

		const showDebug = this.shouldShowDebug(options?.showDebug);
		this.createAndRegisterBody(id, bodyDesc, colliderDesc, null, showDebug);
	}

	/**
	 * Register a kinematic character from a Three.js mesh with custom position
	 * Useful when you want to use controller state for position but mesh for geometry
	 */
	public registerKinematicFromMesh(
		id: string,
		mesh: Mesh | Object3D,
		position: Vector3Like,
		options?: {
			enableAutostep?: boolean;
			enableSnapToGround?: boolean;
			maxStepHeight?: number;
			minStepWidth?: number;
			snapToGroundDistance?: number;
			showDebug?: boolean;
		},
	): void {
		this.assertReady();

		const { geometry, scale } = this.extractMeshProperties(mesh);
		const pos = this.toVector3(position);
		const colliderDesc = this.createColliderFromGeometry(geometry, scale);
		const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z);

		const controller = this.createController(options);
		const showDebug = this.shouldShowDebug(options?.showDebug);
		this.createAndRegisterBody(id, bodyDesc, colliderDesc, controller, showDebug);
	}

	/**
	 * Register multiple static bodies from an InstancedMesh
	 * Creates a separate collider for each instance
	 * Returns array of created body IDs for tracking
	 */
	public registerInstancedStatic(idPrefix: string, instancedMesh: InstancedMesh, options?: { showDebug?: boolean }): string[] {
		this.assertReady();

		const instanceIds: string[] = [];
		const { geometry } = this.extractMeshProperties(instancedMesh);
		const matrix = new Matrix4();
		const position = new Vector3();
		const rotation = new Quaternion();
		const scale = new Vector3();
		const showDebug = this.shouldShowDebug(options?.showDebug);

		for (let i = 0; i < instancedMesh.count; i++) {
			instancedMesh.getMatrixAt(i, matrix);
			matrix.decompose(position, rotation, scale);

			// Create collider from geometry with this instance's scale
			const colliderDesc = this.createColliderFromGeometry(geometry, {
				x: scale.x,
				y: scale.y,
				z: scale.z,
			});

			// Create static body at this instance's position and rotation
			const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z).setRotation({
				x: rotation.x,
				y: rotation.y,
				z: rotation.z,
				w: rotation.w,
			});

			const instanceId = `${idPrefix}-${i}`;

			// Create body and collider manually (to track collider handle)
			const body = this.world.createRigidBody(bodyDesc);
			const collider = this.world.createCollider(colliderDesc, body);

			this.bodies.set(instanceId, body);
			this.colliders.set(instanceId, collider);
			this.colliderToId.set(collider.handle, instanceId);

			if (showDebug && this.context) {
				this.createDebugWireframe(instanceId, collider, body);
			}

			instanceIds.push(instanceId);
		}

		return instanceIds;
	}

	/**
	 * Remove a physics body and clean up resources
	 */
	public remove(id: string): void {
		const controller = this.kinematicControllers.get(id);
		if (controller) {
			this.world.removeCharacterController(controller);
			this.kinematicControllers.delete(id);
		}

		const collider = this.colliders.get(id);
		if (collider) {
			this.colliderToId.delete(collider.handle);
			this.colliders.delete(id);
		}

		const body = this.bodies.get(id);
		if (body) {
			this.world.removeRigidBody(body);
			this.bodies.delete(id);
		}

		// Remove collision tracking
		this.unregisterCollisionCallbacks(id);

		// Remove debug wireframe if exists
		// Note: Geometry disposal is handled by lifecycle.registerDisposable()
		const wireframe = this.debugWireframes.get(id);
		if (wireframe) {
			this.context?.scene.remove(wireframe);
			this.debugWireframes.delete(id);
		}
	}

	// ============================================================================
	// Movement & Queries API
	// ============================================================================

	/**
	 * Get kinematic controller (low-level Rapier API)
	 * Used by KinematicCollisionComponent to implement movement logic
	 */
	public getKinematicController(id: string): RAPIER_TYPE.KinematicCharacterController | null {
		return this.kinematicControllers.get(id) || null;
	}

	/**
	 * Get collider (low-level Rapier API)
	 */
	public getCollider(id: string): RAPIER_TYPE.Collider | null {
		return this.colliders.get(id) || null;
	}

	/**
	 * Get rigid body (low-level Rapier API)
	 */
	public getBody(id: string): RAPIER_TYPE.RigidBody | null {
		return this.bodies.get(id) || null;
	}

	/**
	 * Apply kinematic translation (low-level Rapier API)
	 */
	public applyKinematicTranslation(id: string, position: Vector3Like): void {
		const body = this.bodies.get(id);
		if (body) {
			const vec = this.toVector3(position);
			body.setNextKinematicTranslation(vec);
		}
	}

	/**
	 * Get current position of a body
	 */
	public getPosition(id: string): PositionVector3 | null {
		const body = this.bodies.get(id);
		if (!body) return null;

		const pos = body.translation();
		return { x: pos.x, y: pos.y, z: pos.z };
	}

	/**
	 * Set position directly (teleport)
	 */
	public setPosition(id: string, position: Vector3Like): void {
		const body = this.bodies.get(id);
		if (!body) {
			console.warn(`[PhysicsService] Body not found: ${id}`);
			return;
		}

		const pos = this.toVector3(position);
		body.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
	}

	/**
	 * Set rotation directly
	 */
	public setRotation(id: string, rotation: Vector3Like): void {
		const body = this.bodies.get(id);
		if (!body) {
			console.warn(`[PhysicsService] Body not found: ${id}`);
			return;
		}

		const rot = this.toVector3(rotation);
		body.setRotation(this.eulerToQuaternion(rot), true);
	}

	/**
	 * Update static body position (for editor/drag operations)
	 * Alias for setPosition but more explicit for static bodies
	 */
	public updateStaticBodyPosition(id: string, position: Vector3Like): void {
		this.setPosition(id, position);
	}

	// ============================================================================
	// Internal Helpers
	// ============================================================================

	private assertReady(): void {
		if (!this.isInitialized) {
			throw new Error("[PhysicsService] Physics not initialized. Call start() first.");
		}
	}

	/**
	 * Determine if debug wireframes should be created
	 * Per-object flag can disable wireframes entirely, otherwise always create them
	 * (visibility is controlled by global setting)
	 */
	private shouldShowDebug(perObjectFlag?: boolean): boolean {
		// If explicitly disabled per-object, don't create wireframe at all
		if (perObjectFlag === false) {
			return false;
		}
		// Otherwise always create wireframe (visibility controlled by global setting)
		return true;
	}

	private toVector3(v: Vector3Like): { x: number; y: number; z: number } {
		if (Array.isArray(v)) {
			return { x: v[0], y: v[1], z: v[2] };
		}
		return v;
	}

	private createColliderDesc(config: StaticBodyConfig | KinematicConfig): RAPIER_TYPE.ColliderDesc {
		switch (config.shape) {
			case "cuboid": {
				const size = this.toVector3(config.size ?? [1, 1, 1]);
				return this.RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
			}

			case "sphere": {
				const radius = config.radius ?? 1;
				return this.RAPIER.ColliderDesc.ball(radius);
			}

			case "capsule": {
				const radius = config.radius ?? 0.5;
				const height = config.height ?? 2;
				const halfHeight = (height - radius * 2) / 2; // Capsule half-height is cylinder part only
				return this.RAPIER.ColliderDesc.capsule(halfHeight, radius);
			}

			case "cylinder": {
				const radius = config.radius ?? 0.5;
				const height = config.height ?? 2;
				return this.RAPIER.ColliderDesc.cylinder(height / 2, radius);
			}

			default:
				throw new Error(`[PhysicsService] Unsupported shape: ${(config as any).shape}`);
		}
	}

	/**
	 * Create collider descriptor from Three.js geometry
	 */
	private createColliderFromGeometry(geometry: any, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		if (!geometry) {
			console.warn(`[PhysicsService] No geometry found, using default box`);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		// Validate scale
		if (!this.isValidScale(scale)) {
			console.warn(`[PhysicsService] Invalid scale detected:`, scale);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		if (geometry instanceof BoxGeometry) {
			const params = geometry.parameters;
			return this.RAPIER.ColliderDesc.cuboid((params.width * scale.x) / 2, (params.height * scale.y) / 2, (params.depth * scale.z) / 2);
		}

		if (geometry instanceof SphereGeometry) {
			const params = geometry.parameters;
			const avgScale = (scale.x + scale.y + scale.z) / 3;
			return this.RAPIER.ColliderDesc.ball(params.radius * avgScale);
		}

		if (geometry instanceof CapsuleGeometry) {
			const params = geometry.parameters;
			const radius = params.radius * scale.x;
			// CapsuleGeometry: total height = height (cylinder part) + 2*radius (hemispheres)
			const totalHeight = (params.height + params.radius * 2) * scale.y;
			const halfHeight = (totalHeight - radius * 2) / 2;

			return this.RAPIER.ColliderDesc.capsule(halfHeight, radius);
		}

		if (geometry instanceof CylinderGeometry) {
			const params = geometry.parameters as any; // Use any to handle different parameter formats

			// CylinderGeometry can have either:
			// - radiusTop & radiusBottom (standard Three.js)
			// - radius (some Three.js versions or custom geometries)
			let radiusTop: number;
			let radiusBottom: number;

			if (typeof params.radiusTop === "number" && typeof params.radiusBottom === "number") {
				// Standard CylinderGeometry
				radiusTop = params.radiusTop;
				radiusBottom = params.radiusBottom;
			} else if (typeof params.radius === "number") {
				// Uniform radius (treat as cylinder with same top/bottom)
				radiusTop = radiusBottom = params.radius;
			} else {
				console.error("[PhysicsService] CylinderGeometry missing radius parameters:", params);
				return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
			}

			if (typeof params.height !== "number") {
				console.error("[PhysicsService] CylinderGeometry missing height:", params);
				return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
			}

			const avgRadius = ((radiusTop + radiusBottom) / 2) * scale.x;
			const halfHeight = (params.height * scale.y) / 2;

			// Validate computed dimensions
			if (avgRadius <= 0 || halfHeight <= 0 || !isFinite(avgRadius) || !isFinite(halfHeight)) {
				console.error(`[PhysicsService] Invalid cylinder dimensions after computation:`, {
					avgRadius,
					halfHeight,
					scale,
				});
				return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
			}

			return this.RAPIER.ColliderDesc.cylinder(halfHeight, avgRadius);
		}

		if (geometry instanceof ConeGeometry) {
			const params = geometry.parameters;

			// Check if parameters exist
			if (!params || typeof params.radius !== "number" || typeof params.height !== "number") {
				console.error("[PhysicsService] ConeGeometry missing valid parameters:", {
					params,
					hasParams: !!params,
					radius: params?.radius,
					height: params?.height,
				});
				return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
			}

			// Approximate cone with cylinder (use radius at base / 2 for better approximation)
			const radius = (params.radius * scale.x) / 2;
			const halfHeight = (params.height * scale.y) / 2;

			// Validate computed dimensions
			if (radius <= 0 || halfHeight <= 0 || !isFinite(radius) || !isFinite(halfHeight)) {
				console.error(`[PhysicsService] Invalid cone dimensions after computation:`, {
					radius,
					halfHeight,
					scale,
				});
				return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
			}

			return this.RAPIER.ColliderDesc.cylinder(halfHeight, radius);
		}

		if (geometry instanceof PlaneGeometry) {
			const params = geometry.parameters;
			// Plane as thin cuboid
			return this.RAPIER.ColliderDesc.cuboid((params.width * scale.x) / 2, PHYSICS_CONSTANTS.PLANE_THICKNESS * scale.y, (params.height * scale.z) / 2);
		}

		console.warn(`[PhysicsService] Unsupported geometry type, using default box`);
		return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
	}

	/**
	 * Validate scale values are positive and finite
	 */
	private isValidScale(scale: { x: number; y: number; z: number }): boolean {
		return isFinite(scale.x) && isFinite(scale.y) && isFinite(scale.z) && scale.x > 0 && scale.y > 0 && scale.z > 0;
	}

	/**
	 * Extract position, rotation, geometry, and scale from a Three.js mesh
	 */
	private extractMeshProperties(mesh: Mesh | InstancedMesh | Object3D) {
		const worldPosition = mesh.getWorldPosition(new Vector3());
		const worldRotation = mesh.rotation;
		const worldScale = mesh.scale;

		// Extract geometry (if available)
		let geometry = null;
		if ("geometry" in mesh) {
			geometry = mesh.geometry;
		}

		return {
			position: { x: worldPosition.x, y: worldPosition.y, z: worldPosition.z },
			rotation: { x: worldRotation.x, y: worldRotation.y, z: worldRotation.z },
			scale: { x: worldScale.x, y: worldScale.y, z: worldScale.z },
			geometry,
		};
	}

	/**
	 * Create a static body descriptor with optional rotation
	 * Skips rotation for PlaneGeometry since planes are converted to horizontal cuboids
	 */
	private createStaticBodyDesc(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, geometry: any): RAPIER_TYPE.RigidBodyDesc {
		const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);

		// For PlaneGeometry, don't apply rotation (planes are already horizontal cuboids in physics)
		const shouldApplyRotation = !(geometry instanceof PlaneGeometry);
		if (shouldApplyRotation) {
			bodyDesc.setRotation(this.eulerToQuaternion(rotation));
		}

		return bodyDesc;
	}

	/**
	 * Create and configure a character controller
	 */
	private createController(options?: {
		enableAutostep?: boolean;
		enableSnapToGround?: boolean;
		maxStepHeight?: number;
		minStepWidth?: number;
		snapToGroundDistance?: number;
		controllerOffset?: number;
	}): RAPIER_TYPE.KinematicCharacterController {
		const controller = this.world.createCharacterController(options?.controllerOffset ?? PHYSICS_CONSTANTS.CONTROLLER_OFFSET);

		if (options?.enableAutostep) {
			const maxStepHeight = options.maxStepHeight ?? PHYSICS_CONSTANTS.DEFAULT_STEP_HEIGHT;
			const minStepWidth = options.minStepWidth ?? PHYSICS_CONSTANTS.DEFAULT_STEP_WIDTH;
			controller.enableAutostep(maxStepHeight, minStepWidth, true);
		}

		if (options?.enableSnapToGround) {
			const snapDistance = options.snapToGroundDistance ?? PHYSICS_CONSTANTS.DEFAULT_SNAP_DISTANCE;
			controller.enableSnapToGround(snapDistance);
		}

		controller.setApplyImpulsesToDynamicBodies(true);

		return controller;
	}

	/**
	 * Create body and collider, then register in tracking maps
	 */
	private createAndRegisterBody(id: string, bodyDesc: RAPIER_TYPE.RigidBodyDesc, colliderDesc: RAPIER_TYPE.ColliderDesc, controller: RAPIER_TYPE.KinematicCharacterController | null, showDebug?: boolean): void {
		const body = this.world.createRigidBody(bodyDesc);
		const collider = this.world.createCollider(colliderDesc, body);

		this.bodies.set(id, body);
		this.colliders.set(id, collider);

		// Track collider handle for collision detection
		this.colliderToId.set(collider.handle, id);

		if (controller) {
			this.kinematicControllers.set(id, controller);
		}

		// Create debug wireframe if requested
		if (showDebug && this.context) {
			this.createDebugWireframe(id, collider, body);
		}
	}

	/**
	 * Create debug wireframe for a collider
	 */
	private createDebugWireframe(id: string, collider: RAPIER_TYPE.Collider, body: RAPIER_TYPE.RigidBody): void {
		// Get collider shape from the actual collider (not descriptor)
		const shapeType = collider.shapeType();

		let geometry: BoxGeometry | SphereGeometry | CapsuleGeometry | CylinderGeometry;

		// Create geometry based on collider type (Rapier ShapeType enum)
		// ShapeType: 0=Ball, 1=Cuboid, 2=Capsule, 3=Segment, 4=Triangle, 5=TriMesh, etc.
		if (shapeType === ShapeType.Cuboid) {
			// Cuboid
			const shape = collider.shape as RAPIER_TYPE.Cuboid;
			const halfExtents = shape.halfExtents;
			geometry = new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
		} else if (shapeType === ShapeType.Ball) {
			// Ball
			const shape = collider.shape as RAPIER_TYPE.Ball;
			const radius = shape.radius;
			geometry = new SphereGeometry(radius, 16, 12);
		} else if (shapeType === ShapeType.Capsule) {
			// Capsule
			const shape = collider.shape as RAPIER_TYPE.Capsule;
			const radius = shape.radius;
			const halfHeight = shape.halfHeight;
			// CapsuleGeometry height is just the cylinder part
			geometry = new CapsuleGeometry(radius, halfHeight * 2, 8, 16);
		} else if (shapeType === ShapeType.Cylinder) {
			// Cylinder
			const shape = collider.shape as RAPIER_TYPE.Cylinder;
			const radius = shape.radius;
			const halfHeight = shape.halfHeight;
			geometry = new CylinderGeometry(radius, radius, halfHeight * 2, 16);
		} else {
			// Default to box for unknown types
			console.warn(`[PhysicsService] Unknown shape type ${shapeType} for ${id}, using default box`);
			geometry = new BoxGeometry(1, 1, 1);
		}

		// Create wireframe
		const edges = new EdgesGeometry(geometry);
		const wireframe = new LineSegments(edges, this.debugMaterial);

		// Position wireframe at body position
		const pos = body.translation();
		const rot = body.rotation();
		wireframe.position.set(pos.x, pos.y, pos.z);
		wireframe.quaternion.set(rot.x, rot.y, rot.z, rot.w);
		// Set initial visibility based on global setting
		wireframe.visible = DataStore.settings.debug.showPhysicsDebug;

		// Register disposables with lifecycle
		this.context.cleanupRegistry.registerDisposable(geometry); // Original geometry
		this.context.cleanupRegistry.registerDisposable(edges); // EdgesGeometry
		this.context.cleanupRegistry.registerObject(wireframe); // LineSegments (Object3D)

		// Add to scene and track
		this.context.scene.add(wireframe);
		this.debugWireframes.set(id, wireframe);
	}

	/**
	 * Toggle debug wireframes on/off globally
	 */
	public setDebugWireframesVisible(visible: boolean): void {
		this.debugWireframes.forEach((wireframe) => {
			wireframe.visible = visible;
		});
	}

	/**
	 * Update debug wireframe positions (call in update loop if bodies move)
	 */
	private updateDebugWireframes(): void {
		this.debugWireframes.forEach((wireframe, id) => {
			const body = this.bodies.get(id);
			if (body) {
				const pos = body.translation();
				const rot = body.rotation();
				wireframe.position.set(pos.x, pos.y, pos.z);
				wireframe.quaternion.set(rot.x, rot.y, rot.z, rot.w);
			}
		});
	}

	private eulerToQuaternion(euler: { x: number; y: number; z: number }): {
		x: number;
		y: number;
		z: number;
		w: number;
	} {
		const { x, y, z } = euler;

		const c1 = Math.cos(x / 2);
		const c2 = Math.cos(y / 2);
		const c3 = Math.cos(z / 2);
		const s1 = Math.sin(x / 2);
		const s2 = Math.sin(y / 2);
		const s3 = Math.sin(z / 2);

		return {
			x: s1 * c2 * c3 + c1 * s2 * s3,
			y: c1 * s2 * c3 - s1 * c2 * s3,
			z: c1 * c2 * s3 + s1 * s2 * c3,
			w: c1 * c2 * c3 - s1 * s2 * s3,
		};
	}
}
