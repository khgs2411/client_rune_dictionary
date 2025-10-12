/**
 * Scene Loading Events (scene-level progress)
 */
export interface SceneLoadingEvent extends Record<string, any> {
  sceneName: string;
  assetName?: string; // Currently loading asset
}

export interface SceneLoadingStartPayload extends SceneLoadingEvent {
  totalAssets: number;
}

export interface SceneLoadingProgressPayload extends SceneLoadingEvent {
  loaded: number;
}

export interface SceneErrorPayload extends SceneLoadingEvent {
  error: string;
}

export interface SceneLoadedPayload extends SceneLoadingEvent {
  loadTime: number; // in ms
  progress: number; // final progress (should be 100)
}

/**
 * Module Loading Events (module-level progress)
 * Emitted by individual modules when they complete initialization
 */
export interface ModuleLoadingEvent extends Record<string, any> {
  moduleName: string;
  sceneName: string;
}

export interface ModuleLoadingProgressPayload extends ModuleLoadingEvent {
  progress?: number; // Optional: 0-100
  assetName?: string; // Optional: currently loading asset
}

export interface I_DebugConsoleEvent {
  type: string;
  data: any;
  timestamp: string;
}
