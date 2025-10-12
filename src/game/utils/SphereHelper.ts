import {
  LineSegments,
  BufferGeometry,
  LineBasicMaterial,
  BufferAttribute,
  Sphere,
  Vector3,
} from 'three';

/**
 * Helper to visualize a Sphere (Three.js doesn't have this built-in)
 * Similar to Box3Helper but for spheres
 */
export class SphereHelper extends LineSegments {
  public sphere: Sphere;

  constructor(sphere: Sphere, color: number = 0xffff00) {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({ color, toneMapped: false });

    super(geometry, material);

    this.sphere = sphere;

    this.updateGeometry();
  }

  /**
   * Update the geometry to match the sphere
   */
  public updateGeometry(): void {
    const sphere = this.sphere;
    const geometry = this.geometry;

    // Create 3 rings (XY, XZ, YZ planes)
    const segments = 32; // More segments = smoother circle
    const positions: number[] = [];

    // Ring in XY plane (around Z axis)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = sphere.center.x + Math.cos(angle) * sphere.radius;
      const y = sphere.center.y + Math.sin(angle) * sphere.radius;
      const z = sphere.center.z;
      positions.push(x, y, z);

      if (i > 0) {
        positions.push(x, y, z);
      }
    }

    // Ring in XZ plane (around Y axis)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = sphere.center.x + Math.cos(angle) * sphere.radius;
      const y = sphere.center.y;
      const z = sphere.center.z + Math.sin(angle) * sphere.radius;
      positions.push(x, y, z);

      if (i > 0) {
        positions.push(x, y, z);
      }
    }

    // Ring in YZ plane (around X axis)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = sphere.center.x;
      const y = sphere.center.y + Math.cos(angle) * sphere.radius;
      const z = sphere.center.z + Math.sin(angle) * sphere.radius;
      positions.push(x, y, z);

      if (i > 0) {
        positions.push(x, y, z);
      }
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.computeBoundingSphere();
  }

  /**
   * Dispose of the geometry
   */
  public dispose(): void {
    this.geometry.dispose();
    (this.material as LineBasicMaterial).dispose();
  }
}
