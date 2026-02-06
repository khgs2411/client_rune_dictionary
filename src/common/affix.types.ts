// ============================================================================
// AFFIX MODEL
// ============================================================================

export interface AffixModel {
	_id: string;
	affix_id: number;
	hash: string;
	tier: number;
	weight: number;
	potency: number;
	attribute_ids: number[];
	required_attribute_ids: number[];
	blocked_affix_ids: number[];
	require_affix_ids: number[];
	definition?: I_AffixDefinition;
}

export interface AffixCreationData {
	hash: string;
	tier: 1 | 2 | 3 | 4;
	weight: number;
	potency: number;
	attribute_ids: number[];
	required_attribute_ids: number[];
	blocked_affix_ids: number[];
	require_affix_ids?: number[];
	definition?: I_AffixDefinition;
}

export interface AffixUpdateData {
	id: string;
	hash?: string;
	tier?: number;
	weight?: number;
	potency?: number;
	attribute_ids?: number[];
	required_attribute_ids?: number[];
	blocked_affix_ids?: number[];
	require_affix_ids?: number[];
	definition?: I_AffixDefinition;
}

// ============================================================================
// COMPILATION TYPES
// ============================================================================

export interface I_CompilationResult {
	success: boolean;
	definition?: I_AffixDefinition;
	errors: I_CompilationError[];
	warnings: I_CompilationError[];
}

export interface I_CompilationError {
	code: string;
	severity: "FATAL" | "ERROR" | "WARNING";
	message: string;
	position?: number;
	token?: string;
	suggestion?: string;
}

// ============================================================================
// TOKEN PALETTE TYPES
// ============================================================================

export interface I_TokenPaletteResponse {
	tokens: I_ContextVariable[];
	categories: string[];
	enabledCount: number;
	totalCount: number;
}

export interface I_ContextVariable {
	key: string;
	sign: string;
	category: string;
	priority: number;
	description: string;
	disabled?: boolean;
	metadata?: Record<string, unknown>;
}

// ============================================================================
// AFFIX DEFINITION TYPES (Simplified for client display)
// ============================================================================

export interface I_AffixDefinition {
	context: string;
	effects: I_EffectDefinition[];
	compiled: {
		version: number;
		timestamp: string;
		warnings: string[];
		identity?: I_IdentityMetadata;
	};
}

export interface I_EffectDefinition {
	effectType: string;
	action: string;
	target?: string;
	value?: I_ValueConfig;
	statMod?: I_StatModConfig;
	timing?: I_TimingConfig;
	conditions: I_ConditionConfig[];
	modifiers: I_ModifierConfig;
	skillType?: string | number;
	damageCategory?: string | number;
}

export interface I_ValueConfig {
	scaling: string;
	mode: string;
	damageType: string | number | null;
}

export interface I_StatModConfig {
	stat: string;
	percent: { type: string; value?: number };
	element?: string | number | null;
}

export interface I_TimingConfig {
	delay?: { type: string; value?: number };
	duration?: { type: string; value?: number };
	hitCount?: { type: string; value?: number };
	interval?: { type: string; value?: number };
}

export interface I_ConditionConfig {
	target: string;
	type: string;
	comparison: string;
	threshold: { type: string; value?: number };
}

export interface I_ModifierConfig {
	resource?: I_ResourceModifier;
	conversion?: I_ConversionConfig;
	onComplete?: I_OnCompleteConfig;
}

export interface I_ResourceModifier {
	property: string;
	source: string;
	percent: { type: string; value?: number };
	operation: string;
}

export interface I_ConversionConfig {
	percent: { type: string; value?: number };
	sourceElement: string | number | null;
	targetElement: string | number | null;
}

export interface I_OnCompleteConfig {
	action: string;
	value: { scaling: string; mode: string };
	damageType?: string | number | null;
}

export interface I_IdentityMetadata {
	actions: string[];
	effectTypes: string[];
	requiresElement: boolean;
	requiresSkillType: boolean;
	requiresDamageCategory: boolean;
	hasConversion: boolean;
	usesConditions: boolean;
	hasResourceModifier: boolean;
}
