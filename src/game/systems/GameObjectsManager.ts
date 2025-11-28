import { I_ThemeColors } from "@/composables/useTheme";
import type { I_SceneContext, I_SceneSystem } from "@/game/common/scenes.types";
import SceneSystem from "@/game/systems/SceneSystem";
import { I_GameComponent } from "../GameComponent";
import { GameObject } from "../GameObject";

/**
 * GameObjectManager - Scene module that manages all GameObjects
 *
 * This is a SceneModule that fits into the existing scene architecture.
 * It handles:
 * - GameObject lifecycle (init, update, destroy)
 * - Collection management
 * - Context passing to components
 */
export class GameObjectsManager extends SceneSystem implements I_SceneSystem {
	private gameObjects = new Map<string, GameObject>();

	/**
	 * Initialize all GameObjects
	 * Called by scene when module is loaded
	 * @internal
	 */
	protected async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		// Initialize all GameObjects
		for (const gameObject of this.gameObjects.values()) {
			try {
				await gameObject.init(this.context);
			} catch (error) {
				console.error(`[GameObjectManager] Failed to initialize GameObject "${gameObject.id}":`, error);
			}
		}
	}

	/**
	 * Add a GameObject to the manager
	 * If the manager is already initialized, the GameObject will be initialized immediately
	 */
	register(gameObject: GameObject, initialize: boolean = true): void {
		if (this.gameObjects.has(gameObject.id)) {
			console.warn(`[GameObjectManager] GameObject with id "${gameObject.id}" already exists. Skipping.`);
			return;
		}

		this.gameObjects.set(gameObject.id, gameObject);

		// If manager is already initialized, initialize the GameObject immediately
		if (this.context && initialize) {
			gameObject.init(this.context).catch((error) => {
				console.error(`[GameObjectManager] Failed to initialize GameObject "${gameObject.id}":`, error);
			});
		}
	}

	/**
	 * Remove a GameObject from the manager
	 * Calls destroy() on the GameObject before removing
	 */
	unregister(id: string): void {
		const gameObject = this.gameObjects.get(id);
		if (gameObject) {
			gameObject.destroy();
			this.gameObjects.delete(id);
		}
	}

	/**
	 * Get a GameObject by ID
	 */
	get<T extends GameObject>(id: string): T | null {
		return (this.gameObjects.get(id) as T) || null;
	}

	/**
	 * Check if a GameObject exists
	 */
	has(id: string): boolean {
		return this.gameObjects.has(id);
	}

	/**
	 * Get all GameObjects
	 */
	getAll(): GameObject[] {
		return Array.from(this.gameObjects.values());
	}

	/**
	 * Notify all components about theme changes
	 * Components with onThemeChange() method will be notified
	 *
	 * This allows components like MaterialComponent to update their colors
	 * when the user switches between light and dark themes.
	 *
	 * @param theme - The new theme ('light' or 'dark')
	 */
	public onThemeChange(theme: I_ThemeColors): void {
		for (const gameObject of this.gameObjects.values()) {
			const components = gameObject.getAllComponents();

			for (const component of components) {
				// Runtime check if component has onThemeChange method
				if ("onThemeChange" in component && typeof component.onThemeChange === "function") {
					try {
						(component as I_GameComponent).onThemeChange?.(theme);
					} catch (error) {
						console.error(`[GameObjectManager] Failed to notify theme change for component in GameObject "${gameObject.id}":`, error);
					}
				}
			}
		}
	}

	/**
	 * Update all GameObjects
	 * Called every frame by scene
	 */
	public update(delta: number): void {
		for (const gameObject of this.gameObjects.values()) {
			gameObject.update(delta);
		}
	}

	/**
	 * Destroy all GameObjects
	 * Called when scene is destroyed
	 */
	public async destroy(): Promise<void> {
		for (const gameObject of this.gameObjects.values()) {
			gameObject.destroy();
		}

		this.gameObjects.clear();
	}
}
