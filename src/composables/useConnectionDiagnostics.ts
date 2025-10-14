import { ref } from 'vue';

export interface DiagnosticResult {
  success: boolean;
  message: string;
}

export interface DiagnosticResults {
  popupBlocker?: { blocked: boolean; message: string };
  webSocket: DiagnosticResult;
}

/**
 * Tests if popup windows can be opened (blocked by popup blockers)
 */
export const testPopupBlocker = async (): Promise<{ blocked: boolean; message: string }> => {
  return new Promise((resolve) => {
    const popup = window.open('about:blank', '_blank', 'width=100,height=100');

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      resolve({
        blocked: true,
        message: 'Popup blocker detected. Please allow popups for this site.',
      });
    } else {
      popup.close();
      resolve({
        blocked: false,
        message: 'No popup blocker detected.',
      });
    }
  });
};

/**
 * Tests if WebSocket connections can be established
 * @param url The WebSocket URL to test
 * @param protocol Optional protocol string for authentication
 * @param timeoutMs Timeout in milliseconds
 */
export const testWebSocketConnection = async (
  url: string,
  protocol?: string,
  timeoutMs = 5000,
): Promise<DiagnosticResult> => {
  return new Promise((resolve) => {
    try {
      const ws = protocol ? new WebSocket(url, protocol) : new WebSocket(url);

      const timeoutId = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          resolve({
            success: false,
            message: 'WebSocket connection timed out. This might be caused by a browser extension or firewall blocking the connection.',
          });
        }
      }, timeoutMs);

      ws.onopen = () => {
        clearTimeout(timeoutId);
        ws.close();
        resolve({
          success: true,
          message: 'WebSocket connection successful.',
        });
      };

      ws.onerror = () => {
        clearTimeout(timeoutId);
        ws.close();
        resolve({
          success: false,
          message: 'WebSocket connection failed. This might be caused by a browser extension or firewall blocking the connection.',
        });
      };
    } catch (error) {
      resolve({
        success: false,
        message: `WebSocket connection error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });
};

/**
 * Composable for running connection diagnostics
 */
export function useConnectionDiagnostics() {
  const loading = ref(false);
  const results = ref<DiagnosticResults>({
    webSocket: { success: false, message: '' },
  });

  /**
   * Runs comprehensive connection diagnostics
   */
  const runDiagnostics = async (options?: {
    wsUrl?: string;
    protocol?: string;
    testPopups?: boolean;
  }): Promise<DiagnosticResults> => {
    loading.value = true;

    const websocketUrl = options?.wsUrl || import.meta.env.VITE_WS_HOST || 'wss://topsyde-gaming.duckdns.org:3000';
    const shouldTestPopups = options?.testPopups ?? false;

    // Only run popup test if explicitly requested
    const popupTest = shouldTestPopups ? await testPopupBlocker() : undefined;
    const wsTest = await testWebSocketConnection(websocketUrl, options?.protocol);

    results.value = {
      ...(popupTest && { popupBlocker: popupTest }),
      webSocket: wsTest,
    };

    loading.value = false;
    return results.value;
  };

  /**
   * Checks if there are any connection issues
   */
  const hasIssues = (): boolean => {
    const hasWebSocketIssue = !results.value.webSocket.success;
    const hasPopupBlockerIssue = results.value.popupBlocker?.blocked === true;
    return hasWebSocketIssue || hasPopupBlockerIssue;
  };

  return {
    loading,
    results,
    runDiagnostics,
    hasIssues,
  };
}
