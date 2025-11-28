import type * as RAPIER_TYPE from "@dimforge/rapier3d";
import { BoxGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry, InstancedMesh, Mesh, Object3D, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import type { KinematicConfig, StaticBodyConfig, Vector3Like } from "./physics.types";

const PLANE_THICKNESS = 0.1;

/**
 * GeometryConverter - Converts Three.js geometries to Rapier collider descriptors
 *
 * Responsibilities:
 * - Convert Three.js geometry types to Rapier shapes
 * - Extract mesh properties (position, rotation, scale, geometry)
 * - Validate scale values
 * - Handle shape config to collider conversion
 *
 * Supported geometries:
 * - BoxGeometry → Cuboid
 * - SphereGeometry → Ball
 * - CapsuleGeometry → Capsule
 * - CylinderGeometry → Cylinder
 * - ConeGeometry → Cylinder (approximation)
 * - PlaneGeometry → Thin Cuboid
 */
export class GeometryConverter {
	private RAPIER!: typeof RAPIER_TYPE;

	/**
	 * Initialize with Rapier module reference
	 */
	public init(rapier: typeof RAPIER_TYPE): void {
		this.RAPIER = rapier;
	}

	/**
	 * Convert Vector3Like to plain object
	 */
	public toVector3(v: Vector3Like): { x: number; y: number; z: number } {
		if (Array.isArray(v)) {
			return { x: v[0], y: v[1], z: v[2] };
		}
		return v;
	}

	/**
	 * Create collider descriptor from shape config
	 */
	public createFromConfig(config: StaticBodyConfig | KinematicConfig): RAPIER_TYPE.ColliderDesc {
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
				const halfHeight = (height - radius * 2) / 2;
				return this.RAPIER.ColliderDesc.capsule(halfHeight, radius);
			}

			case "cylinder": {
				const radius = config.radius ?? 0.5;
				const height = config.height ?? 2;
				return this.RAPIER.ColliderDesc.cylinder(height / 2, radius);
			}

			default:
				throw new Error(`[GeometryConverter] Unsupported shape: ${(config as any).shape}`);
		}
	}

	/**
	 * Create collider descriptor from Three.js geometry
	 */
	public createFromGeometry(geometry: any, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		if (!geometry) {
			console.warn(`[GeometryConverter] No geometry found, using default box`);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		if (!this.isValidScale(scale)) {
			console.warn(`[GeometryConverter] Invalid scale detected:`, scale);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		if (geometry instanceof BoxGeometry) {
			return this.convertBox(geometry, scale);
		}

		if (geometry instanceof SphereGeometry) {
			return this.convertSphere(geometry, scale);
		}

		if (geometry instanceof CapsuleGeometry) {
			return this.convertCapsule(geometry, scale);
		}

		if (geometry instanceof CylinderGeometry) {
			return this.convertCylinder(geometry, scale);
		}

		if (geometry instanceof ConeGeometry) {
			return this.convertCone(geometry, scale);
		}

		if (geometry instanceof PlaneGeometry) {
			return this.convertPlane(geometry, scale);
		}

		console.warn(`[GeometryConverter] Unsupported geometry type, using default box`);
		return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
	}

	/**
	 * Extract position, rotation, geometry, and scale from a Three.js mesh
	 */
	public extractMeshProperties(mesh: Mesh | InstancedMesh | Object3D): {
		position: { x: number; y: number; z: number };
		rotation: { x: number; y: number; z: number };
		scale: { x: number; y: number; z: number };
		geometry: any;
	} {
		const worldPosition = mesh.getWorldPosition(new Vector3());
		const worldRotation = mesh.rotation;
		const worldScale = mesh.scale;

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
	 * Check if geometry is a PlaneGeometry (used for rotation handling)
	 */
	public isPlaneGeometry(geometry: any): boolean {
		return geometry instanceof PlaneGeometry;
	}

	/**
	 * Validate scale values are positive and finite
	 */
	public isValidScale(scale: { x: number; y: number; z: number }): boolean {
		return isFinite(scale.x) && isFinite(scale.y) && isFinite(scale.z) && scale.x > 0 && scale.y > 0 && scale.z > 0;
	}

	// ============================================================================
	// Private Conversion Methods
	// ============================================================================

	private convertBox(geometry: BoxGeometry, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		const params = geometry.parameters;
		return this.RAPIER.ColliderDesc.cuboid((params.width * scale.x) / 2, (params.height * scale.y) / 2, (params.depth * scale.z) / 2);
	}

	private convertSphere(geometry: SphereGeometry, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		const params = geometry.parameters;
		const avgScale = (scale.x + scale.y + scale.z) / 3;
		return this.RAPIER.ColliderDesc.ball(params.radius * avgScale);
	}

	private convertCapsule(geometry: CapsuleGeometry, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		const params = geometry.parameters;
		const radius = params.radius * scale.x;
		const totalHeight = (params.height + params.radius * 2) * scale.y;
		const halfHeight = (totalHeight - radius * 2) / 2;
		return this.RAPIER.ColliderDesc.capsule(halfHeight, radius);
	}

	private convertCylinder(geometry: CylinderGeometry, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		const params = geometry.parameters as any;

		let radiusTop: number;
		let radiusBottom: number;

		if (typeof params.radiusTop === "number" && typeof params.radiusBottom === "number") {
			radiusTop = params.radiusTop;
			radiusBottom = params.radiusBottom;
		} else if (typeof params.radius === "number") {
			radiusTop = radiusBottom = params.radius;
		} else {
			console.error("[GeometryConverter] CylinderGeometry missing radius parameters:", params);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		if (typeof params.height !== "number") {
			console.error("[GeometryConverter] CylinderGeometry missing height:", params);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		const avgRadius = ((radiusTop + radiusBottom) / 2) * scale.x;
		const halfHeight = (params.height * scale.y) / 2;

		if (avgRadius <= 0 || halfHeight <= 0 || !isFinite(avgRadius) || !isFinite(halfHeight)) {
			console.error(`[GeometryConverter] Invalid cylinder dimensions:`, { avgRadius, halfHeight, scale });
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		return this.RAPIER.ColliderDesc.cylinder(halfHeight, avgRadius);
	}

	private convertCone(geometry: ConeGeometry, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		const params = geometry.parameters;

		if (!params || typeof params.radius !== "number" || typeof params.height !== "number") {
			console.error("[GeometryConverter] ConeGeometry missing valid parameters:", params);
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		// Approximate cone with cylinder (use radius at base / 2)
		const radius = (params.radius * scale.x) / 2;
		const halfHeight = (params.height * scale.y) / 2;

		if (radius <= 0 || halfHeight <= 0 || !isFinite(radius) || !isFinite(halfHeight)) {
			console.error(`[GeometryConverter] Invalid cone dimensions:`, { radius, halfHeight, scale });
			return this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
		}

		return this.RAPIER.ColliderDesc.cylinder(halfHeight, radius);
	}

	private convertPlane(geometry: PlaneGeometry, scale: { x: number; y: number; z: number }): RAPIER_TYPE.ColliderDesc {
		const params = geometry.parameters;
		return this.RAPIER.ColliderDesc.cuboid((params.width * scale.x) / 2, PLANE_THICKNESS * scale.y, (params.height * scale.z) / 2);
	}
}
