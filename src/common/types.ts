import { Engine } from "@/core/Engine";
import { Reactive, Ref } from "vue";

export interface I_SceneConfig {
    engine: Engine
}




export type TargetPosition = Reactive<{
    x: number;
    z: number;
    y: number;
}> 

