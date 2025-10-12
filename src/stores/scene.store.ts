import { PositionVector3 } from "@/common/types";
import { I_SceneObjectConfig } from "@/data/sceneObjectConfig.dto";
import { defineStore } from "pinia";


export interface I_SceneReference {
    sceneName: string;
    objects: I_SceneObjectConfig[] | { position: PositionVector3 }[];
}

export type SceneStore = ReturnType<typeof useSceneStore>;

export const useSceneStore = defineStore('scene', () => {
    const scenes = new Map<string, I_SceneReference>();

    function register(sceneRef: I_SceneReference) {
        scenes.set(sceneRef.sceneName, sceneRef);
    }

    function getScene(sceneName: string): I_SceneReference | undefined {
        return scenes.get(sceneName);
    }
}, { persist: true })