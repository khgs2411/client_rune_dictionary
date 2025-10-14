import { useWebSocketStore, WebsocketManager } from "@/stores/websocket.store";
import { I_SceneContext } from "../common/scenes.types";
import SceneService from "./SceneService";
import { watch } from "vue";

export default class NetworkingService extends SceneService {
    private websocketManager: WebsocketManager;

    constructor() {
        super();
        this.websocketManager = useWebSocketStore();
        
    }

    protected init(context: I_SceneContext): void | Promise<void> {
        const ws = this.websocketManager.getWebSocketInstance();
        if (ws) {
            console.log("🌐 [NetworkingService] Initialized with context:", context);
            const watcher = watch(() => ws.data, (newVal) => {
                console.error("!!!WebSocket Data Changed:", newVal);
            });
        }
    }
    public destroy(): void | Promise<void> {
        
    }
}