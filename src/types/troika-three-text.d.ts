/**
 * Type declarations for troika-three-text
 * Provides minimal typing for SDF text rendering in Three.js
 */

declare module "troika-three-text" {
	import { Object3D, Color, Material } from "three";

	export class Text extends Object3D {
		text: string;
		fontSize: number;
		color: number | Color | string;
		anchorX?: "left" | "center" | "right" | number;
		anchorY?: "top" | "middle" | "bottom" | number;
		font?: string;
		letterSpacing?: number;
		lineHeight?: number;
		maxWidth?: number;
		textAlign?: "left" | "right" | "center" | "justify";
		textIndent?: number;
		whiteSpace?: "normal" | "nowrap";
		overflowWrap?: "normal" | "break-word";
		outlineWidth?: number | string;
		outlineColor?: number | Color | string;
		outlineOpacity?: number;
		outlineBlur?: number | string;
		strokeWidth?: number | string;
		strokeColor?: number | Color | string;
		strokeOpacity?: number;
		fillOpacity?: number;
		depthOffset?: number;
		clipRect?: [number, number, number, number];
		orientation?: string;
		glyphGeometryDetail?: number;
		sdfGlyphSize?: number;
		material?: Material;

		sync(callback?: () => void): void;
		dispose(): void;
	}

	export class preloadFont {
		static preloadFont(
			options: {
				font?: string;
				characters?: string;
			},
			callback?: () => void,
		): void;
	}
}
