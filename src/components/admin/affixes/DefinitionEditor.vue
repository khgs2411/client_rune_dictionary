<template>
	<div class="def-editor">
		<!-- Token Palette (Collapsible) -->
		<div>
			<button type="button" class="palette-toggle" @click="paletteOpen = !paletteOpen">
				<Icon :icon="paletteOpen ? 'radix-icons:chevron-down' : 'radix-icons:chevron-right'" class="h-3 w-3" />
				<span>Token Palette</span>
				<span class="palette-count">({{ store.contextTokens.length }} tokens)</span>
			</button>
			<div v-if="paletteOpen" class="mt-2">
				<TokenPalette @insert="handleInsertToken" />
			</div>
		</div>

		<!-- Hash Textarea -->
		<div class="space-y-1">
			<Label class="field-label">Hash / Context String</Label>
			<textarea
				ref="textareaRef"
				:value="store.draft?.hash || ''"
				placeholder='e.g., "$DEAL$ $X$ $Y$ Damage"'
				class="hash-textarea"
				@input="handleHashInput" />
		</div>

		<!-- Compile Button -->
		<div class="compile-row">
			<button class="compile-btn" :disabled="store.isCompiling || !store.draft?.hash?.trim()" @click="handleCompile">
				<Icon v-if="store.isCompiling" icon="radix-icons:update" class="h-4 w-4 animate-spin" />
				<Icon v-else icon="radix-icons:play" class="h-4 w-4" />
				{{ store.isCompiling ? "Compiling..." : "Compile" }}
			</button>
			<span v-if="store.draft?.definition" class="compiled-badge">
				<Icon icon="radix-icons:check-circled" class="h-3 w-3" />
				Compiled
			</span>
		</div>

		<!-- Compilation Errors -->
		<div v-if="store.compilationErrors.length > 0" class="space-y-1">
			<div v-for="(error, i) in store.compilationErrors" :key="i" class="error-card">
				<span class="error-code">[{{ error.code }}]</span>
				{{ error.message }}
				<span v-if="error.suggestion" class="error-suggestion">Suggestion: {{ error.suggestion }}</span>
			</div>
		</div>

		<!-- Compilation Warnings -->
		<div v-if="store.compilationWarnings.length > 0" class="space-y-1">
			<div v-for="(warning, i) in store.compilationWarnings" :key="i" class="warning-card">
				<span class="warning-code">[{{ warning.code }}]</span>
				{{ warning.message }}
			</div>
		</div>

		<!-- Definition Preview -->
		<div v-if="store.draft?.definition" class="space-y-2">
			<Label class="field-label">Compiled Effects ({{ store.draft.definition.effects.length }})</Label>
			<div class="effects-container">
				<div v-for="(effect, i) in store.draft.definition.effects" :key="i" class="effect-card" :style="{ borderLeftColor: effectColor(effect.effectType) }">
					<div class="effect-header">
						<span class="effect-type" :style="{ color: effectColor(effect.effectType) }">{{ effect.effectType }}</span>
						<span class="effect-sep">/</span>
						<span class="effect-action">{{ effect.action }}</span>
					</div>
					<div v-if="effect.value" class="effect-detail">
						Value: {{ effect.value.scaling }} / {{ effect.value.mode }}
						<span v-if="effect.value.damageType">({{ effect.value.damageType }})</span>
					</div>
					<div v-if="effect.timing" class="effect-detail">
						<span v-if="effect.timing.duration">Duration: tier-scaled</span>
						<span v-if="effect.timing.delay">Delay: tier-scaled</span>
						<span v-if="effect.timing.hitCount">Hits: tier-scaled</span>
						<span v-if="effect.timing.interval">Interval: tier-scaled</span>
					</div>
					<div v-if="effect.statMod" class="effect-detail">
						Stat: {{ effect.statMod.stat }} ({{ effect.statMod.percent.type }})
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { Label } from "@/components/ui/label";
import { useAffixesStore } from "@/stores/affixes.store";
import TokenPalette from "./TokenPalette.vue";

const store = useAffixesStore();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const paletteOpen = ref(false);

function effectColor(type: string): string {
	const map: Record<string, string> = {
		IMMEDIATE: "#cbd5e1",
		PERIODIC: "#fb923c",
		DELAYED: "#fbbf24",
		MULTI_HIT: "#22d3ee",
		STAT_MODIFIER: "#a78bfa",
	};
	return map[type] || "#9b7ed8";
}

function handleHashInput(event: Event) {
	const value = (event.target as HTMLTextAreaElement).value;
	store.updateDraft({ hash: value });
}

function handleInsertToken(token: string) {
	const textarea = textareaRef.value;
	if (!textarea) return;

	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const currentValue = store.draft?.hash || "";

	const charBefore = start > 0 ? currentValue[start - 1] : "";
	const needsSpace = charBefore !== "" && charBefore !== " " && charBefore !== "\n" && charBefore !== "\t";
	const insertText = needsSpace ? " " + token : token;

	const newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
	store.updateDraft({ hash: newValue });

	requestAnimationFrame(() => {
		if (textareaRef.value) {
			const newCursorPos = start + insertText.length;
			textareaRef.value.setSelectionRange(newCursorPos, newCursorPos);
			textareaRef.value.focus();
		}
	});
}

async function handleCompile() {
	await store.compileHash();
}
</script>

<style scoped>
.def-editor {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.palette-toggle {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.35);
	background: none;
	border: none;
	cursor: pointer;
	width: 100%;
	text-align: left;
	transition: color 0.15s ease;
}

.palette-toggle:hover {
	color: rgba(255, 255, 255, 0.6);
}

.palette-count {
	font-size: 0.6rem;
	opacity: 0.6;
}

.field-label {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.4);
}

.hash-textarea {
	width: 100%;
	height: 96px;
	padding: 10px 12px;
	font-size: 0.82rem;
	font-family: monospace;
	color: #86efac;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 8px;
	resize: none;
	outline: none;
	transition: border-color 0.15s ease;
}

.hash-textarea::placeholder {
	color: rgba(255, 255, 255, 0.15);
}

.hash-textarea:focus {
	border-color: rgba(155, 126, 216, 0.4);
	box-shadow: 0 0 0 2px rgba(155, 126, 216, 0.1);
}

.compile-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.compile-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	font-size: 0.75rem;
	font-weight: 600;
	color: #86efac;
	background: transparent;
	border: 1px solid rgba(134, 239, 172, 0.25);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.compile-btn:hover:not(:disabled) {
	background: rgba(134, 239, 172, 0.08);
	border-color: rgba(134, 239, 172, 0.4);
}

.compile-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.compiled-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 0.72rem;
	color: #22c55e;
}

.error-card {
	font-size: 0.72rem;
	padding: 8px 10px;
	border-radius: 6px;
	background: rgba(239, 68, 68, 0.06);
	border: 1px solid rgba(239, 68, 68, 0.12);
	color: #f87171;
}

.error-code {
	font-family: monospace;
	font-weight: 700;
}

.error-suggestion {
	display: block;
	margin-top: 4px;
	opacity: 0.7;
}

.warning-card {
	font-size: 0.72rem;
	padding: 8px 10px;
	border-radius: 6px;
	background: rgba(245, 158, 11, 0.06);
	border: 1px solid rgba(245, 158, 11, 0.12);
	color: #fbbf24;
}

.warning-code {
	font-family: monospace;
	font-weight: 700;
}

.effects-container {
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 8px;
	padding: 8px;
	background: rgba(255, 255, 255, 0.02);
	max-height: 192px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.effect-card {
	font-size: 0.72rem;
	padding: 8px 10px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.03);
	border-left: 3px solid #9b7ed8;
}

.effect-header {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 4px;
}

.effect-type {
	font-family: monospace;
	font-weight: 700;
}

.effect-sep {
	color: rgba(255, 255, 255, 0.15);
}

.effect-action {
	font-family: monospace;
	color: rgba(255, 255, 255, 0.7);
}

.effect-detail {
	color: rgba(255, 255, 255, 0.3);
	font-size: 0.68rem;
}
</style>
