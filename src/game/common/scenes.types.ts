import { I_ConnectedClientData, RGBColor } from "@/common/types";
import { useCamera } from "@/composables/useCamera";
import { useCharacter } from "@/composables/useCharacter";
import { I_ThemeColors } from "@/composables/useTheme";
import { CleanupRegistry } from "@/game/CleanupRegistry";
import { Engine } from "@/game/Engine";
import { GameObjectsManager } from "@/game/services/GameObjectsManager";
import type { InteractionService } from "@/game/services/InteractionService";
import { PhysicsService } from "@/game/services/PhysicsService";
import SceneStateService from "@/game/services/SceneStateService";
import { Spawner } from "@/game/services/Spawner";
import { VFXService } from "@/game/services/VFXService";
import { BufferGeometry, BufferGeometryEventMap, NormalBufferAttributes, Scene } from "three";
import NetworkingService from "../services/NetworkingService";
import type { I_InteractableBehaviors } from "./interaction.types";

/**
 * Configuration for creating a scene
 */
export interface I_SceneConfig {
	engine: Engine;
}

/**
 * Core scene interface
 */
export interface I_GameScene {
	readonly name: string;
	readonly camera: ReturnType<typeof useCamera>;
	readonly engine: Engine;

	start(): void;
	update(delta: number): void;
	destroy(): void;
}

export interface I_SceneSystem {
	start(ctx: I_SceneContext): Promise<void> | void;
	update?(delta: number): void;
	destroy(): Promise<void> | void;
	register?(...args: any[]): void;
	unregister?(...args: any[]): void;
}

/**
 * Base module interface - all modules implement this
 * Optional lifecycle hooks via duck typing (no need for separate interfaces)
 */
export interface I_SceneModule {
	/**
	 * Initialize the module
	 */
	start(context: I_SceneContext): Promise<void>;

	/**
	 * Cleanup the module
	 */
	destroy(context?: I_SceneContext): Promise<void>;

	close?(): void;

	setName(name: string): void;

	/**
	 * Optional: Update each frame (only implement if needed)
	 */
	update?(delta: number, ...args: any[]): void | Promise<void>;

	/**
	 * Optional: React to theme changes (only implement if needed)
	 * Receives full theme object - modules extract what they need
	 */
	onThemeChange?(theme: I_ThemeColors): void;

	addToScene?(context: I_SceneContext, ...args: any[]): void;
}

/**
 * Services available to modules via context
 * This is how cross-cutting concerns (interaction, audio, etc.) are shared
 */
export interface I_SceneServices {
	interaction: InteractionService;
	vfx: VFXService;
	physics: PhysicsService;
	networking: NetworkingService;
	gameObjectsManager: GameObjectsManager;
	spawner: Spawner;
	state: SceneStateService;
}

/**
 * Context passed to modules during initialization
 * Contains everything a module might need
 */
export interface I_SceneContext {
	engine: Engine;
	scene: Scene;
	cleanupRegistry: CleanupRegistry;
	sceneName: string;
	/**
	 * @deprecated Use getService instead
	 */
	services: I_SceneServices;
	getService<K extends keyof I_SceneServices>(serviceName: K): I_SceneServices[K];
	clientData: Partial<I_ConnectedClientData>;
	camera?: ReturnType<typeof useCamera>; // Optional: for modules that need camera
	character?: ReturnType<typeof useCharacter>; // Optional: for modules that need character
}
/**
 * Scene Object Configuration DTO
 * Refactored v2: Supports new interaction structure (hover, click, drag)
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
	interaction?: I_InteractableBehaviors; // Interaction behavior config (hover, click, drag)
}
export type SceneObjectGeometryConfig = BufferGeometry<NormalBufferAttributes, BufferGeometryEventMap> & {
	type: "plane" | "box" | "sphere" | "cylinder" | "cone";
	params: number[]; // Geometry-specific parameters
	grid?: boolean; // If true and type is plane, adds a grid helper
};
