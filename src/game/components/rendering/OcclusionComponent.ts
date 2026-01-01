import type { I_MeshProvider } from "../../common/mesh.types";
import { isOpacityMaterial } from "../../common/mesh.types";
import { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent, TRAIT } from "@/game/GameComponent";
import { Box3, Material, Mesh, Object3D, Vector3 } from "three";

export interface I_OcclusionConfig {
	/** Target opacity when occluding (0-1). Default: 0.3 */
	occludedOpacity?: number;
	/** Fade speed multiplier. Default: 5 (higher = faster) */
	fadeSpeed?: number;
	/** Vertical offset for player position (to target chest/head). Default: 1.5 */
	playerHeightOffset?: number;
	/** Extra padding around screen bounds for detection (NDC units 0-1). Default: 0.02 */
	screenPadding?: number;
}

/**
 * OcclusionComponent - Makes objects transparent when blocking camera view of player
 *
 * Attach this to objects like trees, rocks, or buildings that might block
 * the player from the camera's view in an isometric/top-down game.
 *
 * How it works:
 * - Projects both mesh bounds and player to screen space (NDC coordinates)
 * - If player's screen position falls within mesh's screen bounds AND mesh is closer,
 *   it smoothly fades to semi-transparent
 * - When no longer blocking, it smoothly fades back to opaque
 *
 * Note: Uses screen-space projection instead of raycasting for reliable detection
 * with billboard sprites (thin planes that would miss rays at oblique angles).
 *
 * Supports any I_MeshProvider:
 * - MeshComponent (single 3D mesh)
 * - SpriteComponent (billboard sprites)
 * - InstancedMeshComponent (multiple instances - fades entire group if any blocks)
 *
 * Requires:
 * - Any component that provides I_MeshProvider trait
 *
 * Note: Material is obtained directly from the mesh, so no separate MaterialComponent
 * is required when using SpriteComponent.
 *
 * Usage:
 * ```typescript
 * // Single mesh
 * gameObject
 *   .addComponent(new GeometryComponent({ type: 'cylinder', params: [0.5, 0.5, 5] }))
 *   .addComponent(new MaterialComponent({ color: 0x228b22 }))
 *   .addComponent(new MeshComponent())
 *   .addComponent(new OcclusionComponent({ occludedOpacity: 0.2 }));
 *
 * // Instanced mesh (all instances fade together)
 * gameObject
 *   .addComponent(new GeometryComponent({ type: 'cone', params: [1, 2, 8] }))
 *   .addComponent(new MaterialComponent({ color: 0x228b22 }))
 *   .addComponent(new InstancedMeshComponent({ instances: [...] }))
 *   .addComponent(new OcclusionComponent());
 * ```
 */
export class OcclusionComponent extends GameComponent {
	public readonly priority = ComponentPriority.INTERACTION;

	private config: I_OcclusionConfig;
	private context!: I_SceneContext;
	private targetMesh!: Object3D;
	private material!: Material;

	// State tracking
	private originalOpacity = 1;
	private originalTransparent = false;
	private currentOpacity = 1;

	// Screen-space projection
	private playerWorldPos = new Vector3();
	private playerScreenPos = new Vector3();
	private meshBounds = new Box3();
	private boundCorner = new Vector3();

	constructor(config: I_OcclusionConfig = { occludedOpacity: 0.3, fadeSpeed: 8 }) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		// Get mesh from any provider (MeshComponent, SpriteComponent, InstancedMeshComponent, etc.)
		// Note: InstancedMeshComponent also registers MESH_PROVIDER trait and implements getMesh()
		const meshProvider = this.requireByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		this.targetMesh = meshProvider.getMesh();

		// Get material directly from the mesh
		// This works for both:
		// - MeshComponent: material comes from MaterialComponent, stored on mesh
		// - SpriteComponent: material is created internally, stored on mesh
		const meshWithMaterial = this.targetMesh as Mesh;
		const meshMaterial = meshWithMaterial.material;

		if (Array.isArray(meshMaterial)) {
			// Multi-material mesh - use first material
			this.material = meshMaterial[0];
		} else {
			this.material = meshMaterial;
		}

		// Store original material state
		if (isOpacityMaterial(this.material)) {
			this.originalOpacity = this.material.opacity;
			this.originalTransparent = this.material.transparent;
			this.currentOpacity = this.originalOpacity;
		}
	}

	update(delta: number): void {
		// Need both camera and character to check occlusion
		if (!this.context.camera || !this.context.character) {
			return;
		}

		const shouldOcclude = this.checkIfBlockingCamera();

		// Smooth fade based on occlusion state
		const targetOpacity = shouldOcclude ? (this.config.occludedOpacity ?? 0.3) : this.originalOpacity;

		const fadeSpeed = this.config.fadeSpeed ?? 5;
		const fadeAmount = delta * fadeSpeed;

		// Lerp toward target opacity
		if (Math.abs(this.currentOpacity - targetOpacity) > 0.01) {
			if (this.currentOpacity > targetOpacity) {
				this.currentOpacity = Math.max(targetOpacity, this.currentOpacity - fadeAmount);
			} else {
				this.currentOpacity = Math.min(targetOpacity, this.currentOpacity + fadeAmount);
			}
			this.applyOpacity(this.currentOpacity);
		}
	}

	/**
	 * Check if this mesh is blocking the player using screen-space projection.
	 * More reliable than raycasting for billboard sprites.
	 */
	private checkIfBlockingCamera(): boolean {
		const camera = this.context.camera!.instance;
		const character = this.context.character!;

		// Get player world position with height offset
		const playerPos = character.controller.getPosition();
		const heightOffset = this.config.playerHeightOffset ?? 1.5;
		this.playerWorldPos.set(playerPos.x, playerPos.y + heightOffset, playerPos.z);

		// Project player to screen space (NDC: -1 to 1)
		this.playerScreenPos.copy(this.playerWorldPos).project(camera);
		const playerDepth = this.playerScreenPos.z;

		// Get mesh bounding box in world space
		this.meshBounds.setFromObject(this.targetMesh);

		// Project bounding box corners to screen space and find screen bounds
		let minX = Infinity,
			maxX = -Infinity;
		let minY = Infinity,
			maxY = -Infinity;
		let meshDepth = Infinity;

		// Check all 8 corners of the bounding box
		const corners = [
			[this.meshBounds.min.x, this.meshBounds.min.y, this.meshBounds.min.z],
			[this.meshBounds.min.x, this.meshBounds.min.y, this.meshBounds.max.z],
			[this.meshBounds.min.x, this.meshBounds.max.y, this.meshBounds.min.z],
			[this.meshBounds.min.x, this.meshBounds.max.y, this.meshBounds.max.z],
			[this.meshBounds.max.x, this.meshBounds.min.y, this.meshBounds.min.z],
			[this.meshBounds.max.x, this.meshBounds.min.y, this.meshBounds.max.z],
			[this.meshBounds.max.x, this.meshBounds.max.y, this.meshBounds.min.z],
			[this.meshBounds.max.x, this.meshBounds.max.y, this.meshBounds.max.z],
		] as const;

		for (const [x, y, z] of corners) {
			this.boundCorner.set(x, y, z).project(camera);
			minX = Math.min(minX, this.boundCorner.x);
			maxX = Math.max(maxX, this.boundCorner.x);
			minY = Math.min(minY, this.boundCorner.y);
			maxY = Math.max(maxY, this.boundCorner.y);
			meshDepth = Math.min(meshDepth, this.boundCorner.z);
		}

		// Mesh must be closer to camera than player (smaller depth = closer)
		if (meshDepth >= playerDepth) {
			return false;
		}

		// Check if player screen position is within mesh screen bounds (with padding)
		const padding = this.config.screenPadding ?? 0.02;
		const playerInBounds = this.playerScreenPos.x >= minX - padding && this.playerScreenPos.x <= maxX + padding && this.playerScreenPos.y >= minY - padding && this.playerScreenPos.y <= maxY + padding;

		return playerInBounds;
	}

	/**
	 * Apply opacity to the material
	 */
	private applyOpacity(opacity: number): void {
		if (isOpacityMaterial(this.material)) {
			// Enable transparency if fading
			if (opacity < 1) {
				this.material.transparent = true;
			}

			this.material.opacity = opacity;
			this.material.needsUpdate = true;

			// Restore original transparent state when fully opaque
			if (opacity >= this.originalOpacity - 0.01) {
				this.material.transparent = this.originalTransparent;
			}
		}
	}

	/**
	 * Restore material to original state on destroy
	 */
	destroy(): void {
		if (isOpacityMaterial(this.material)) {
			this.material.opacity = this.originalOpacity;
			this.material.transparent = this.originalTransparent;
			this.material.needsUpdate = true;
		}
		super.destroy(this.context?.scene);
	}
}
