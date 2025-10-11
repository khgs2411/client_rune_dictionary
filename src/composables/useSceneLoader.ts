import { ref, computed } from 'vue';
import { useRxjs } from 'topsyde-utils';
import type {
  SceneLoadingEvents,
  SceneLoadingStartPayload,
  SceneLoadingProgressPayload,
  SceneLoadedPayload,
  SceneErrorPayload,
} from '@/common/events.types';

/**
 * Scene Loader Composable
 * Provides event-driven loading state management using RxJS
 */
export function useSceneLoader() {
  const isLoading = ref(false);
  const progress = ref(0);
  const loadedAssets = ref(0);
  const totalAssets = ref(0);
  const currentAsset = ref('');
  const sceneName = ref('');
  const error = ref<string | null>(null);
  const loadStartTime = ref(0);

  const loadingPercentage = computed(() => `${Math.round(progress.value)}%`);
  const isComplete = computed(() => progress.value >= 100 && !isLoading.value);

  // Setup RxJS event bus for loading events
  const { $next } = useRxjs<SceneLoadingEvents>(
    ['scene:loading', 'scene:progress', 'scene:loaded', 'scene:error'],
    {
      'scene:loading': {
        start: (data: SceneLoadingStartPayload) => {
          isLoading.value = true;
          progress.value = 0;
          loadedAssets.value = 0;
          totalAssets.value = data.totalAssets;
          sceneName.value = data.sceneName;
          error.value = null;
          loadStartTime.value = performance.now();
          console.log(`🎬 [SceneLoader] Loading ${data.sceneName}...`);
        },
      },
      'scene:progress': {
        update: (data: SceneLoadingProgressPayload) => {
          loadedAssets.value = data.loaded;
          totalAssets.value = data.total;
          progress.value = data.progress;
          currentAsset.value = data.url || '';
          console.log(`⏳ [SceneLoader] Progress: ${data.progress.toFixed(1)}%`);
        },
      },
      'scene:loaded': {
        complete: (data: SceneLoadedPayload) => {
          isLoading.value = false;
          progress.value = 100;
          const loadTime = (performance.now() - loadStartTime.value).toFixed(0);
          console.log(`✅ [SceneLoader] ${data.sceneName} loaded in ${loadTime}ms`);
        },
      },
      'scene:error': {
        fail: (data: SceneErrorPayload) => {
          isLoading.value = false;
          error.value = data.error;
          console.error(`❌ [SceneLoader] Error loading ${data.sceneName}:`, data.error);
        },
      },
    }
  );

  /**
   * Emit loading start event
   */
  function emitLoadingStart(sceneName: string, totalAssets = 0) {
    $next('scene:loading', {
      cta: 'start',
      data: { sceneName, totalAssets },
    });
  }

  /**
   * Emit loading progress event
   */
  function emitLoadingProgress(
    sceneName: string,
    loaded: number,
    total: number,
    url?: string
  ) {
    const progressPercent = total > 0 ? (loaded / total) * 100 : 0;
    $next('scene:progress', {
      cta: 'update',
      data: {
        sceneName,
        loaded,
        total,
        progress: progressPercent,
        url,
      },
    });
  }

  /**
   * Emit loading complete event
   */
  function emitLoadingComplete(sceneName: string) {
    const loadTime = performance.now() - loadStartTime.value;
    $next('scene:loaded', {
      cta: 'complete',
      data: { sceneName, loadTime },
    });
  }

  /**
   * Emit loading error event
   */
  function emitLoadingError(sceneName: string, errorMessage: string, url?: string) {
    $next('scene:error', {
      cta: 'fail',
      data: { sceneName, error: errorMessage, url },
    });
  }

  return {
    // State
    isLoading,
    progress,
    loadedAssets,
    totalAssets,
    currentAsset,
    sceneName,
    error,
    loadingPercentage,
    isComplete,

    // Emitters (for scene/engine to use)
    emitLoadingStart,
    emitLoadingProgress,
    emitLoadingComplete,
    emitLoadingError,
  };
}
