import { Directive, DirectiveBinding } from "vue";

interface DebugElement extends HTMLElement {
	_originalOutlineStyle?: string;
	_originalBackgroundStyle?: string;
	_originalOutlineOffset?: string;
	_debugColor?: string;
}

const colors = [
	"#FF0000", // Pure red
	"#00FF00", // Pure green (lime)
	"#0066FF", // Bright blue
	"#FF00FF", // Magenta
	"#FFFF00", // Yellow
	"#00FFFF", // Cyan
	"#FF6600", // Bright orange
	"#9900FF", // Vivid purple
] as const;

function getRandomColor() {
	return colors[Math.floor(Math.random() * colors.length)];
}

const DebugDirective: Directive = {
	beforeMount(el: DebugElement, binding: DirectiveBinding<{ width?: string; mode?: "outline" | "background" }>) {
		// Store original styles
		el._originalOutlineStyle = el.style.outline;
		el._originalBackgroundStyle = el.style.backgroundColor;
		el._originalOutlineOffset = el.style.outlineOffset;

		// Assign a consistent color for this element
		el._debugColor = getRandomColor();

		const width = binding.value?.width || "1px";
		const mode = binding.value?.mode || "outline";

		if (mode === "background") {
			// Apply semi-transparent background
			el.style.backgroundColor = `${el._debugColor}40`; // 40 is 25% opacity in hex
		} else {
			// Add a small negative outline offset to prevent border-radius clipping
			el.style.outline = `${width} solid ${el._debugColor}`;
			el.style.outlineOffset = "-1px";
		}
	},

	beforeUpdate(el: DebugElement, binding: DirectiveBinding<{ width?: string; mode?: "outline" | "background" }>) {
		el.style.outline = el._originalOutlineStyle || "";
		el.style.backgroundColor = el._originalBackgroundStyle || "";
		el.style.outlineOffset = el._originalOutlineOffset || "";
		el._debugColor = getRandomColor();

		const width = binding.value?.width || "1px";
		const mode = binding.value?.mode || "outline";

		if (mode === "background") {
			el.style.backgroundColor = `${el._debugColor}40`;
		} else {
			el.style.outline = `${width} solid ${el._debugColor}`;
			el.style.outlineOffset = "-1px";
		}
	},

	beforeUnmount(el: DebugElement) {
		// Restore original styles
		el.style.outline = el._originalOutlineStyle || "";
		el.style.backgroundColor = el._originalBackgroundStyle || "";
		el.style.outlineOffset = el._originalOutlineOffset || "";
		delete el._originalOutlineStyle;
		delete el._originalBackgroundStyle;
		delete el._originalOutlineOffset;
		delete el._debugColor;
	},
};

export default DebugDirective;
