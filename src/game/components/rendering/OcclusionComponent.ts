import { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent, TRAIT } from "@/game/GameComponent";
import { Material, MeshStandardMaterial, MeshToonMaterial, Object3D, Raycaster, Vector3 } from "three";
import type { I_MaterialProvider } from "../../common/mesh.types";
import { InstancedMeshComponent } from "./InstancedMeshComponent";
import { MeshComponent } from "./MeshComponent";

export interface I_OcclusionConfig {
	/** Target opacity when occluding (0-1). Default: 0.3 */
	occludedOpacity?: number;
	/** Fade speed multiplier. Default: 5 (higher = faster) */
	fadeSpeed?: number;
	/** Vertical offset for player position (to target chest/head). Default: 1.5 */
	playerHeightOffset?: number;
}

/**
 * OcclusionComponent - Makes objects transparent when blocking camera view of player
 *
 * Attach this to objects like trees, rocks, or buildings that might block
 * the player from the camera's view in an isometric/top-down game.
 *
 * How it works:
 * - Each frame, casts a ray from camera to player
 * - If this object's mesh intersects the ray (and is closer than the player),
 *   it smoothly fades to semi-transparent
 * - When no longer blocking, it smoothly fades back to opaque
 *
 * Supports both:
 * - MeshComponent (single mesh)
 * - InstancedMeshComponent (multiple instances - fades entire group if any blocks)
 *
 * Requires:
 * - MeshComponent OR InstancedMeshComponent
 * - Any I_MaterialProvider (MaterialComponent, ToonMaterialComponent, etc.)
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

	// Raycasting
	private raycaster = new Raycaster();
	private cameraPosition = new Vector3();
	private playerPosition = new Vector3();
	private direction = new Vector3();

	constructor(config: I_OcclusionConfig = { occludedOpacity: 0.3, fadeSpeed: 8 }) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		// Try to get MeshComponent first, then InstancedMeshComponent
		const meshComp = this.getComponent(MeshComponent);
		const instancedMeshComp = this.getComponent(InstancedMeshComponent);

		if (meshComp) {
			this.targetMesh = meshComp.mesh;
		} else if (instancedMeshComp) {
			this.targetMesh = instancedMeshComp.instancedMesh;
		} else {
			throw new Error(`[OcclusionComponent] GameObject "${this.gameObject.id}" requires MeshComponent or InstancedMeshComponent`);
		}

		// Get material for opacity changes
		const materialProvider = this.requireByTrait<I_MaterialProvider>(TRAIT.MATERIAL_PROVIDER);
		this.material = materialProvider.material;

		// Store original material state
		if (this.isSupportedMaterial(this.material)) {
			this.originalOpacity = this.material.opacity;
			this.originalTransparent = this.material.transparent;
			this.currentOpacity = this.originalOpacity;
		}
	}

	private isSupportedMaterial(mat: Material): mat is MeshStandardMaterial | MeshToonMaterial {
		return mat instanceof MeshStandardMaterial || mat instanceof MeshToonMaterial;
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
	 * Check if this mesh is between the camera and player
	 */
	private checkIfBlockingCamera(): boolean {
		const camera = this.context.camera!;
		const character = this.context.character!;

		// Get camera position
		this.cameraPosition.copy(camera.instance.position);

		// Get player position with height offset (target chest/head area)
		const playerPos = character.controller.getPosition();
		const heightOffset = this.config.playerHeightOffset ?? 1.5;
		this.playerPosition.set(playerPos.x, playerPos.y + heightOffset, playerPos.z);

		// Calculate direction and distance
		this.direction.subVectors(this.playerPosition, this.cameraPosition).normalize();
		const distanceToPlayer = this.cameraPosition.distanceTo(this.playerPosition);

		// Cast ray from camera toward player
		this.raycaster.set(this.cameraPosition, this.direction);
		this.raycaster.far = distanceToPlayer;

		// Check intersection with this mesh (recursive for instanced meshes)
		const intersects = this.raycaster.intersectObject(this.targetMesh, true);

		// If any intersection is closer than the player, we're blocking
		return intersects.length > 0 && intersects[0].distance < distanceToPlayer;
	}

	/**
	 * Apply opacity to the material
	 */
	private applyOpacity(opacity: number): void {
		if (this.isSupportedMaterial(this.material)) {
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
		if (this.isSupportedMaterial(this.material)) {
			this.material.opacity = this.originalOpacity;
			this.material.transparent = this.originalTransparent;
			this.material.needsUpdate = true;
		}
		super.destroy(this.context?.scene);
	}
}
