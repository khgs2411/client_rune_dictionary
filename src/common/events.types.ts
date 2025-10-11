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
  url?: string; // Currently loading asset
}

export interface SceneLoadedPayload {
  sceneName: string;
}

export interface SceneErrorPayload {
  sceneName: string;
  error: string;
  url?: string;
}
