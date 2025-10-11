import { useRxjs } from "topsyde-utils";

export default class SceneModule {
    public name: string = this.constructor.name;
    protected rxjs = useRxjs('module:loading');

    constructor(moduleName?: string) {
        if (moduleName) {
            this.name = moduleName;
        }
    }

    /**
     * Set module name (called by GameScene.addModule)
     */
    public setName(name: string): void {
        this.name = name;
    }

    protected initialized(sceneName: string) {
        setTimeout(() => {
            this.rxjs.$next('loaded', {
                moduleName: this.name,
                sceneName: sceneName,
            });
        }, Math.random() * 333); // Simulated delay
    }
}