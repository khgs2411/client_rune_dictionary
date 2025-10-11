import type { Engine } from '@/core/Engine';
import * as THREE from 'three';

/**
 * Interface for game scenes.
 * Each scene manages its own camera, objects, and update logic.
 */
export interface GameScene {
    readonly name: string;
    readonly camera: THREE.Camera;
    readonly engine: Engine;

    /**
     * Initialize the scene (lights, objects, etc.)
     */
    init(): void;

    /**
     * Called every frame with delta time.
     */
    update(delta: number): void;

    /**
     * Clean up resources, remove event listeners, etc.
     */
    cleanup(): void;
}
