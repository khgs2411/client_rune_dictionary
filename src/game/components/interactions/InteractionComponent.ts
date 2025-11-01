import type { I_SceneContext } from '@/game/common/scenes.types';
import { ComponentPriority, GameComponent } from '@/game/GameComponent';
import type { Intersection } from 'three';
import { MeshComponent } from '../rendering/MeshComponent';

export type InteractionEventCallback = (intersection: Intersection) => void;

/**
 * InteractionComponent - Generic interaction event proxy layer
 *
 * Provides a clean event emitter API for GameObject interactions.
 * Abstracts InteractionService complexity and provides reusable interaction events.
 *
 * This is like InteractionService but scoped to a specific GameObject.
 * Other components can require this component and listen to interaction events.
 *
 * Supported Events:
 * - 'click': Single left-click on GameObject
 * - 'doubleclick': Double left-click on GameObject (within 300ms)
 *
 * Usage:
 * ```typescript
 * // In another component (e.g., MatchComponent)
 * const interaction = this.requireComponent(InteractionComponent);
 *
 * interaction.on('click', (intersection) => {
 *   console.log('Clicked at:', intersection.point);
 * });
 *
 * interaction.on('doubleclick', (intersection) => {
 *   console.log('Double-clicked!');
 * });
 * ```
 *
 * Architecture:
 * - Requires MeshComponent for raycasting
 * - Registers with InteractionService
 * - Emits custom events to listeners
 * - Handles double-click detection internally
 *
 * Priority: INTERACTION (300) - Runs after rendering and physics
 */
export class InteractionComponent extends GameComponent {
  public readonly priority = ComponentPriority.INTERACTION;

  // Event emitter
  private events = new Map<string, InteractionEventCallback[]>();

  // Double-click detection state
  private lastClickTime = 0;
  private readonly DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

  // Unregister functions from InteractionService
  private unregisterClick?: () => void;
  private unregisterHover?: () => void;

  public async init(context: I_SceneContext): Promise<void> {
    this.registerInteractions(context);
  }

  /**
   * Register event listener
   *
   * @param event - Event type ('click' or 'doubleclick')
   * @param callback - Function to call when event fires
   */
  public on(event: 'click' | 'doubleclick', callback: InteractionEventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  private registerInteractions(context: I_SceneContext): void {
    // Require MeshComponent for raycasting
    const meshComp = this.requireComponent(MeshComponent);
    // Get InteractionService
    const interaction = context.getService('interaction');

    // Register hover handler (required for hover detection to work!)
    // We don't need callbacks, just need object in hover system for raycasting
    this.unregisterHover = interaction.registerHover(
      `${this.gameObject.id}-interaction-hover`,
      meshComp.mesh,
      {
        onStart: () => {
          // Optional: Could emit 'hoverstart' event here if needed
        },
        onEnd: () => {
          // Optional: Could emit 'hoverend' event here if needed
        },
      },
    );

    // Register click handler with requireHover
    this.unregisterClick = interaction.registerMouseClick(
      `${this.gameObject.id}-interaction-click`,
      'left',
      this.onClick.bind(this),
      {
        requireHover: true,
        object3D: meshComp.mesh,
      },
    );
  }

  /**
   * Emit event to all registered listeners
   */
  private emit(event: string, intersection: Intersection): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(intersection));
    }
  }

  /**
   * Handle click event from InteractionService
   * @param _event
   * @param intersection
   * @returns void
   */
  private onClick(_event: MouseEvent, intersection: Intersection | undefined): void {
    if (!intersection) return;

    // Always emit 'click' event
    this.emit('click', intersection);

    // Double-click detection
    const now = Date.now();
    const timeSinceLastClick = now - this.lastClickTime;

    if (timeSinceLastClick < this.DOUBLE_CLICK_THRESHOLD) {
      // Double-click detected!
      this.emit('doubleclick', intersection);
      this.lastClickTime = 0; // Reset to prevent triple-click
    } else {
      // Single click (start timer for potential double-click)
      this.lastClickTime = now;
    }
  }

  public destroy(): void {
    // Unregister from InteractionService
    if (this.unregisterClick) {
      this.unregisterClick();
    }
    if (this.unregisterHover) {
      this.unregisterHover();
    }

    // Clear all event listeners
    this.events.clear();

    console.log(
      `👆 [InteractionComponent] Unregistered interaction events for GameObject "${this.gameObject.id}"`,
    );
  }
}
