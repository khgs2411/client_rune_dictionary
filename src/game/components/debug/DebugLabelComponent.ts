import { DataStore } from "@/stores/DataStore";
import { CanvasTexture, Sprite, SpriteMaterial } from "three";
import type { I_SceneContext } from "../../common/scenes.types";
import { ComponentPriority, GameComponent } from "../../GameComponent";
import { TransformComponent } from "../entities/TransformComponent";

export type DebugLabelVariant = "collision" | "primary" | "warning" | "info";

export interface I_DebugLabelConfig {
	text?: string; // Label text (default: gameObject.id)
	yOffset?: number; // Height above transform (default: 2)
	fontSize?: number; // Font size in pixels (default: 48)
	padding?: number; // Padding in pixels (default: 10)
	variant?: DebugLabelVariant; // Preset color scheme (default: 'collision')
	// Custom colors (override variant)
	backgroundColor?: string;
	textColor?: string;
}

// Preset color schemes
const LABEL_VARIANTS: Record<DebugLabelVariant, { bg: string; text: string }> = {
	collision: { bg: "rgba(0, 0, 0, 0.7)", text: "#00ff00" }, // Green - physics debug
	primary: { bg: "rgba(0, 0, 0, 0.8)", text: "#ff69b4" }, // Pink - general identification
	warning: { bg: "rgba(80, 50, 0, 0.8)", text: "#ffaa00" }, // Orange - warnings
	info: { bg: "rgba(0, 40, 80, 0.8)", text: "#00aaff" }, // Blue - info
};

/**
 * DebugLabelComponent - Floating text label for debugging
 *
 * Creates a billboard sprite with text that always faces the camera.
 * Useful for identifying game objects in the scene.
 *
 * Usage:
 * ```typescript
 * // Collision debug (green) - used by physics system
 * gameObject.addComponent(new DebugLabelComponent());
 *
 * // Manual identification (pink)
 * gameObject.addComponent(new DebugLabelComponent({ variant: 'primary' }));
 *
 * // Custom text and variant
 * gameObject.addComponent(new DebugLabelComponent({
 *   text: 'My NPC',
 *   variant: 'info',
 *   yOffset: 2.5,
 * }));
 *
 * // Fully custom colors
 * gameObject.addComponent(new DebugLabelComponent({
 *   textColor: '#ff0000',
 *   backgroundColor: 'rgba(255, 255, 255, 0.9)',
 * }));
 * ```
 */
export class DebugLabelComponent extends GameComponent {
	public readonly priority = ComponentPriority.RENDERING;

	private config: I_DebugLabelConfig;
	private sprite!: Sprite;
	private material!: SpriteMaterial;
	private texture!: CanvasTexture;
	private context!: I_SceneContext;

	constructor(config: I_DebugLabelConfig = {}) {
		super();
		this.config = config;
	}

	async init(context: I_SceneContext): Promise<void> {
		this.context = context;

		const text = this.config.text ?? this.gameObject.id;
		const yOffset = this.config.yOffset ?? 2;
		const fontSize = this.config.fontSize ?? 48;
		const padding = this.config.padding ?? 10;

		// Resolve colors from variant (custom colors override variant)
		const variant = this.config.variant ?? "primary";
		const variantColors = LABEL_VARIANTS[variant];
		const backgroundColor = this.config.backgroundColor ?? variantColors.bg;
		const textColor = this.config.textColor ?? variantColors.text;

		// Create canvas for text
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d")!;

		// Measure text to size canvas
		ctx.font = `bold ${fontSize}px monospace`;
		const metrics = ctx.measureText(text);
		const textWidth = metrics.width;
		const textHeight = fontSize;

		// Size canvas with padding
		canvas.width = textWidth + padding * 2;
		canvas.height = textHeight + padding * 2;

		// Re-set font after resize (canvas reset clears it)
		ctx.font = `bold ${fontSize}px monospace`;

		// Draw background
		ctx.fillStyle = backgroundColor;
		ctx.roundRect(0, 0, canvas.width, canvas.height, 8);
		ctx.fill();

		// Draw text
		ctx.fillStyle = textColor;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);

		// Create texture and material
		this.texture = new CanvasTexture(canvas);
		this.material = new SpriteMaterial({
			map: this.texture,
			transparent: true,
			depthTest: false, // Always render on top
			depthWrite: false,
		});

		// Create sprite
		this.sprite = new Sprite(this.material);
		this.sprite.name = `debug-label-${this.gameObject.id}`;

		// Scale sprite to reasonable world size (aspect ratio preserved)
		const aspectRatio = canvas.width / canvas.height;
		const spriteHeight = 0.5; // World units
		this.sprite.scale.set(spriteHeight * aspectRatio, spriteHeight, 1);

		// Position above transform
		const transform = this.getComponent(TransformComponent);
		if (transform) {
			this.sprite.position.copy(transform.position);
			this.sprite.position.y += yOffset;
		}

		// Add to scene
		context.scene.add(this.sprite);

		// Register for cleanup
		context.cleanupRegistry.registerObject(this.sprite);
		context.cleanupRegistry.registerDisposable(this.texture);
		context.cleanupRegistry.registerDisposable(this.material);
	}

	update(_delta: number): void {
		// Keep label positioned above transform
		const transform = this.getComponent(TransformComponent);
		if (transform && this.sprite) {
			const yOffset = this.config.yOffset ?? 2;
			this.sprite.position.copy(transform.position);
			this.sprite.position.y += yOffset;
		}
	}

	destroy(): void {
		if (this.sprite?.parent) {
			this.sprite.parent.remove(this.sprite);
		}

		if (this.context?.scene) {
			super.destroy(this.context.scene);
		}
	}
}
