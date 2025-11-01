import { I_SceneContext } from '../common/scenes.types';

export default abstract class SceneService {
  protected context!: I_SceneContext;
  /**
   * Initializes the module with the provided context.
   * This method must be implemented by subclasses to perform any setup or initialization logic required for the module.
   * It can be asynchronous if needed.
   *
   * @param context - The context object containing information and dependencies required by the module.
   * @returns A void or a Promise that resolves when initialization is complete.
   */
  protected abstract init(context: I_SceneContext): void | Promise<void>;

  /**
   * Initialize the module
   * @param context Module Context
   */
  public async start(context: I_SceneContext): Promise<void> {
    this.context = context;
    await this.init(context);
  }

  public abstract destroy(): void | Promise<void>;
}
