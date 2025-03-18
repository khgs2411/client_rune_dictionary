/**
 * Utility functions to detect popup blockers and extensions that might interfere with connections
 */

/**
 * Tests if popup windows can be opened (blocked by popup blockers)
 * @returns Promise that resolves to an object with test results
 */
export const testPopupBlocker = async (): Promise<{ blocked: boolean; message: string }> => {
	return new Promise((resolve) => {
		// Try to open a small popup window
		const popup = window.open("about:blank", "_blank", "width=100,height=100");

		if (!popup || popup.closed || typeof popup.closed === "undefined") {
			resolve({
				blocked: true,
				message: "Popup blocker detected. Please allow popups for this site.",
			});
		} else {
			// Close the test popup
			popup.close();
			resolve({
				blocked: false,
				message: "No popup blocker detected.",
			});
		}
	});
};

/**
 * Tests if WebSocket connections can be established
 * @param url The WebSocket URL to test
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise that resolves to an object with test results
 */
export const testWebSocketConnection = async (url: string, timeoutMs = 5000): Promise<{ success: boolean; message: string }> => {
	return new Promise((resolve) => {
		try {
			const ws = new WebSocket(url);
			const timeoutId = setTimeout(() => {
				if (ws.readyState !== WebSocket.OPEN) {
					ws.close();
					resolve({
						success: false,
						message: "WebSocket connection timed out. This might be caused by an extension or firewall blocking the connection.",
					});
				}
			}, timeoutMs);

			ws.onopen = () => {
				clearTimeout(timeoutId);
				ws.close();
				resolve({
					success: true,
					message: "WebSocket connection successful.",
				});
			};

			ws.onerror = () => {
				clearTimeout(timeoutId);
				ws.close();
				resolve({
					success: false,
					message: "WebSocket connection failed. This might be caused by an extension or firewall blocking the connection.",
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
 * Runs a comprehensive connection diagnostic
 * @param options Configuration options
 * @param options.wsUrl Optional WebSocket URL to test (defaults to the environment variable)
 * @param options.testPopups Whether to test for popup blockers (defaults to false)
 * @returns Promise that resolves to an object with all test results
 */
export const runConnectionDiagnostics = async (options?: {
	wsUrl?: string;
	testPopups?: boolean;
}): Promise<{
	popupBlocker?: { blocked: boolean; message: string };
	webSocket: { success: boolean; message: string };
}> => {
	const websocketUrl = options?.wsUrl || import.meta.env.VITE_WS_HOST || "wss://topsyde-gaming.duckdns.org:3000";
	const shouldTestPopups = options?.testPopups ?? false;

	// Only run popup test if explicitly requested
	const popupTest = shouldTestPopups ? await testPopupBlocker() : undefined;
	const wsTest = await testWebSocketConnection(websocketUrl);

	return {
		...(popupTest && { popupBlocker: popupTest }),
		webSocket: wsTest,
	};
};
