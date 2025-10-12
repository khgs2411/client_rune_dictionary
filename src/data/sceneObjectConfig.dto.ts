import { RGBColor } from '@/common/types';
import type { I_InteractableBehaviors } from '@/game/modules/entity/interaction.types';
import { BufferGeometry, BufferGeometryEventMap, NormalBufferAttributes } from 'three';

export type SceneObjectGeometryConfig = BufferGeometry<
  NormalBufferAttributes,
  BufferGeometryEventMap
> & {
  type: 'plane' | 'box' | 'sphere' | 'cylinder' | 'cone';
  params: number[]; // Geometry-specific parameters
};

/**
 * Scene Object Configuration DTO
 */
export interface I_SceneObjectConfig {
  position: RGBColor;
  rotation?: RGBColor; // Euler angles in radians
  scale?: RGBColor; // Default [1, 1, 1]
  geometry: Partial<SceneObjectGeometryConfig>;
  material: {
    useTheme?: boolean; // If true, uses theme color and updates on theme change
    reactiveColor?: string; // If true, changes color to the key from theme on theme change
    staticColor?: number; // If set, uses this fixed color
    roughness?: number;
    metalness?: number;
  };
  castShadow?: boolean;
  receiveShadow?: boolean;

  // Interaction configuration (optional - makes object interactive)
  interactive?: boolean; // If true, object can be clicked/hovered
  interaction?: I_InteractableBehaviors; // Interaction behavior config
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
