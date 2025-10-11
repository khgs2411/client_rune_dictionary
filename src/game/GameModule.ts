import { useRxjs } from "topsyde-utils";

export default class GameModule {
    public readonly name: string = this.constructor.name;
    protected rxjs = useRxjs('module:loading');
    constructor(moduleName: string) {
        this.name = moduleName;
    }

    protected initialized(sceneName: string) {
        setTimeout(() => {
            this.rxjs.$next('loaded', {
                moduleName: this.name,
                sceneName: sceneName,
            });
        }, Math.random() * 1000 + 500); // Simulated delay
    }
}