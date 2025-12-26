import { BoxGeometry, BufferGeometry, CapsuleGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from "three";

export type CollisionShapeType = "capsule" | "cylinder" | "cuboid" | "sphere";

export interface I_CollisionShapeConfig {
	type: CollisionShapeType;
	radius?: number; // For capsule/cylinder/sphere (default: 0.3)
	height?: number; // For capsule/cylinder/cuboid (default: 1.5)
	width?: number; // For cuboid x-axis (default: 1)
	depth?: number; // For cuboid z-axis (default: 1)
	offset?: [number, number, number]; // Offset from transform (default: [0, 0, 0])
	rotation?: [number, number, number]; // Rotation in radians [x, y, z] (default: [0, 0, 0])
}

/**
 * CollisionShapeFactory - Creates Three.js geometries for collision shapes
 *
 * Used by CollisionComponent and KinematicCollisionComponent for inline shape definitions.
 * Supports capsule, cylinder, cuboid, and sphere shapes.
 */
export class CollisionShapeFactory {
	/**
	 * Create geometry for collision shape
	 */
	static createGeometry(config: I_CollisionShapeConfig): BufferGeometry {
		const { type, radius = 0.3, height = 1.5, width = 1, depth = 1 } = config;

		switch (type) {
			case "capsule":
				// CapsuleGeometry params: radius, length (middle section), capSegments, radialSegments
				return new CapsuleGeometry(radius, Math.max(0, height - radius * 2), 8, 16);
			case "cylinder":
				// CylinderGeometry params: radiusTop, radiusBottom, height, radialSegments
				return new CylinderGeometry(radius, radius, height, 16);
			case "cuboid":
				// BoxGeometry params: width, height, depth
				return new BoxGeometry(width, height, depth);
			case "sphere":
				// SphereGeometry params: radius, widthSegments, heightSegments
				return new SphereGeometry(radius, 16, 16);
			default:
				throw new Error(`[CollisionShapeFactory] Unknown shape type: ${type}`);
		}
	}

	/**
	 * Create debug visualization mesh (wireframe)
	 */
	static createDebugMesh(config: I_CollisionShapeConfig, color: number = 0x00ff00): Mesh {
		const geometry = this.createGeometry(config);
		const material = new MeshBasicMaterial({
			color,
			wireframe: true,
			transparent: true,
			opacity: 0.5,
			depthWrite: false,
		});

		const mesh = new Mesh(geometry, material);

		// Apply offset if provided
		const offset = config.offset ?? [0, 0, 0];
		mesh.position.set(offset[0], offset[1], offset[2]);

		// Apply rotation if provided
		const rotation = config.rotation ?? [0, 0, 0];
		mesh.rotation.set(rotation[0], rotation[1], rotation[2]);

		return mesh;
	}

	/**
	 * Get shape dimensions for physics registration
	 * Returns full dimensions (not half-extents)
	 */
	static getShapeDimensions(config: I_CollisionShapeConfig): number[] {
		const { type, radius = 0.3, height = 1.5, width = 1, depth = 1 } = config;

		switch (type) {
			case "capsule":
				// Physics expects: [radius, halfHeight]
				return [radius, height / 2];
			case "cylinder":
				// Physics expects: [radius, halfHeight]
				return [radius, height / 2];
			case "cuboid":
				// Physics expects: [halfWidth, halfHeight, halfDepth]
				return [width / 2, height / 2, depth / 2];
			case "sphere":
				// Physics expects: [radius]
				return [radius];
			default:
				throw new Error(`[CollisionShapeFactory] Unknown shape type: ${type}`);
		}
	}
}
