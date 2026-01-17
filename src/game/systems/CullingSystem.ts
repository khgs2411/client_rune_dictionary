import type { I_SceneContext, I_SceneSystem } from "@/game/common/scenes.types";
import type { I_CullingConfig, I_CullingStats } from "@/game/common/culling.types";
import type { I_MeshProvider } from "@/game/common/mesh.types";
import { CullableComponent } from "@/game/components/rendering/CullableComponent";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { TRAIT } from "@/game/GameComponent";
import type { GameObject } from "@/game/GameObject";
import SceneSystem from "@/game/systems/SceneSystem";
import { DataStore } from "@/stores/DataStore";
import { BufferGeometry, Float32BufferAttribute, Frustum, LineBasicMaterial, LineLoop, Matrix4, PerspectiveCamera, Vector3 } from "three";
import { watch, type WatchStopHandle } from "vue";

/**
 * CullingSystem - Manages visibility of GameObjects based on camera view
 *
 * Features:
 * - **Frustum culling**: Hide objects outside camera view (complements Three.js native)
 * - **Distance culling**: Hide objects beyond a configurable distance
 * - **Per-object config**: Via CullableComponent (neverCull, cullDistance)
 * - **Debug stats**: Track visible/culled counts
 *
 * Usage:
 * ```typescript
 * // In GameScene setup
 * const cullingSystem = new CullingSystem({
 *   maxDistance: 100,
 *   debug: true,
 * });
 * ```
 *
 * Note: Three.js already has built-in frustum culling via `object.frustumCulled`.
 * This system adds distance-based culling and centralized visibility control.
 */
export class CullingSystem extends SceneSystem implements I_SceneSystem {
	private frustum = new Frustum();
	private projScreenMatrix = new Matrix4();
	private anchorPosition = new Vector3();
	private config: Required<I_CullingConfig>;

	// Cached anchor GameObject (found via CULLING_ANCHOR trait)
	private anchorObject: GameObject | null = null;

	// Stats
	private _visibleCount = 0;
	private _culledCount = 0;
	private lastLogTime = 0;

	// Debug wireframe (flat circle for top-down view)
	private debugCircles: LineLoop[] = [];
	private debugMaterial: LineBasicMaterial | null = null;
	private debugGeometries: BufferGeometry[] = [];
	private watchStopHandle: WatchStopHandle | null = null;

	constructor(config: I_CullingConfig = {}) {
		super();
		this.config = {
			maxDistance: config.maxDistance ?? 100,
			fadeDistance: config.fadeDistance ?? 5,
			frustumCulling: config.frustumCulling ?? true,
			distanceCulling: config.distanceCulling ?? true,
			debug: config.debug ?? false,
		};
	}

	protected async init(context: I_SceneContext): Promise<void> {
		if (this.config.debug) {
			console.log("[CullingSystem] Initialized with config:", this.config);
		}

		// Create debug circle (flat ring for top-down view)
		this.createDebugCircle(context);

		// Watch for debug toggle
		const settings = DataStore.settings;
		this.watchStopHandle = watch(
			() => settings.debug.showPhysicsDebug,
			(newValue) => {
				for (const circle of this.debugCircles) {
					circle.visible = newValue;
				}
			},
		);
	}

	/**
	 * Create debug circle showing culling boundary (flat for top-down view)
	 * Creates multiple concentric circles to simulate thick line
	 */
	private createDebugCircle(context: I_SceneContext): void {
		// Bright red material for high visibility
		this.debugMaterial = new LineBasicMaterial({
			color: 0xff0000, // Red
			transparent: false,
			depthTest: false, // Always render on top
		});

		// Create multiple circles with slight offset to simulate thickness
		const offsets = [0, 0.05, 0.1, -0.05, -0.1]; // Multiple circles for thickness
		const segments = 64;

		for (const offset of offsets) {
			const radius = this.config.maxDistance + offset;
			const positions: number[] = [];

			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2;
				positions.push(
					Math.cos(theta) * radius,
					1.0, // Higher above ground so full circle is visible
					Math.sin(theta) * radius,
				);
			}

			const geometry = new BufferGeometry();
			geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
			this.debugGeometries.push(geometry);

			const circle = new LineLoop(geometry, this.debugMaterial);
			circle.name = "culling-debug-circle";
			circle.renderOrder = 9999;
			circle.visible = DataStore.settings.debug.showPhysicsDebug;
			circle.frustumCulled = false;

			context.scene.add(circle);
			context.cleanupRegistry.registerObject(circle);
			context.cleanupRegistry.registerDisposable(geometry);

			this.debugCircles.push(circle);
		}

		context.cleanupRegistry.registerDisposable(this.debugMaterial);
	}

	/**
	 * Set the anchor GameObject for culling calculations
	 * Call from a GameObject's init: context.getService("culling").setAnchor(this)
	 */
	setAnchor(gameObject: GameObject): void {
		this.anchorObject = gameObject;
		if (this.config.debug) {
			console.log(`[CullingSystem] Anchor set to: ${gameObject.id}`);
		}
	}

	/**
	 * Update culling state for all GameObjects
	 * Called every frame by the scene
	 */
	update(delta: number): void {
		const camera = this.context.camera?.instance;
		if (!camera || !(camera instanceof PerspectiveCamera)) return;

		// Update frustum from camera (still needed for frustum culling)
		camera.updateMatrixWorld();
		this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

		// Get anchor position (use anchor GameObject if set, otherwise fall back to camera)
		if (this.anchorObject) {
			const transform = this.anchorObject.getComponent(TransformComponent);
			if (transform) {
				this.anchorPosition.copy(transform.position);
			}
		} else {
			// Fallback to camera position if no anchor set
			camera.getWorldPosition(this.anchorPosition);
		}

		// Update debug circles position to follow anchor
		for (const circle of this.debugCircles) {
			circle.position.copy(this.anchorPosition);
		}

		// Reset stats
		this._visibleCount = 0;
		this._culledCount = 0;

		// Get all GameObjects from manager
		const gameObjectsManager = this.context.getService("gameObjectsManager");
		const gameObjects = gameObjectsManager.getAll();

		// Get physics system for collider culling
		const physics = this.context.getService("physics");

		// Cull each GameObject with fade support
		for (const obj of gameObjects) {
			const { visible, opacity } = this.checkVisibilityWithFade(obj);
			this.setObjectVisibility(obj, visible, opacity, physics);

			if (visible) {
				this._visibleCount++;
			} else {
				this._culledCount++;
			}
		}

		// Debug logging (throttled to once per second)
		if (this.config.debug) {
			const now = performance.now();
			if (now - this.lastLogTime > 1000) {
				console.log(`[CullingSystem] Visible: ${this._visibleCount}, Culled: ${this._culledCount}`);
				this.lastLogTime = now;
			}
		}
	}

	/**
	 * Check if a GameObject should be visible and calculate fade opacity
	 * Returns { visible: boolean, opacity: number (0-1) }
	 */
	private checkVisibilityWithFade(obj: GameObject): { visible: boolean; opacity: number } {
		// Don't cull the anchor object itself
		if (obj === this.anchorObject) {
			return { visible: true, opacity: 1 };
		}

		// Check for CullableComponent config
		const cullable = obj.getComponent(CullableComponent);

		// Never cull if explicitly set
		if (cullable?.neverCull) {
			return { visible: true, opacity: 1 };
		}

		// Get mesh from the GameObject (via trait system)
		const meshProvider = obj.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		if (!meshProvider) {
			return { visible: true, opacity: 1 };
		}

		const mesh = meshProvider.getMesh();
		if (!mesh) {
			return { visible: true, opacity: 1 };
		}

		// Distance check with fade (from anchor position, not camera)
		if (this.config.distanceCulling) {
			const maxDist = cullable?.cullDistance ?? this.config.maxDistance;
			const fadeStart = maxDist - this.config.fadeDistance;
			const distance = mesh.position.distanceTo(this.anchorPosition);

			if (distance > maxDist) {
				// Fully culled
				return { visible: false, opacity: 0 };
			}

			if (distance > fadeStart) {
				// In fade zone - calculate opacity
				const fadeProgress = (distance - fadeStart) / this.config.fadeDistance;
				const opacity = 1 - fadeProgress;
				return { visible: true, opacity: Math.max(0, Math.min(1, opacity)) };
			}
		}

		// Frustum check (no fade for frustum culling - instant)
		if (this.config.frustumCulling) {
			if (!mesh.geometry.boundingSphere) {
				mesh.geometry.computeBoundingSphere();
			}
			if (!this.frustum.intersectsObject(mesh)) {
				return { visible: false, opacity: 0 };
			}
		}

		return { visible: true, opacity: 1 };
	}

	/**
	 * Set visibility and opacity on a GameObject's mesh and physics debug wireframe
	 */
	private setObjectVisibility(obj: GameObject, visible: boolean, opacity: number, physics: ReturnType<typeof this.context.getService<"physics">>): void {
		const meshProvider = obj.findByTrait<I_MeshProvider>(TRAIT.MESH_PROVIDER);
		if (meshProvider) {
			const mesh = meshProvider.getMesh();
			if (mesh) {
				mesh.visible = visible;

				// Apply opacity fade to material ONLY when actually fading
				// Don't touch material when fully visible (opacity=1) to avoid
				// conflicting with OcclusionComponent or other opacity-based systems
				if (visible && opacity < 1 && mesh.material) {
					const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
					if (material && "opacity" in material) {
						material.transparent = true;
						material.opacity = opacity;
					}
				}
			}
		}

		// Set physics debug wireframe visibility (uses GameObject ID)
		// Only control per-object wireframe visibility when global debug is ON
		// When debug is OFF, PhysicsSystem's watcher already hides all wireframes
		if (DataStore.settings.debug.showPhysicsDebug) {
			physics.setWireframeVisible(obj.id, visible);
		}
	}

	/**
	 * Get current culling stats
	 */
	getStats(): I_CullingStats {
		return {
			visibleCount: this._visibleCount,
			culledCount: this._culledCount,
			totalCount: this._visibleCount + this._culledCount,
		};
	}

	/**
	 * Update config at runtime
	 */
	setConfig(config: Partial<I_CullingConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get current max distance
	 */
	get maxDistance(): number {
		return this.config.maxDistance;
	}

	/**
	 * Set max distance at runtime
	 */
	set maxDistance(value: number) {
		this.config.maxDistance = value;
	}

	async destroy(): Promise<void> {
		// Stop watching for debug toggle
		if (this.watchStopHandle) {
			this.watchStopHandle();
			this.watchStopHandle = null;
		}

		if (this.config.debug) {
			console.log("[CullingSystem] Destroyed");
		}
	}
}
