import { Ref } from "vue";
import * as THREE from 'three';

export interface GameScene {
    name: string;
    init: (context: ThreeContext) => void;
    update: (delta: number, elapsed: number) => void;
    cleanup: () => void;
}

export interface ThreeGame {
    context: Ref<ThreeContext | null>;
    currentScene: Ref<GameScene | null>;
    loadScene: (scene: GameScene) => void;
    unloadScene: () => void;
}



export interface ThreeContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    canvas: HTMLCanvasElement;
}