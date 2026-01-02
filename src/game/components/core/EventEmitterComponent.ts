import { Scene } from "three";
import { GameComponent } from "@/game/GameComponent";

/**
 * EventEmitterComponent - Generic base class for components that emit events
 *
 * Provides a type-safe event emitter pattern for GameComponents.
 * Subclasses define their event map type for compile-time type safety.
 *
 * Usage:
 * ```typescript
 * type MyEvents = {
 *   click: (intersection: Intersection) => void;
 *   hover: (isHovered: boolean) => void;
 * };
 *
 * class MyComponent extends EventEmitterComponent<MyEvents> {
 *   // ...
 *   someMethod() {
 *     this.emit('click', intersection); // Type-safe!
 *   }
 * }
 *
 * // Consumer:
 * myComponent.on('click', (intersection) => { ... });
 * ```
 *
 * @typeParam T - Record mapping event names to callback signatures
 */
export abstract class EventEmitterComponent<T extends Record<string, (...args: any[]) => void>> extends GameComponent {
	protected events = new Map<keyof T, T[keyof T][]>();

	/**
	 * Register event listener
	 *
	 * @param event - Event name (type-checked against T)
	 * @param callback - Function to call when event fires
	 */
	public on<K extends keyof T>(event: K, callback: T[K]): void {
		if (!this.events.has(event)) {
			this.events.set(event, []);
		}
		this.events.get(event)!.push(callback);
	}

	/**
	 * Emit event to all registered listeners
	 *
	 * @param event - Event name (type-checked against T)
	 * @param args - Arguments matching the callback signature
	 */
	protected emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
		const callbacks = this.events.get(event);
		if (callbacks) {
			callbacks.forEach((cb) => (cb as (...args: any[]) => void)(...args));
		}
	}

	/**
	 * Cleanup - clears all event listeners
	 *
	 * Subclasses should call super.destroy(scene) AFTER their own cleanup:
	 * ```typescript
	 * destroy(scene: Scene): void {
	 *   this.unregisterFromService();  // Own cleanup first
	 *   super.destroy(scene);          // Then clear events
	 * }
	 * ```
	 */
	public destroy(scene: Scene): void {
		this.events.clear();
		super.destroy(scene);
	}
}
