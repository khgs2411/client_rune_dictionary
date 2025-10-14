import { useWebSocketStore, WebsocketManager } from "@/stores/websocket.store";
import { I_SceneContext, I_SceneService } from "../common/scenes.types";
import SceneService from "./SceneService";

export default class NetworkingService extends SceneService implements I_SceneService {
    private websocketManager: WebsocketManager;

    constructor() {
        super();
        this.websocketManager = useWebSocketStore();
        console.log('[NetworkingService] Initialized');
    }

    protected init(context: I_SceneContext): void | Promise<void> {
        this.websocketManager.register('NetworkingService', {
            data: async (ws: WebSocket, message) => {
                console.log('[NetworkingService] Received message:', message);
            },
        });
    }

    public destroy(): void | Promise<void> {
        this.websocketManager.unregister('NetworkingService');
        console.log('[NetworkingService] Destroyed');
    }
}