import type { I_ModuleContext } from '@/scenes/scenes.types';
import type { ReactiveValue } from '@/game/modules/entity/interaction.types';
import type { Vector3, Intersection } from 'three';

/**
 * Context passed to GameComponents during initialization
 * Contains all services and scene references needed by components
 */
export interface I_GameContext extends I_ModuleContext {
  // I_ModuleContext already includes:
  // - engine: Engine
  // - scene: Scene
  // - sceneName: string
  // - lifecycle: SceneLifecycle
  // - services: { physics, interaction, vfx }
  // - camera: I_GameCamera
  // - character: I_GameCharacter
}

/**
 * Configuration for creating a GameObject
 */
export interface I_GameObjectConfig {
  id: string;
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
  withHoverCallbacks(callbacks: {
    onStart?: (intersection: Intersection) => void;
    onHold?: (duration: number) => void;
    onEnd?: () => void;
  }): this;

  // Click behaviors
  withClickVFX(text?: string, color?: string): this;
  withCameraShake(intensity?: ReactiveValue<number>, duration?: ReactiveValue<number>): this;
  withParticles(count?: ReactiveValue<number>, color?: number, speed?: ReactiveValue<number>): this;
  withClickCallbacks(callbacks: { onClick?: (intersection: Intersection) => void }): this;

  // Drag behaviors
  withDrag(options?: {
    lockAxis?: ('x' | 'y' | 'z')[];
    snapToGrid?: number;
    onStart?: (pos: Vector3) => void;
    onMove?: (pos: Vector3) => void;
    onEnd?: (pos: Vector3) => void;
  }): this;
}

/**
 * Component lifecycle interface for interaction registration
 * GameObject will query components implementing this interface and
 * coordinate a single registration with InteractionService
 */
export interface I_Interactable {
  registerInteractions(builder: I_InteractionBuilder, context: I_GameContext): void;
}

/**
 * Component lifecycle interface for rendering (future-proofing)
 * Reserved for future rendering system coordination
 */
export interface I_Renderable {
  // Empty for now - reserved for future rendering lifecycle hooks
}

/**
 * Component lifecycle interface for physics (future-proofing)
 * Reserved for future physics system coordination
 */
export interface I_Physical {
  // Empty for now - reserved for future physics lifecycle hooks
}
