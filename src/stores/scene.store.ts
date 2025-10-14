import { PositionVector3 } from "@/common/types";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

/**
 * Saved object state for level editor
 */
export interface I_SavedObjectState {
    objectId: string;           // Unique object identifier
    position: PositionVector3;  // Saved position
}

/**
 * Scene reference with saved object states
 */
export interface I_SceneReference {
    sceneName: string;
    objects: I_SavedObjectState[];  // Array of saved object states
}

export type SceneStore = ReturnType<typeof useSceneStore>;

/**
 * Scene Store
 * Manages saved object positions for level editor
 *
 * Usage:
 * - saveObjectPosition() - Save position after dragging
 * - getObjectPosition() - Get saved position for object
 * - clearScene() - Reset scene to defaults (remove all saved positions)
 */
export const useSceneStore = defineStore('scene', () => {
    // Use reactive Record instead of Map for proper localStorage persistence
    const scenes = reactive<Record<string, I_SceneReference>>({});
    const currentScene = ref(<string | null>null);

    /**
     * Save an object's position
     */
    function saveObjectPosition(sceneName: string, objectId: string, position: PositionVector3): void {
        let scene = scenes[sceneName];

        if (!scene) {
            // Create new scene entry
            scene = {
                sceneName,
                objects: []
            };
            scenes[sceneName] = scene;
        }

        // Find existing object or add new one
        const existingIndex = scene.objects.findIndex(obj => obj.objectId === objectId);
        const savedState: I_SavedObjectState = { objectId, position };

        if (existingIndex !== -1) {
            // Update existing
            scene.objects[existingIndex] = savedState;
        } else {
            // Add new
            scene.objects.push(savedState);
        }

        console.log(`💾 [SceneStore] Saved position for ${objectId} in ${sceneName}:`, position);
        console.log(`💾 [SceneStore] Current scenes state:`, scenes);
    }

    /**
     * Get saved position for an object
     */
    function getObjectPosition(sceneName: string, objectId: string): PositionVector3 | null {
        const scene = scenes[sceneName];
        if (!scene) {
            console.log(`⚠️ [SceneStore] No scene found for: ${sceneName}`);
            return null;
        }

        const savedObject = scene.objects.find(obj => obj.objectId === objectId);
        return savedObject?.position || null;
    }

    function setActiveScene(name: string) {
        console.log(`🎬 [SceneStore] Setting active scene to: ${name}`);
        currentScene.value = name;
    }

    function getActiveScene() {
        return currentScene.value;
    }

    /**
     * Get all saved objects for a scene
     */
    function getScene(sceneName: string): I_SceneReference | undefined {
        return scenes[sceneName];
    }

    /**
     * Clear saved positions for a scene (reset to defaults)
     */
    function clearScene(sceneName: string): void {
        delete scenes[sceneName];
        console.log(`🗑️ [SceneStore] Cleared saved positions for ${sceneName}`);
    }

    /**
     * Check if a scene has any saved positions
     */
    function hasScene(sceneName: string): boolean {
        const scene = scenes[sceneName];
        return scene ? scene.objects.length > 0 : false;
    }

    return {
        scenes, // Expose for debugging
        saveObjectPosition,
        getObjectPosition,
        getScene,
        clearScene,
        hasScene,
        setActiveScene,
        getActiveScene,
    };
}, { persist: true })