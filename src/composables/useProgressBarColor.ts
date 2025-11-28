import { computed, type ComputedRef } from "vue";

export type BarType = "health" | "mana" | "timer" | "atb";

export interface ProgressBarColorOptions {
	/**
	 * Output format:
	 * - 'tailwind': Returns Tailwind class string (e.g., 'bg-gradient-to-r from-green-400 to-green-600')
	 * - 'inline': Returns inline style object (e.g., { background: 'linear-gradient(...)' })
	 */
	outputFormat?: "tailwind" | "inline";
}

/**
 * Reusable progress bar color logic
 *
 * Returns computed colors based on percentage thresholds for different bar types.
 * Supports both Tailwind classes and inline styles.
 *
 * @param value - Current value
 * @param max - Maximum value
 * @param barType - Type of bar ('health', 'mana', 'timer', 'atb')
 * @param options - Configuration options
 */
export function useProgressBarColor(value: () => number, max: () => number, barType: BarType, options: ProgressBarColorOptions = {}) {
	const { outputFormat = "tailwind" } = options;

	const percentage = computed(() => {
		const maxVal = max();
		const currentVal = value();
		return maxVal > 0 ? (currentVal / maxVal) * 100 : 0;
	});

	const tailwindClass = computed(() => {
		const pct = percentage.value;

		switch (barType) {
			case "health":
				// Green → Yellow → Red
				if (pct > 66) return "bg-gradient-to-r from-green-400 to-green-600";
				if (pct > 33) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
				return "bg-gradient-to-r from-red-400 to-red-600";

			case "mana":
				// Blue gradient (consistent across all levels)
				return "bg-gradient-to-r from-blue-400 to-blue-600";

			case "timer":
				// Similar to health but inverted logic (high time = good)
				if (pct > 66) return "bg-gradient-to-r from-green-400 to-green-600";
				if (pct > 33) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
				return "bg-gradient-to-r from-red-400 to-red-600";

			case "atb":
				// Primary color (can vary based on readiness state)
				if (pct >= 100) return "bg-gradient-to-r from-primary to-primary/80";
				if (pct > 75) return "bg-gradient-to-r from-primary/80 to-primary/60";
				return "bg-gradient-to-r from-primary/60 to-primary/40";

			default:
				return "bg-primary";
		}
	});

	const inlineStyle: ComputedRef<Record<string, string>> = computed(() => {
		const pct = percentage.value;

		switch (barType) {
			case "health":
				if (pct > 66) {
					return { background: "linear-gradient(to right, rgb(74, 222, 128), rgb(34, 197, 94))" };
				}
				if (pct > 33) {
					return {
						background: "linear-gradient(to right, rgb(250, 204, 21), rgb(234, 179, 8))",
					};
				}
				return { background: "linear-gradient(to right, rgb(248, 113, 113), rgb(239, 68, 68))" };

			case "mana":
				return { background: "linear-gradient(to right, rgb(96, 165, 250), rgb(37, 99, 235))" };

			case "timer":
				if (pct > 66) {
					return { background: "linear-gradient(to right, rgb(74, 222, 128), rgb(34, 197, 94))" };
				}
				if (pct > 33) {
					return {
						background: "linear-gradient(to right, rgb(250, 204, 21), rgb(234, 179, 8))",
					};
				}
				return { background: "linear-gradient(to right, rgb(248, 113, 113), rgb(239, 68, 68))" };

			case "atb":
				// Use CSS variables for theme-aware primary color
				if (pct >= 100) {
					return {
						background: "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
					};
				}
				if (pct > 75) {
					return {
						background: "linear-gradient(to right, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.6))",
					};
				}
				return {
					background: "linear-gradient(to right, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.4))",
				};

			default:
				return { background: "hsl(var(--primary))" };
		}
	});

	if (outputFormat === "inline") {
		return {
			colorStyle: inlineStyle,
			percentage,
		};
	}

	return {
		colorClass: tailwindClass,
		percentage,
	};
}
