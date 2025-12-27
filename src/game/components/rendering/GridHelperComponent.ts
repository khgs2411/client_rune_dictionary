import { I_SceneContext } from "@/game/common/scenes.types";
import { useSettingsStore } from "@/stores/settings.store";
import { GridHelper, Scene } from "three";
import { watch } from "vue";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { TransformComponent } from "../entities/TransformComponent";

export interface I_GridHelperConfig {
	size?: number;
	divisions?: number;
	centerColor?: number;
	gridColor?: number;
	yOffset?: number; // Prevent z-fighting (default: 0.01)
	linkToPhysicsDebug?: boolean; // Sync visibility with showPhysicsDebug setting (default: true)
}

/**
 * GridHelperComponent - Adds a visual grid helper to a GameObject
 *
 * This component creates a Three.js GridHelper centered on the GameObject's position.
 * Commonly used with plane geometries to visualize ground tiles.
 *
 * Usage:
 * ```typescript
 * gameObject.addComponent(new GridHelperComponent({
 *   size: 10,
 *   divisions: 10,
 *   centerColor: 0x444444,
 *   gridColor: 0x888888
 * }));
 * ```
 */
export class GridHelperComponent extends GameComponent {
	public readonly priority = ComponentPriority.RENDERING; // 100 - creates helper after transform

	private config: I_GridHelperConfig;
	private gridHelper!: GridHelper;
	private unwatchDebug?: () => void;

	constructor(config: I_GridHelperConfig = {}) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		const size = this.config.size ?? 10;
		const divisions = this.config.divisions ?? 10;
		const centerColor = this.config.centerColor ?? 0x444444;
		const gridColor = this.config.gridColor ?? 0x888888;
		const yOffset = this.config.yOffset ?? 0.01;
		const linkToPhysicsDebug = this.config.linkToPhysicsDebug ?? true;

		// Create grid helper
		this.gridHelper = new GridHelper(size, divisions, centerColor, gridColor);

		// Get position from TransformComponent if available
		const transform = this.getComponent(TransformComponent);
		if (transform && transform.position) {
			this.gridHelper.position.set(
				transform.position.x,
				yOffset, // Use yOffset for Y, not transform.position.y
				transform.position.z,
			);
		} else {
			// Fallback: just use yOffset
			this.gridHelper.position.y = yOffset;
		}

		// Add to scene
		context.scene.add(this.gridHelper);

		// Register for cleanup (handles scene removal and disposal automatically)
		context.cleanupRegistry.registerObject(this.gridHelper);

		// Link visibility to physics debug setting
		if (linkToPhysicsDebug) {
			const settings = useSettingsStore();

			// Set initial visibility
			this.gridHelper.visible = settings.debug.showPhysicsDebug;

			// Watch for changes
			this.unwatchDebug = watch(
				() => settings.debug.showPhysicsDebug,
				(showDebug) => {
					this.gridHelper.visible = showDebug;
				},
			);
		}
	}

	destroy(scene: Scene): void {
		// Clean up watcher
		if (this.unwatchDebug) {
			this.unwatchDebug();
		}
		super.destroy(scene);
	}
}
