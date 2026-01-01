import type * as RAPIER_TYPE from "@dimforge/rapier3d";
import { ShapeType } from "@dimforge/rapier3d";
import { BoxGeometry, CapsuleGeometry, CylinderGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, Scene, SphereGeometry } from "three";
import { DataStore } from "@/stores/DataStore";
import { CleanupRegistry } from "@/game/CleanupRegistry";

/**
 * DebugWireframeSystem - Manages physics debug wireframes
 *
 * Responsibilities:
 * - Create wireframe visualizations for physics colliders
 * - Track static vs kinematic wireframes separately
 * - Update kinematic wireframe positions each frame
 * - Toggle visibility based on global debug setting
 *
 * Performance: Only updates kinematic wireframes (static bodies don't move)
 */
export class DebugWireframeSystem {
	private staticWireframes = new Map<string, LineSegments>();
	private kinematicWireframes = new Map<string, LineSegments>();
	private material = new LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
	private scene: Scene | null = null;
	private cleanupRegistry: CleanupRegistry | null = null;

	/**
	 * Initialize with scene context
	 */
	public init(scene: Scene, cleanupRegistry: CleanupRegistry): void {
		this.scene = scene;
		this.cleanupRegistry = cleanupRegistry;
		cleanupRegistry.registerDisposable(this.material);
	}

	/**
	 * Create debug wireframe for a collider
	 * @param isKinematic - If true, wireframe position will be updated each frame
	 */
	public create(id: string, collider: RAPIER_TYPE.Collider, body: RAPIER_TYPE.RigidBody, isKinematic: boolean = false): void {
		if (!this.scene || !this.cleanupRegistry) {
			console.warn("[DebugWireframeSystem] Not initialized, cannot create wireframe");
			return;
		}

		const geometry = this.createGeometryFromCollider(id, collider);

		// Create wireframe
		const edges = new EdgesGeometry(geometry);
		const wireframe = new LineSegments(edges, this.material);

		// Position wireframe at body position
		const pos = body.translation();
		const rot = body.rotation();
		wireframe.position.set(pos.x, pos.y, pos.z);
		wireframe.quaternion.set(rot.x, rot.y, rot.z, rot.w);

		// Set initial visibility based on global setting
		wireframe.visible = DataStore.settings.debug.showPhysicsDebug;

		// Register disposables with lifecycle
		this.cleanupRegistry.registerDisposable(geometry);
		this.cleanupRegistry.registerDisposable(edges);
		this.cleanupRegistry.registerObject(wireframe);

		// Add to scene and track in appropriate map
		this.scene.add(wireframe);
		if (isKinematic) {
			this.kinematicWireframes.set(id, wireframe);
		} else {
			this.staticWireframes.set(id, wireframe);
		}
	}

	/**
	 * Create Three.js geometry from Rapier collider shape
	 */
	private createGeometryFromCollider(id: string, collider: RAPIER_TYPE.Collider): BoxGeometry | SphereGeometry | CapsuleGeometry | CylinderGeometry {
		const shapeType = collider.shapeType();

		if (shapeType === ShapeType.Cuboid) {
			const shape = collider.shape as RAPIER_TYPE.Cuboid;
			const halfExtents = shape.halfExtents;
			return new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
		}

		if (shapeType === ShapeType.Ball) {
			const shape = collider.shape as RAPIER_TYPE.Ball;
			return new SphereGeometry(shape.radius, 16, 12);
		}

		if (shapeType === ShapeType.Capsule) {
			const shape = collider.shape as RAPIER_TYPE.Capsule;
			return new CapsuleGeometry(shape.radius, shape.halfHeight * 2, 8, 16);
		}

		if (shapeType === ShapeType.Cylinder) {
			const shape = collider.shape as RAPIER_TYPE.Cylinder;
			return new CylinderGeometry(shape.radius, shape.radius, shape.halfHeight * 2, 16);
		}

		// Default to box for unknown types
		console.warn(`[DebugWireframeSystem] Unknown shape type ${shapeType} for ${id}, using default box`);
		return new BoxGeometry(1, 1, 1);
	}

	/**
	 * Remove wireframe for a body (checks both static and kinematic maps)
	 */
	public remove(id: string): void {
		const staticWireframe = this.staticWireframes.get(id);
		if (staticWireframe) {
			this.scene?.remove(staticWireframe);
			this.staticWireframes.delete(id);
		}

		const kinematicWireframe = this.kinematicWireframes.get(id);
		if (kinematicWireframe) {
			this.scene?.remove(kinematicWireframe);
			this.kinematicWireframes.delete(id);
		}
	}

	/**
	 * Update kinematic wireframe positions
	 * Called each frame from PhysicsSystem.update()
	 */
	public update(bodies: Map<string, RAPIER_TYPE.RigidBody>): void {
		this.kinematicWireframes.forEach((wireframe, id) => {
			const body = bodies.get(id);
			if (body) {
				const pos = body.translation();
				const rot = body.rotation();
				wireframe.position.set(pos.x, pos.y, pos.z);
				wireframe.quaternion.set(rot.x, rot.y, rot.z, rot.w);
			}
		});
	}

	/**
	 * Check if any kinematic wireframes need updating
	 */
	public hasKinematicWireframes(): boolean {
		return this.kinematicWireframes.size > 0;
	}

	/**
	 * Toggle visibility on all wireframes
	 */
	public setVisible(visible: boolean): void {
		this.staticWireframes.forEach((wireframe) => {
			wireframe.visible = visible;
		});
		this.kinematicWireframes.forEach((wireframe) => {
			wireframe.visible = visible;
		});
	}

	/**
	 * Set visibility for a specific wireframe by ID
	 * Used by CullingSystem to hide wireframes for culled objects
	 */
	public setWireframeVisible(id: string, visible: boolean): void {
		const staticWireframe = this.staticWireframes.get(id);
		if (staticWireframe) {
			staticWireframe.visible = visible;
		}

		const kinematicWireframe = this.kinematicWireframes.get(id);
		if (kinematicWireframe) {
			kinematicWireframe.visible = visible;
		}
	}

	/**
	 * Clear all wireframes (called on destroy)
	 */
	public clear(): void {
		this.staticWireframes.clear();
		this.kinematicWireframes.clear();
		this.scene = null;
		this.cleanupRegistry = null;
	}
}
