/**
 * Scene Loading Event Types
 */
export type SceneLoadingEvents =
  | 'scene:loading'
  | 'scene:progress'
  | 'scene:loaded'
  | 'scene:error';

/**
 * Loading event payloads
 */
export interface SceneLoadingStartPayload {
  sceneName: string;
  totalAssets: number;
}

export interface SceneLoadingProgressPayload {
  sceneName: string;
  loaded: number;
  total: number;
  progress: number; // 0-100
  url?: string; // Currently loading asset
}

export interface SceneLoadedPayload {
  sceneName: string;
  loadTime: number; // milliseconds
}

export interface SceneErrorPayload {
  sceneName: string;
  error: string;
  url?: string;
}
