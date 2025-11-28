import type { CollisionCallbacks, CollisionContext } from "./physics.types";

/**
 * CollisionSystem - Handles collision detection and callback invocation
 *
 * Responsibilities:
 * - Track collision callbacks per object
 * - Detect collisions each frame
 * - Invoke enter/stay/exit callbacks appropriately
 *
 * Performance: Only checks objects that have registered collision callbacks
 */
export class CollisionSystem {
	private handlers = new Map<string, CollisionCallbacks>();
	private activeCollisions = new Map<string, Set<string>>(); // id -> Set of colliding ids

	/**
	 * Register collision callbacks for a GameObject
	 */
	public register(id: string, callbacks: CollisionCallbacks): void {
		this.handlers.set(id, callbacks);
	}

	/**
	 * Unregister collision callbacks
	 */
	public unregister(id: string): void {
		this.handlers.delete(id);
		this.activeCollisions.delete(id);
	}

	/**
	 * Check if any collision handlers are registered
	 */
	public hasHandlers(): boolean {
		return this.handlers.size > 0;
	}

	/**
	 * Detect collisions and invoke callbacks
	 * Called every frame from PhysicsSystem.update()
	 */
	public detect(context: CollisionContext): void {
		// Early exit if no collision handlers registered
		if (this.handlers.size === 0) return;

		const currentFrameCollisions = this.gatherCurrentCollisions(context);
		this.processCollisionCallbacks(currentFrameCollisions);
	}

	/**
	 * Gather all current frame collisions for objects with handlers
	 */
	private gatherCurrentCollisions(context: CollisionContext): Map<string, Set<string>> {
		const { world, colliders, colliderToId } = context;
		const currentFrameCollisions = new Map<string, Set<string>>();

		// Only check objects that have registered collision callbacks
		for (const [id1] of this.handlers) {
			const collider1 = colliders.get(id1);
			if (!collider1) continue;

			// Check all colliders in contact with this one
			world.contactPairsWith(collider1, (collider2) => {
				const id2 = colliderToId.get(collider2.handle);
				if (!id2) return;

				// Track this frame's collisions
				if (!currentFrameCollisions.has(id1)) {
					currentFrameCollisions.set(id1, new Set());
				}
				currentFrameCollisions.get(id1)!.add(id2);
			});
		}

		return currentFrameCollisions;
	}

	/**
	 * Process collision callbacks (enter/stay/exit) based on frame comparison
	 */
	private processCollisionCallbacks(currentFrameCollisions: Map<string, Set<string>>): void {
		for (const [id, handlers] of this.handlers) {
			const currentColliding = currentFrameCollisions.get(id) || new Set<string>();
			const previousColliding = this.activeCollisions.get(id) || new Set<string>();

			// Enter: In current but not in previous
			for (const otherId of currentColliding) {
				if (!previousColliding.has(otherId)) {
					handlers.onCollisionEnter?.(otherId);
				} else {
					// Stay: In both current and previous
					handlers.onCollisionStay?.(otherId);
				}
			}

			// Exit: In previous but not in current
			for (const otherId of previousColliding) {
				if (!currentColliding.has(otherId)) {
					handlers.onCollisionExit?.(otherId);
				}
			}

			// Update active collisions for next frame
			this.activeCollisions.set(id, currentColliding);
		}
	}

	/**
	 * Clear all collision tracking (called on destroy)
	 */
	public clear(): void {
		this.handlers.clear();
		this.activeCollisions.clear();
	}
}
