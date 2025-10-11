import { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import SceneModule from '@/game/SceneModule';
import { Object3D, MeshStandardMaterial, Color } from 'three';
import { useRxjs } from 'topsyde-utils';
import type { I_InteractionEvent } from '../entity/interaction.types';

/**
 * Visual Feedback Module
 * Provides visual feedback for interactions (hover glow, click flash)
 * Subscribes to InteractionModule events and applies visual effects
 *
 * Features:
 * - Hover: Faint orange outline/emissive glow
 * - Click: Bright flash effect
 */
export class VisualFeedbackModule extends SceneModule implements I_SceneModule {
  private context!: I_ModuleContext;
  private events = useRxjs('interaction');

  // Track current hover object for cleanup
  private currentHoverObject: Object3D | null = null;
  private originalMaterials = new Map<Object3D, any>();

  // Colors
  private hoverColor = new Color(0xff8c00); // Orange
  private clickColor = new Color(0xffff00); // Yellow
  private hoverEmissiveIntensity = 0.3;
  private clickEmissiveIntensity = 0.8;

  constructor() {
    super('visualFeedback');
  }

  async start(context: I_ModuleContext): Promise<void> {
    this.context = context;

    // Subscribe to interaction events
    this.events.$subscribe({
      'hover-start': (event: I_InteractionEvent) => this.onHoverStart(event),
      'hover-end': (event: I_InteractionEvent) => this.onHoverEnd(event),
      click: (event: I_InteractionEvent) => this.onClick(event),
    });

    console.log('✨ [VisualFeedbackModule] Initialized');
    this.initialized(context.sceneName);
  }

  update(delta: number): void {
    // No per-frame updates needed (event-driven)
  }

  async destroy(): Promise<void> {
    this.events.$unsubscribe();
    this.restoreOriginalMaterial();
    this.originalMaterials.clear();
  }

  /**
   * Handle hover start - apply faint glow
   */
  private onHoverStart(event: I_InteractionEvent): void {
    const object = event.interactable.object3D;

    // Store current object
    this.currentHoverObject = object;

    // Apply emissive glow to all meshes in the object
    this.applyEmissive(object, this.hoverColor, this.hoverEmissiveIntensity);
  }

  /**
   * Handle hover end - restore original material
   */
  private onHoverEnd(event: I_InteractionEvent): void {
    this.restoreOriginalMaterial();
    this.currentHoverObject = null;
  }

  /**
   * Handle click - flash bright color
   */
  private onClick(event: I_InteractionEvent): void {
    const object = event.interactable.object3D;

    // Apply bright flash
    this.applyEmissive(object, this.clickColor, this.clickEmissiveIntensity);

    // Restore to hover state after 150ms
    setTimeout(() => {
      if (this.currentHoverObject === object) {
        this.applyEmissive(object, this.hoverColor, this.hoverEmissiveIntensity);
      } else {
        this.restoreObjectMaterial(object);
      }
    }, 150);
  }

  /**
   * Apply emissive color to object (recursive for all meshes)
   */
  private applyEmissive(object: Object3D, color: Color, intensity: number): void {
    object.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as any;
        const material = mesh.material;

        // Store original material if not already stored
        if (!this.originalMaterials.has(child)) {
          if (material.emissive) {
            this.originalMaterials.set(child, {
              emissive: material.emissive.clone(),
              emissiveIntensity: material.emissiveIntensity,
            });
          }
        }

        // Apply emissive glow
        if (material.emissive) {
          material.emissive.copy(color);
          material.emissiveIntensity = intensity;
        }
      }
    });
  }

  /**
   * Restore original material for current hover object
   */
  private restoreOriginalMaterial(): void {
    if (!this.currentHoverObject) return;
    this.restoreObjectMaterial(this.currentHoverObject);
  }

  /**
   * Restore original material for specific object
   */
  private restoreObjectMaterial(object: Object3D): void {
    object.traverse((child) => {
      const original = this.originalMaterials.get(child);
      if (original && (child as any).isMesh) {
        const mesh = child as any;
        const material = mesh.material;

        if (material.emissive) {
          material.emissive.copy(original.emissive);
          material.emissiveIntensity = original.emissiveIntensity;
        }

        this.originalMaterials.delete(child);
      }
    });
  }
}
