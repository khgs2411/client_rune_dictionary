import { RGBColor } from "@/common/types";
import { Dto } from "topsyde-utils";

/**
 * Scene Object Configuration DTO
 */
export interface I_SceneObjectConfig {
    position: RGBColor;
    rotation?: RGBColor; // Euler angles in radians
    scale?: RGBColor; // Default [1, 1, 1]
    geometry: {
        type: 'box' | 'sphere' | 'cylinder' | 'cone';
        params: number[]; // Geometry-specific parameters
    };
    material: {
        useTheme?: boolean; // If true, uses theme color and updates on theme change
        staticColor?: number; // If set, uses this fixed color
        roughness?: number;
        metalness?: number;
    };
    castShadow?: boolean;
    receiveShadow?: boolean;
}

/* export default class SceneObjectConfig extends Dto implements I_SceneObjectConfig {
    position: RGBColor;
    rotation?: any;
    scale?: any;
    geometry: {
        type: "box" | "sphere" | "cylinder" | "cone"; params: number[]; // Geometry-specific parameters
    };
    material: {
        useTheme?: boolean; // If true, uses theme color and updates on theme change
        // If true, uses theme color and updates on theme change
        staticColor?: number; // If set, uses this fixed color
        // If set, uses this fixed color
        roughness?: number; metalness?: number;
    };
    castShadow?: boolean | undefined;
    receiveShadow?: boolean | undefined;
} */