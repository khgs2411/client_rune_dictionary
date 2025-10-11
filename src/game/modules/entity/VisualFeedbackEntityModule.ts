import { EntityModule } from '@/game/EntityModule';
import { I_ModuleContext } from '@/scenes/scenes.types';
import { Object3D, Color } from 'three';
import { useRxjs } from 'topsyde-utils';
import type { I_InteractionEvent } from './interaction.types';

/**
 * Visual Feedback Entity Module
 * Provides visual feedback for interactions (hover glow, click flash)
 * Subscribes to InteractionEntityModule events and applies visual effects
 *
 * Features:
 * - Hover: Faint orange outline/emissive glow
 * - Click: Bright flash effect
 */
export class VisualFeedbackEntityModule extends EntityModule {
  private events = useRxjs('interaction');

  // Track current hover object for cleanup
  private currentHoverObject: Object3D | null = null;
  private originalMaterials = new Map<Object3D, any>();

  // Track active timeouts to prevent stuck states
  private activeTimeouts = new Map<Object3D, number>();

  // Colors
  private hoverColor = new Color(0xff8c00); // Orange
  private clickColor = new Color(0xffff00); // Yellow
  private hoverEmissiveIntensity = 0.3;
  private clickEmissiveIntensity = 0.8;

  constructor() {
    super('visualFeedback');
  }

  async start(context: I_ModuleContext): Promise<void> {
    // Subscribe to interaction events
    this.events.$subscribe({
      'hover-start': (event: I_InteractionEvent) => this.onHoverStart(event),
      'hover-end': (event: I_InteractionEvent) => this.onHoverEnd(event),
      click: (event: I_InteractionEvent) => this.onClick(event),
    });

    console.log('✨ [VisualFeedbackEntityModule] Initialized');
  }

  update(): void {
    // No per-frame updates needed (event-driven)
  }

  async destroy(): Promise<void> {
    this.events.$unsubscribe();

    // Clear all active timeouts
    this.activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.activeTimeouts.clear();

    this.restoreOriginalMaterial();
    this.originalMaterials.clear();
  }

  /**
   * Handle hover start - apply faint glow
   */
  private onHoverStart(event: I_InteractionEvent): void {
    const object = event.interactable.object3D;

    console.log('🟠 Hover START:', event.interactable.id, object.uuid);

    // Cancel any existing timeout for this object
    const existingTimeout = this.activeTimeouts.get(object);
    if (existingTimeout) {
      console.log('  ↳ Cancelling existing timeout');
      clearTimeout(existingTimeout);
      this.activeTimeouts.delete(object);
    }

    // Store current object
    this.currentHoverObject = object;

    // Apply emissive glow to all meshes in the object
    this.applyEmissive(object, this.hoverColor, this.hoverEmissiveIntensity);
  }

  /**
   * Handle hover end - restore original material
   */
  private onHoverEnd(event: I_InteractionEvent): void {
    const object = event.interactable.object3D;

    console.log('🔵 Hover END:', event.interactable.id, object.uuid);

    // Cancel any pending click timeout for this object
    const timeoutId = this.activeTimeouts.get(object);
    if (timeoutId) {
      console.log('  ↳ Cancelling pending timeout');
      clearTimeout(timeoutId);
      this.activeTimeouts.delete(object);
    } else {
      console.log('  ↳ No active timeout to cancel');
    }

    // Only clear if this is the current hover object
    if (this.currentHoverObject === object) {
      console.log('  ↳ Restoring original material');
      this.restoreOriginalMaterial();
      this.currentHoverObject = null;
    } else {
      console.warn('  ⚠️ Hover end for non-current object!', {
        current: this.currentHoverObject?.uuid,
        ended: object.uuid
      });
    }
  }

  /**
   * Handle click - flash bright color
   */
  private onClick(event: I_InteractionEvent): void {
    const object = event.interactable.object3D;

    console.log('🟡 Click:', event.interactable.id, object.uuid);

    // Cancel any existing timeout for this object
    const existingTimeout = this.activeTimeouts.get(object);
    if (existingTimeout) {
      console.log('  ↳ Cancelling existing click timeout');
      clearTimeout(existingTimeout);
    }

    // Apply bright flash
    this.applyEmissive(object, this.clickColor, this.clickEmissiveIntensity);

    // Restore to hover state after 150ms
    const timeoutId = window.setTimeout(() => {
      console.log('⏱️ Click timeout fired for:', object.uuid);

      // Remove from active timeouts
      this.activeTimeouts.delete(object);

      if (this.currentHoverObject === object) {
        // Still hovering - restore to hover color
        console.log('  ↳ Still hovering, restoring to hover color');
        this.applyEmissive(object, this.hoverColor, this.hoverEmissiveIntensity);
      } else {
        // Not hovering anymore - restore original
        console.log('  ↳ Not hovering, restoring original material');
        this.restoreObjectMaterial(object);
      }
    }, 150);

    // Track this timeout
    this.activeTimeouts.set(object, timeoutId);
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
    let restoredCount = 0;
    object.traverse((child) => {
      const original = this.originalMaterials.get(child);
      if (original && (child as any).isMesh) {
        const mesh = child as any;
        const material = mesh.material;

        if (material.emissive) {
          material.emissive.copy(original.emissive);
          material.emissiveIntensity = original.emissiveIntensity;
          restoredCount++;
        }

        // DON'T delete from map - we might need it again
        // Only delete on destroy() or when object is removed from scene
      }
    });
    console.log(`  ↳ Restored ${restoredCount} materials for object ${object.uuid}`);
  }
}
