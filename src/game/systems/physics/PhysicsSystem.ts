import { PositionVector3 } from "@/common/types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { DataStore } from "@/stores/DataStore";
import type * as RAPIER_TYPE from "@dimforge/rapier3d";
import { InstancedMesh, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from "three";
import { watch } from "vue";
import SceneSystem from "../SceneSystem";
import { CollisionSystem } from "./CollisionSystem";
import { DebugWireframeSystem } from "./DebugWireframeSystem";
import { GeometryConverter } from "./GeometryConverter";
import type { CollisionCallbacks, KinematicConfig, StaticBodyConfig, Vector3Like } from "./physics.types";

// Dynamic WASM import (loaded at runtime)
const RAPIER = import("@dimforge/rapier3d") as any;

const PHYSICS_CONSTANTS = {
	CONTROLLER_OFFSET: 0.01,
	DEFAULT_STEP_HEIGHT: 0.5,
	DEFAULT_STEP_WIDTH: 0.2,
	DEFAULT_SNAP_DISTANCE: 0.5,
	PLANE_THICKNESS: 0.1,
} as const;

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
export class PhysicsSystem extends SceneSystem {
	private world!: RAPIER_TYPE.World;
	private RAPIER!: typeof RAPIER_TYPE;
	private isInitialized = false;
	private loadError: Error | null = null;

	// Fixed timestep accumulator for consistent physics across all framerates
	private accumulator = 0;
	private readonly FIXED_TIMESTEP = 1 / 60; // 60 Hz physics

	// Tracking maps
	private bodies = new Map<string, RAPIER_TYPE.RigidBody>();
	private colliders = new Map<string, RAPIER_TYPE.Collider>();
	private kinematicControllers = new Map<string, RAPIER_TYPE.KinematicCharacterController>();
	private colliderToId = new Map<number, string>(); // Rapier collider handle -> GameObject id

	// Subsystems
	private collisionSystem = new CollisionSystem();
	private wireframeSystem = new DebugWireframeSystem();
	private geometryConverter = new GeometryConverter();

	// ============================================================================
	// Lifecycle
	// ============================================================================

	protected async init(context: I_SceneContext): Promise<void> {
		try {
			// Load Rapier WASM module
			this.RAPIER = await RAPIER;

			// Create physics world with gravity
			const gravity = { x: 0.0, y: -9.81, z: 0.0 };
			this.world = new this.RAPIER.World(gravity);

			this.isInitialized = true;
			console.log("🎮 [PhysicsSystem] Initialized successfully");
		} catch (error) {
			this.loadError = error as Error;
			console.error("🎮 [PhysicsSystem] Failed to initialize Rapier:", error);
			throw error; // Re-throw to let caller handle
		}

		// Initialize subsystems
		this.geometryConverter.init(this.RAPIER);
		this.wireframeSystem.init(context.scene, context.cleanupRegistry);

		// Watch global debug setting and toggle wireframe visibility
		this.addEventListeners(context);
	}

	private addEventListeners(context: I_SceneContext) {
		const settings = DataStore.settings;
		const stopWatch = watch(
			() => settings.debug.showPhysicsDebug,
			(newValue) => {
				this.wireframeSystem.setVisible(newValue);
			},
			{ immediate: true }, // Run immediately with current value
		);

		// Register watcher for cleanup
		context.cleanupRegistry.registerWatcher(stopWatch);
	}

	public update(delta: number): void {
		if (!this.isInitialized) return;

		// Fixed timestep accumulator pattern for consistent physics across all framerates
		// Prevents physics from running faster/slower based on render framerate
		this.accumulator += delta;
		while (this.accumulator >= this.FIXED_TIMESTEP) {
			this.world.step();
			this.accumulator -= this.FIXED_TIMESTEP;
		}

		// Delegate collision detection to subsystem
		this.collisionSystem.detect({
			world: this.world,
			colliders: this.colliders,
			colliderToId: this.colliderToId,
		});

		// Delegate wireframe updates to subsystem (only updates kinematic wireframes)
		if (this.wireframeSystem.hasKinematicWireframes()) {
			this.wireframeSystem.update(this.bodies);
		}
	}

	public async destroy(): Promise<void> {
		// Clean up all tracked objects
		this.kinematicControllers.forEach((controller) => this.world.removeCharacterController(controller));
		this.colliders.clear();
		this.bodies.clear();
		this.kinematicControllers.clear();
		this.colliderToId.clear();

		// Clean up subsystems
		this.collisionSystem.clear();
		this.wireframeSystem.clear();

		if (this.world) {
			this.world.free();
		}
		this.isInitialized = false;
	}

	public isReady(): boolean {
		return this.isInitialized && !this.loadError;
	}

	public getLoadError(): Error | null {
		return this.loadError;
	}

	// ============================================================================
	// Collision Detection (delegated to CollisionSystem)
	// ============================================================================

	/**
	 * Register collision callbacks for a GameObject
	 */
	public registerCollisionCallbacks(id: string, callbacks: CollisionCallbacks): void {
		this.collisionSystem.register(id, callbacks);
	}

	/**
	 * Unregister collision callbacks
	 */
	public unregisterCollisionCallbacks(id: string): void {
		this.collisionSystem.unregister(id);
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

		const position = this.geometryConverter.toVector3(config.position ?? [0, 0, 0]);
		const rotation = this.geometryConverter.toVector3(config.rotation ?? [0, 0, 0]);

		// Create rigid body descriptor
		const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z).setRotation(this.eulerToQuaternion(rotation));

		// Create collider descriptor based on shape
		const colliderDesc = this.geometryConverter.createFromConfig(config);

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

		const position = this.geometryConverter.toVector3(config.position ?? [0, 0, 0]);
		const rotation = this.geometryConverter.toVector3(config.rotation ?? [0, 0, 0]);

		// Create kinematic rigid body
		const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position.x, position.y, position.z).setRotation(this.eulerToQuaternion(rotation));

		const body = this.world.createRigidBody(bodyDesc);

		// Create collider
		const colliderDesc = this.geometryConverter.createFromConfig(config);
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

		const { position, rotation, geometry, scale } = this.geometryConverter.extractMeshProperties(mesh);
		const colliderDesc = this.geometryConverter.createFromGeometry(geometry, scale);
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

		const { geometry, scale } = this.geometryConverter.extractMeshProperties(mesh);
		const pos = this.geometryConverter.toVector3(position);
		const colliderDesc = this.geometryConverter.createFromGeometry(geometry, scale);
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
		const { geometry } = this.geometryConverter.extractMeshProperties(instancedMesh);
		const matrix = new Matrix4();
		const position = new Vector3();
		const rotation = new Quaternion();
		const scale = new Vector3();
		const showDebug = this.shouldShowDebug(options?.showDebug);

		for (let i = 0; i < instancedMesh.count; i++) {
			instancedMesh.getMatrixAt(i, matrix);
			matrix.decompose(position, rotation, scale);

			// Create collider from geometry with this instance's scale
			const colliderDesc = this.geometryConverter.createFromGeometry(geometry, {
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

			if (showDebug) {
				this.wireframeSystem.create(instanceId, collider, body, false);
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

		// Delegate wireframe removal to subsystem
		this.wireframeSystem.remove(id);
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
			const vec = this.geometryConverter.toVector3(position);
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

		const pos = this.geometryConverter.toVector3(position);
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

		const rot = this.geometryConverter.toVector3(rotation);
		body.setRotation(this.eulerToQuaternion(rot), true);
	}

	/**
	 * Update static body position (for editor/drag operations)
	 * Alias for setPosition but more explicit for static bodies
	 */
	public updateStaticBodyPosition(id: string, position: Vector3Like): void {
		this.setPosition(id, position);
	}

	/**
	 * Set visibility of debug wireframe for a specific body
	 * Used by CullingSystem to hide wireframes for culled objects
	 */
	public setWireframeVisible(id: string, visible: boolean): void {
		this.wireframeSystem.setWireframeVisible(id, visible);
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

	/**
	 * Create a static body descriptor with optional rotation
	 * Skips rotation for PlaneGeometry since planes are converted to horizontal cuboids
	 */
	private createStaticBodyDesc(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, geometry: any): RAPIER_TYPE.RigidBodyDesc {
		const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);

		// For PlaneGeometry, don't apply rotation (planes are already horizontal cuboids in physics)
		const shouldApplyRotation = !this.geometryConverter.isPlaneGeometry(geometry);
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

		const isKinematic = controller !== null;
		if (controller) {
			this.kinematicControllers.set(id, controller);
		}

		// Delegate wireframe creation to subsystem
		if (showDebug) {
			this.wireframeSystem.create(id, collider, body, isKinematic);
		}
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
