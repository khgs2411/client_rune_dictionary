import { MathUtils, Mesh, PerspectiveCamera, Vector3 } from "three";
import type { I_MeshProvider } from "../../common/mesh.types";
import type { I_SceneContext } from "../../common/scenes.types";
import type { BillboardMode, I_BillboardComponentConfig } from "../../common/sprite.types";
import { ComponentPriority, GameComponent, TRAIT } from "../../GameComponent";

/**
 * BillboardComponent - Orients a mesh to face the camera
 *
 * Supports two modes:
 * - **Cylindrical**: Rotates only around Y-axis, sprite stays upright
 *   Use for: characters, NPCs, trees, buildings
 * - **Spherical**: Fully faces camera from any angle
 *   Use for: particles, spell effects, floating damage numbers
 *
 * Requires a component implementing I_MeshProvider (SpriteComponent or MeshComponent).
 *
 * Usage:
 * ```typescript
 * new GameObject({ id: 'tree' })
 *   .addComponent(new TransformComponent({ position: [0, 0, 0] }))
 *   .addComponent(new SpriteComponent({ texture: '/tree.png', size: [2, 3] }))
 *   .addComponent(new BillboardComponent({ mode: 'cylindrical' }));
 *
 * // With rotation limit (45° max):
 * new GameObject({ id: 'npc' })
 *   .addComponent(new SpriteComponent({ texture: '/npc.png' }))
 *   .addComponent(new BillboardComponent({ mode: 'cylindrical', maxRotation: Math.PI / 4 }));
 * ```
 */
export class BillboardComponent extends GameComponent {
	// Priority: runs after SpriteComponent (100)
	public readonly priority = ComponentPriority.RENDERING + 1; // 101

	private config: I_BillboardComponentConfig;
	private camera: PerspectiveCamera | null = null;
	private mesh: Mesh | null = null;
	private mode: BillboardMode;
	private maxRotation: number | undefined;

	// Neutral rotation (initial Y rotation, used as reference for clamping)
	private neutralRotationY = 0;

	// Reusable vectors for calculations (avoid GC pressure)
	private cameraPosition = new Vector3();
	private meshPosition = new Vector3();
	private directionToCamera = new Vector3();

	constructor(config: I_BillboardComponentConfig) {
		super();
		this.config = config;
		this.mode = config.mode;
		this.maxRotation = config.maxRotation ?? Math.PI / 15; // Default 12°
	}

	async init(context: I_SceneContext): Promise<void> {
		// Handle optional camera with null check
		if (!context.camera) {
			console.warn(`[BillboardComponent] No camera in context for "${this.gameObject.id}", billboarding disabled`);
			return;
		}

		this.camera = context.camera.instance;

		// Get mesh from provider (SpriteComponent or MeshComponent)
		const meshProvider = this.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		if (!meshProvider) {
			console.warn(`[BillboardComponent] No I_MeshProvider found on "${this.gameObject.id}", billboarding disabled`);
			return;
		}

		this.mesh = meshProvider.getMesh();

		// Store initial rotation as neutral reference for clamping
		this.neutralRotationY = this.mesh.rotation.y;
	}

	/**
	 * Update orientation every frame
	 */
	update(_delta: number): void {
		if (!this.camera || !this.mesh || this.mode === "none") {
			return;
		}

		if (this.mode === "cylindrical") {
			this.applyCylindricalBillboard();
		} else if (this.mode === "spherical") {
			this.applySphericalBillboard();
		}
	}

	/**
	 * Cylindrical billboarding - rotate only around Y axis
	 * Sprite stays upright regardless of camera pitch
	 */
	private applyCylindricalBillboard(): void {
		// Get camera position
		this.cameraPosition.copy(this.camera!.position);

		// Get mesh world position
		this.mesh!.getWorldPosition(this.meshPosition);

		// Calculate direction to camera (XZ plane only)
		this.directionToCamera.set(
			this.cameraPosition.x - this.meshPosition.x,
			0,
			this.cameraPosition.z - this.meshPosition.z,
		);

		// Calculate target rotation angle (Y-axis)
		// Add π to account for camera at -Z looking toward +Z
		const targetRotationY = Math.atan2(this.directionToCamera.x, this.directionToCamera.z) + Math.PI;

		// Apply rotation with optional clamping
		if (this.maxRotation !== undefined) {
			// Clamp rotation relative to neutral direction
			const deltaFromNeutral = this.normalizeAngle(targetRotationY - this.neutralRotationY);
			const clampedDelta = MathUtils.clamp(deltaFromNeutral, -this.maxRotation, this.maxRotation);
			this.mesh!.rotation.y = this.neutralRotationY + clampedDelta;
		} else {
			// No limit - full rotation toward camera
			this.mesh!.rotation.y = targetRotationY;
		}
	}

	/**
	 * Normalize angle to [-PI, PI] range
	 */
	private normalizeAngle(angle: number): number {
		while (angle > Math.PI) angle -= Math.PI * 2;
		while (angle < -Math.PI) angle += Math.PI * 2;
		return angle;
	}

	/**
	 * Spherical billboarding - fully face camera from any angle
	 * Sprite tilts to always face camera directly
	 */
	private applySphericalBillboard(): void {
		// Copy camera's quaternion directly to mesh
		// This makes the sprite parallel to the camera's view plane
		this.mesh!.quaternion.copy(this.camera!.quaternion);
	}

	/**
	 * Change billboard mode at runtime
	 */
	setMode(mode: BillboardMode): void {
		this.mode = mode;
	}

	/**
	 * Get current billboard mode
	 */
	getMode(): BillboardMode {
		return this.mode;
	}
}
