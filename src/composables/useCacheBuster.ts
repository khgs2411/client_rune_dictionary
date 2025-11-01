import { useUrlSearchParams } from '@vueuse/core';
import { watch } from 'vue';
import { useRouter } from 'vue-router';

// Extract version from main.ts comment (auto-updated by deploy script)
// Format: // @version: 0.6.8 - This comment is auto-updated by deploy script
const VERSION = '0.6.12'; // This will be auto-updated by deploy script

/**
 * Composable to manage cache-busting via URL query parameter
 * Automatically appends current app version to URL to force fresh loads
 */
export function useCacheBuster() {
  const router = useRouter();
  const params = useUrlSearchParams('history');

  /**
   * Ensures the current URL has the version query parameter
   * If version is missing or outdated, updates the URL
   */
  function ensureVersion() {
    const currentVersion = params.v as string | undefined;

    if (currentVersion !== VERSION) {
      console.log(`[CacheBuster] Updating version: ${currentVersion} → ${VERSION}`);
      params.v = VERSION;
    }
  }

  /**
   * Force a hard reload with the current version
   * Useful when critical updates are deployed
   */
  function forceReload() {
    const url = new URL(window.location.href);
    url.searchParams.set('v', VERSION);
    window.location.href = url.toString();
  }

  // Watch for route changes and ensure version is always present
  watch(
    () => router.currentRoute.value.fullPath,
    () => {
      ensureVersion();
    },
    { immediate: true },
  );

  return {
    version: VERSION,
    ensureVersion,
    forceReload,
  };
}
