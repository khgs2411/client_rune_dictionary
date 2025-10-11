import { I_RxjsPayload, RxjsDataType } from "topsyde-utils";


export interface SceneLoadingEvent extends Record<string, any> {
  sceneName: string;
  assetName?: string; // Currently loading asset
}

/**
 * Loading event payloads
 */
export interface SceneLoadingStartPayload extends SceneLoadingEvent {
  totalAssets: number;
}

export interface SceneLoadingProgressPayload extends SceneLoadingEvent {
  loaded: number;
}

export interface SceneErrorPayload extends SceneLoadingEvent {
  error: string;
}
