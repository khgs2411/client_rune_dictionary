/**
 * CSS Performance Optimization Utilities
 */

/**
 * Preload critical fonts
 */
export function preloadFonts(): void {
	// Only preload fonts that actually exist
	const fonts = [{ url: "/node_modules/primeicons/fonts/primeicons.woff2", check: true }];

	fonts.forEach(({ url, check }) => {
		if (!document.querySelector(`link[href="${url}"]`)) {
			if (check) {
				// Check if font URL is accessible
				fetch(url, { method: "HEAD" })
					.then((response) => {
						if (response.ok) {
							const link = document.createElement("link");
							link.rel = "preload";
							link.as = "font";
							link.type = "font/woff2";
							link.href = url;
							link.crossOrigin = "anonymous";
							document.head.appendChild(link);
						}
					})
					.catch(() => {
						// Font not available, skip preloading
					});
			}
		}
	});
}

/**
 * Remove unused CSS custom properties to reduce memory
 */
export function cleanupUnusedCSSVariables(): void {
	if (process.env.NODE_ENV !== "production") return;

	const root = document.documentElement;
	const computedStyle = getComputedStyle(root);
	const usedVariables = new Set<string>();

	// Collect all CSS custom properties in use
	document.querySelectorAll("*").forEach((element) => {
		const styles = getComputedStyle(element);
		const styleSheet = Array.from(document.styleSheets).flatMap((sheet) => {
			try {
				return Array.from(sheet.cssRules || []);
			} catch {
				return [];
			}
		});

		// Check computed styles
		for (let i = 0; i < styles.length; i++) {
			const value = styles.getPropertyValue(styles[i]);
			const matches = value.match(/var\(([^)]+)\)/g);
			if (matches) {
				matches.forEach((match) => {
					const varName = match.slice(4, -1).split(",")[0].trim();
					usedVariables.add(varName);
				});
			}
		}
	});

	// Remove unused variables (keeping essential ones)
	const essentialPrefixes = ["--p-", "--color-", "--spacing-", "--radius-", "--shadow-"];
	for (let i = 0; i < computedStyle.length; i++) {
		const prop = computedStyle[i];
		if (prop.startsWith("--") && !usedVariables.has(prop) && !essentialPrefixes.some((prefix) => prop.startsWith(prefix))) {
			root.style.removeProperty(prop);
		}
	}
}

/**
 * Lazy load non-critical CSS
 */
export function lazyLoadCSS(href: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		link.onload = () => resolve();
		link.onerror = reject;

		// Add media="print" initially to load without blocking
		link.media = "print";
		document.head.appendChild(link);

		// Switch to all media after load
		link.onload = () => {
			link.media = "all";
			resolve();
		};
	});
}

/**
 * Optimize animations based on user preferences
 */
export function optimizeAnimations(): void {
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (prefersReducedMotion) {
		document.documentElement.style.setProperty("--animation-critical", "0ms");
		document.documentElement.style.setProperty("--animation-transition", "0ms");
		document.documentElement.style.setProperty("--animation-decorative", "0ms");
		document.documentElement.classList.add("reduce-motion");
	}

	// Disable animations on low-end devices
	if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
		document.documentElement.classList.add("low-performance");
	}
}

/**
 * Enable CSS containment for better performance
 */
export function enableCSSContainment(): void {
	// Add containment to scrollable containers
	document.querySelectorAll(".chat-window, .match-content, .dictionary-list").forEach((element) => {
		(element as HTMLElement).style.contain = "layout style paint";
	});

	// Add containment to cards and repeated elements
	document.querySelectorAll(".rpg-card, .chat-message, .match-card").forEach((element) => {
		(element as HTMLElement).style.contain = "layout style";
	});
}

/**
 * Initialize all CSS optimizations
 */
export function initializeCSSOptimizations(): void {
	// Run immediately
	preloadFonts();
	optimizeAnimations();

	// Run after initial render
	requestIdleCallback(() => {
		enableCSSContainment();
		cleanupUnusedCSSVariables();
	});

	// Re-apply containment on route changes
	if (window.router) {
		window.router.afterEach(() => {
			requestIdleCallback(() => {
				enableCSSContainment();
			});
		});
	}
}

// Polyfill for requestIdleCallback
if (!window.requestIdleCallback) {
	window.requestIdleCallback = (callback: IdleRequestCallback) => {
		return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1);
	};
}
