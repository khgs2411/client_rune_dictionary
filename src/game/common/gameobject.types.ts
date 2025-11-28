import type { ReactiveValue } from "@/game/common/interaction.types";
import type { Intersection, Vector3 } from "three";

export type GameObjectType = "npc" | "player" | "environment" | "item" | "null";

/**
 * Configuration for creating a GameObject
 */
export interface I_GameObjectConfig {
	id: string;
	type?: GameObjectType;
}

// ============================================
// LIFECYCLE INTERFACES (SOLID Compliance)
// ============================================

/**
 * Interface for the InteractionService builder
 * Components depend on this abstraction, not the concrete InteractableBuilder class
 * (Dependency Inversion Principle)
 */
export interface I_InteractionBuilder {
	// Hover behaviors
	withHoverGlow(color?: number, intensity?: ReactiveValue<number>): this;
	withTooltip(title: string, description?: string): this;
	withHoverCallbacks(callbacks: { onStart?: (intersection: Intersection) => void; onHold?: (duration: number) => void; onEnd?: () => void }): this;

	// Click behaviors
	withClickVFX(text?: string, color?: string): this;
	withCameraShake(intensity?: ReactiveValue<number>, duration?: ReactiveValue<number>): this;
	withParticles(count?: ReactiveValue<number>, color?: number, speed?: ReactiveValue<number>): this;
	withClickCallbacks(callbacks: { onClick?: (intersection: Intersection) => void }): this;

	// Drag behaviors
	withDrag(options?: { lockAxis?: ("x" | "y" | "z")[]; snapToGrid?: number; onStart?: (pos: Vector3) => void; onMove?: (pos: Vector3) => void; onEnd?: (pos: Vector3) => void }): this;
}
