import { I_SceneContext } from "../common/scenes.types";
import SceneService from "./SceneService";

export default class NetworkingService extends SceneService {
    protected init(context: I_SceneContext): void | Promise<void> {
        throw new Error("Method not implemented.");
    }
    public destroy(): void | Promise<void> {
        throw new Error("Method not implemented.");
    }
}