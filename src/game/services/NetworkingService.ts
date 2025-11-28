import { useWebSocketStore, WebsocketManager } from "@/stores/websocket.store";
import { WebsocketStructuredMessage } from "topsyde-utils";
import { I_SceneContext, I_SceneSystem } from "../common/scenes.types";
import SceneService from "./SceneService";

/**
 * Network event categories that can be subscribed to
 */
export enum E_NetworkEventCategory {
	SCENE = "scene",
	PLAYER = "player",
	MULTIPLAYER = "multiplayer",
	POSITION = "position",
}

/**
 * Callback signature for network event handlers
 */
export type NetworkEventCallback = (message: WebsocketStructuredMessage) => void | Promise<void>;

/**
 * Map of event categories to their handlers
 */
export type NetworkEventHandlers = Partial<Record<E_NetworkEventCategory, NetworkEventCallback>>;

/**
 * NetworkingService - Facade/Filter layer for WebSocket messages
 *
 * This service sits between the WebSocket store and game modules, filtering
 * and routing messages based on their type prefix (e.g., 'scene.', 'player.', etc.)
 *
 * Architecture:
 * WebSocket Store → NetworkingService → Game Modules (MultiplayerModule, etc.)
 *
 * Benefits:
 * - Centralized message filtering logic
 * - Type-safe event routing
 * - Decouples modules from raw WebSocket messages
 * - Easy to add new event categories
 *
 * @example
 * ```typescript
 * // In a module:
 * networkingService.register('MultiplayerModule', {
 * });
 * ```
 */
export default class NetworkingService extends SceneService implements I_SceneSystem {
	private websocketManager: WebsocketManager;
	private registry: Map<string, NetworkEventHandlers> = new Map();

	constructor() {
		super();
		this.websocketManager = useWebSocketStore();
	}

	public send(category: E_NetworkEventCategory, content: any): void {
		//verify category matches message type prefix
		if (!this.websocketManager.clientData) {
			throw new Error("Cannot send message: clientData is missing");
		}
		const ws = this.websocketManager.getWebSocketInstance();
		const wsm: WebsocketStructuredMessage = {
			type: "multiplayer",
			content: { category, ...content },
			client: {
				id: this.websocketManager.clientData?.id,
				name: this.websocketManager.clientData?.name,
			},
		};
		ws?.send(JSON.stringify(wsm));
	}

	/**
	 * Initialize service and register with WebSocket store
	 */
	protected async init(context: I_SceneContext): Promise<void> {
		this.websocketManager.register("NetworkingService", {
			data: async (ws: WebSocket, message: WebsocketStructuredMessage) => {
				await this.routeMessage(message);
			},
		});
	}

	/**
	 * Route incoming message to registered handlers based on type prefix
	 */
	private async routeMessage(message: WebsocketStructuredMessage): Promise<void> {
		const category = this.extractCategory(message.type);

		if (!category) {
			// Message type doesn't match any category, ignore
			return;
		}

		// Collect all handlers for this category
		const promises: Promise<void>[] = [];

		this.registry.forEach((handlers, source) => {
			const handler = handlers[category];
			if (handler) {
				promises.push(
					Promise.resolve(handler(message)).catch((error) => {
						console.error(`[NetworkingService] Handler error in "${source}" for category "${category}":`, error);
					}),
				);
			}
		});

		// Execute all handlers in parallel
		await Promise.all(promises);
	}

	/**
	 * Extract event category from message type
	 *
	 * Examples:
	 * - 'scene.load' → E_NetworkEventCategory.SCENE
	 * - 'player.move' → E_NetworkEventCategory.PLAYER
	 * - 'multiplayer.sync' → E_NetworkEventCategory.MULTIPLAYER
	 * - 'position.update' → E_NetworkEventCategory.POSITION
	 * - 'unknown.type' → null (filtered out)
	 */
	private extractCategory(messageType: string): E_NetworkEventCategory | null {
		const prefix = messageType.split(".")[0].toLowerCase();

		switch (prefix) {
			case "scene":
				return E_NetworkEventCategory.SCENE;
			case "player":
				return E_NetworkEventCategory.PLAYER;
			case "multiplayer":
				return E_NetworkEventCategory.MULTIPLAYER;
			case "position":
				return E_NetworkEventCategory.POSITION;
			default:
				return null;
		}
	}

	/**
	 * Register a module to receive network events
	 *
	 * @param source - Unique identifier for the module (e.g., 'MultiplayerModule')
	 * @param handlers - Map of event categories to handler functions
	 *
	 * @example
	 * ```typescript
	 * networkingService.register('MultiplayerModule', {
	 *   [E_NetworkEventCategory.SCENE]: async (msg) => {
	 *   },
	 *   [E_NetworkEventCategory.PLAYER]: async (msg) => {
	 *   },
	 * });
	 * ```
	 */
	public register(source: string, handlers: NetworkEventHandlers): void {
		if (!source || typeof source !== "string") {
			throw new Error("[NetworkingService] Registration failed: source must be a non-empty string");
		}

		if (this.registry.has(source)) {
			console.warn(`[NetworkingService] Overwriting existing handlers for "${source}"`);
		}

		// Validate handlers
		Object.entries(handlers).forEach(([category, handler]) => {
			if (handler && typeof handler !== "function") {
				throw new Error(`[NetworkingService] Handler for category "${category}" in "${source}" must be a function`);
			}
		});

		this.registry.set(source, handlers);

		const categories = Object.keys(handlers).join(", ");
	}

	/**
	 * Unregister a module from receiving network events
	 *
	 * @param source - Unique identifier for the module
	 */
	public unregister(source: string): void {
		if (this.registry.delete(source)) {
		} else {
			console.warn(`[NetworkingService] Attempted to unregister unknown source: "${source}"`);
		}
	}

	/**
	 * Cleanup service and unregister from WebSocket store
	 */
	public async destroy(): Promise<void> {
		this.websocketManager.unregister("NetworkingService");
		this.registry.clear();
	}

	/**
	 * Get list of registered sources (for debugging)
	 */
	public getRegisteredSources(): string[] {
		return Array.from(this.registry.keys());
	}

	/**
	 * Get count of registered sources (for debugging)
	 */
	public getRegisteredCount(): number {
		return this.registry.size;
	}

	/**
	 * Check if a source is registered
	 */
	public isRegistered(source: string): boolean {
		return this.registry.has(source);
	}

	public getClientData() {
		return this.websocketManager.clientData;
	}
}
