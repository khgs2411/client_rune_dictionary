<template>
	<div class="space-y-3">
		<!-- Token Palette (Collapsible via v-if) -->
		<div>
			<button
				type="button"
				class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
				@click="paletteOpen = !paletteOpen">
				<Icon :icon="paletteOpen ? 'radix-icons:chevron-down' : 'radix-icons:chevron-right'" class="h-3 w-3" />
				<span>Token Palette</span>
				<span class="text-[10px] opacity-60">({{ store.contextTokens.length }} tokens)</span>
			</button>
			<div v-if="paletteOpen" class="mt-2">
				<TokenPalette @insert="handleInsertToken" />
			</div>
		</div>

		<!-- Hash Textarea (compiles into definition) -->
		<div class="space-y-1">
			<Label class="text-xs">Hash / Context String</Label>
			<textarea
				ref="textareaRef"
				:value="store.draft?.hash || ''"
				placeholder='e.g., "$DEAL$ $X$ $Y$ Damage"'
				class="w-full h-24 px-3 py-2 text-sm font-mono bg-background border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
				@input="handleHashInput" />
		</div>

		<!-- Compile Button -->
		<div class="flex items-center gap-2">
			<Button size="sm" variant="outline" @click="handleCompile" :disabled="store.isCompiling || !store.draft?.hash?.trim()">
				<Icon v-if="store.isCompiling" icon="radix-icons:update" class="h-4 w-4 mr-1 animate-spin" />
				<Icon v-else icon="radix-icons:play" class="h-4 w-4 mr-1" />
				{{ store.isCompiling ? "Compiling..." : "Compile" }}
			</Button>
			<span v-if="store.draft?.definition" class="text-xs text-green-500 flex items-center gap-1">
				<Icon icon="radix-icons:check-circled" class="h-3 w-3" />
				Compiled
			</span>
		</div>

		<!-- Compilation Errors -->
		<div v-if="store.compilationErrors.length > 0" class="space-y-1">
			<div v-for="(error, i) in store.compilationErrors" :key="i" class="text-xs p-2 rounded bg-destructive/10 text-destructive">
				<span class="font-mono font-bold">[{{ error.code }}]</span>
				{{ error.message }}
				<span v-if="error.suggestion" class="block mt-1 opacity-80">Suggestion: {{ error.suggestion }}</span>
			</div>
		</div>

		<!-- Compilation Warnings -->
		<div v-if="store.compilationWarnings.length > 0" class="space-y-1">
			<div v-for="(warning, i) in store.compilationWarnings" :key="i" class="text-xs p-2 rounded bg-amber-500/10 text-amber-600">
				<span class="font-mono font-bold">[{{ warning.code }}]</span>
				{{ warning.message }}
			</div>
		</div>

		<!-- Definition Preview -->
		<div v-if="store.draft?.definition" class="space-y-2">
			<Label class="text-xs">Compiled Effects ({{ store.draft.definition.effects.length }})</Label>
			<div class="border rounded p-2 bg-background/50 space-y-2 max-h-48 overflow-y-auto">
				<div v-for="(effect, i) in store.draft.definition.effects" :key="i" class="text-xs p-2 rounded bg-muted/50">
					<div class="flex items-center gap-2 mb-1">
						<span class="font-mono font-bold text-primary">{{ effect.effectType }}</span>
						<span class="text-muted-foreground">/</span>
						<span class="font-mono">{{ effect.action }}</span>
					</div>
					<div v-if="effect.value" class="text-muted-foreground">
						Value: {{ effect.value.scaling }} / {{ effect.value.mode }}
						<span v-if="effect.value.damageType">({{ effect.value.damageType }})</span>
					</div>
					<div v-if="effect.timing" class="text-muted-foreground">
						<span v-if="effect.timing.duration">Duration: tier-scaled</span>
						<span v-if="effect.timing.delay">Delay: tier-scaled</span>
						<span v-if="effect.timing.hitCount">Hits: tier-scaled</span>
						<span v-if="effect.timing.interval">Interval: tier-scaled</span>
					</div>
					<div v-if="effect.statMod" class="text-muted-foreground">
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAffixesStore } from "@/stores/affixes.store";
import TokenPalette from "./TokenPalette.vue";

const store = useAffixesStore();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const paletteOpen = ref(false);

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

	// Add leading space if there's a non-whitespace character before the cursor
	const charBefore = start > 0 ? currentValue[start - 1] : "";
	const needsSpace = charBefore !== "" && charBefore !== " " && charBefore !== "\n" && charBefore !== "\t";
	const insertText = needsSpace ? " " + token : token;

	const newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
	store.updateDraft({ hash: newValue });

	// Restore cursor position after the inserted token
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
