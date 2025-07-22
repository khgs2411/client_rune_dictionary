/**
 * Performance monitoring utilities for animations
 * Tracks FPS and provides warnings for performance issues
 */

export class PerformanceMonitor {
	private frameCount = 0;
	private lastTime = performance.now();
	private fps = 60;
	private isMonitoring = false;
	private animationId?: number;
	private fpsCallback?: (fps: number) => void;
	private lowFpsThreshold = 30;
	private warningCallback?: (fps: number) => void;

	/**
	 * Start monitoring FPS
	 */
	start(options?: { onFPS?: (fps: number) => void; onWarning?: (fps: number) => void; threshold?: number }) {
		if (this.isMonitoring) return;

		this.fpsCallback = options?.onFPS;
		this.warningCallback = options?.onWarning;
		this.lowFpsThreshold = options?.threshold || 30;
		this.isMonitoring = true;
		this.frameCount = 0;
		this.lastTime = performance.now();

		this.tick();
	}

	/**
	 * Stop monitoring
	 */
	stop() {
		this.isMonitoring = false;
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
	}

	/**
	 * Get current FPS
	 */
	getCurrentFPS(): number {
		return Math.round(this.fps);
	}

	/**
	 * Check if performance is good (above threshold)
	 */
	isPerformanceGood(): boolean {
		return this.fps >= this.lowFpsThreshold;
	}

	/**
	 * Main animation loop
	 */
	private tick = () => {
		if (!this.isMonitoring) return;

		const currentTime = performance.now();
		this.frameCount++;

		// Calculate FPS every second
		if (currentTime >= this.lastTime + 1000) {
			this.fps = (this.frameCount * 1000) / (currentTime - this.lastTime);
			this.frameCount = 0;
			this.lastTime = currentTime;

			// Trigger callbacks
			this.fpsCallback?.(Math.round(this.fps));

			// Warn if FPS is low
			if (this.fps < this.lowFpsThreshold) {
				this.warningCallback?.(Math.round(this.fps));
			}
		}

		this.animationId = requestAnimationFrame(this.tick);
	};
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Utility to measure animation performance
 */
export function measureAnimationPerformance(animationFunction: () => void | Promise<void>, duration = 3000): Promise<number> {
	return new Promise((resolve) => {
		const monitor = new PerformanceMonitor();
		let totalFPS = 0;
		let fpsCount = 0;

		monitor.start({
			onFPS: (fps) => {
				totalFPS += fps;
				fpsCount++;
			},
		});

		// Run the animation
		animationFunction();

		// Stop monitoring after duration
		setTimeout(() => {
			monitor.stop();
			const averageFPS = fpsCount > 0 ? totalFPS / fpsCount : 0;
			resolve(averageFPS);
		}, duration);
	});
}

/**
 * Detect if the user's device is low-performance
 */
export function isLowPerformanceDevice(): boolean {
	// Check for various indicators of low-performance devices
	const checks = {
		// Low core count
		lowCoreCount: navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false,
		// Mobile device with limited RAM (heuristic)
		limitedMemory: "deviceMemory" in navigator && (navigator as any).deviceMemory < 4,
		// Reduced motion preference (often indicates performance concerns)
		reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
		// Battery saver mode
		lowPowerMode: "getBattery" in navigator,
	};

	// If any two indicators are true, consider it low-performance
	const indicators = Object.values(checks).filter(Boolean).length;
	return indicators >= 2;
}

/**
 * Auto-adjust animation quality based on performance
 */
export class AnimationQualityController {
	private performanceHistory: number[] = [];
	private qualityLevel: "high" | "medium" | "low" = "high";
	private callbacks: ((quality: "high" | "medium" | "low") => void)[] = [];

	constructor() {
		// Check device capabilities on init
		if (isLowPerformanceDevice()) {
			this.setQuality("medium");
		}
	}

	/**
	 * Monitor performance and adjust quality
	 */
	startAutoAdjust() {
		performanceMonitor.start({
			onFPS: (fps) => {
				this.performanceHistory.push(fps);

				// Keep last 10 measurements
				if (this.performanceHistory.length > 10) {
					this.performanceHistory.shift();
				}

				// Calculate average FPS
				const avgFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;

				// Adjust quality based on performance
				if (avgFPS < 30 && this.qualityLevel !== "low") {
					this.setQuality("low");
				} else if (avgFPS < 45 && this.qualityLevel === "high") {
					this.setQuality("medium");
				} else if (avgFPS > 55 && this.qualityLevel !== "high") {
					// Only upgrade if consistently good
					const recentFPS = this.performanceHistory.slice(-3);
					if (recentFPS.every((fps) => fps > 55)) {
						this.setQuality(this.qualityLevel === "low" ? "medium" : "high");
					}
				}
			},
		});
	}

	/**
	 * Set animation quality level
	 */
	private setQuality(level: "high" | "medium" | "low") {
		this.qualityLevel = level;
		document.documentElement.setAttribute("data-animation-quality", level);
		this.callbacks.forEach((cb) => cb(level));
	}

	/**
	 * Get current quality level
	 */
	getQuality(): "high" | "medium" | "low" {
		return this.qualityLevel;
	}

	/**
	 * Subscribe to quality changes
	 */
	onQualityChange(callback: (quality: "high" | "medium" | "low") => void) {
		this.callbacks.push(callback);
	}
}

// Global instance
export const animationQuality = new AnimationQualityController();