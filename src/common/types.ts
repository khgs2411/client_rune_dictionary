import { Engine } from "@/core/Engine";
import { Ref } from "vue";

export interface I_SceneConfig {
    engine: Engine
}




export type TargetPosition = {
    x: Ref<number>;
    z: Ref<number>;
};
