/**
 * Sprite System - Main Export
 *
 * Single import point for all sprite-related functionality.
 *
 * Usage:
 * ```typescript
 * import {
 *   // Registry & Config
 *   SpriteSheetRegistry,
 *   registerSpriteSheet,
 *   getSpriteSheet,
 *   registerAllSpriteSheets,
 *
 *   // Prefabs
 *   CharacterSprite,
 *   SpriteCharacter,
 *
 *   // Components
 *   SpriteComponent,
 *   BillboardComponent,
 *   SpriteAnimationComponent,
 *   DirectionalSpriteAnimator,
 *
 *   // Types
 *   type I_SpriteSheetDefinition,
 *   type I_QuickSpriteSheetConfig,
 *   type SpriteDirection,
 * } from '../game/sprites';
 * ```
 */

// ===== REGISTRY =====
export { SpriteSheetRegistry, registerSpriteSheet, getSpriteSheet } from "./utils/SpriteSheetRegistry";

// ===== CONFIG =====
export { registerAllSpriteSheets, registerFullCharacter } from "./utils/spriteSheets.config";

// ===== PREFABS =====
export { CharacterSprite, type I_CharacterSpriteConfig } from "./prefabs/CharacterSprite";
export { SpriteCharacter, type I_SpriteCharacterConfig } from "./prefabs/SpriteCharacter";

// ===== COMPONENTS =====
export { SpriteComponent } from "./components/rendering/SpriteComponent";
export { BillboardComponent } from "./components/rendering/BillboardComponent";
export { SpriteAnimationComponent } from "./components/rendering/SpriteAnimationComponent";
export {
	DirectionalSpriteAnimator,
	type I_DirectionalSpriteAnimatorConfig,
} from "./components/rendering/DirectionalSpriteAnimator";

// ===== TYPES =====
export type {
	I_SpriteComponentConfig,
	I_SpriteSheetConfig,
	I_BillboardComponentConfig,
	I_AnimationDefinition,
	I_SpriteAnimationComponentConfig,
	I_TextureOptions,
	BillboardMode,
} from "./common/sprite.types";

export type {
	I_SpriteSheetDefinition,
	I_QuickSpriteSheetConfig,
	I_AnimationRowDefinition,
	I_SimpleAnimationDef,
	I_DirectionalAnimationDef,
	I_ExtendedAnimationDefinition,
	I_SpriteState,
	I_TextureSource,
	TextureConfig,
	SpriteDirection,
	CharacterAnimationName,
} from "./common/spritesheet.types";

export { isMultiTexture, getDefaultTexturePath, getTexturePathById } from "./common/spritesheet.types";

// ===== UTILITIES =====
export { TextureCache } from "./utils/TextureCache";
