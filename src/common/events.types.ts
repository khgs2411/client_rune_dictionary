import { I_RxjsPayload, RxjsDataType } from "topsyde-utils";


export type SceneLoadingEvent = RxjsDataType & {
  sceneName: string;
  assetName?: string; // Currently loading asset
}

/**
 * Loading event payloads
 */
export type SceneLoadingStartPayload = SceneLoadingEvent &{
  totalAssets: number;
}

export type SceneLoadingProgressPayload = SceneLoadingEvent & {
  loaded: number;
}

export type SceneErrorPayload = SceneLoadingEvent &{
  error: string;
}
