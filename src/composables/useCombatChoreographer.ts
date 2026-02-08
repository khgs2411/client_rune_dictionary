import { ref } from "vue";
import type { CombatSequenceEvent } from "@/common/match-events.types";
import type { I_PlayerParticipant, I_NPCParticipant } from "@/common/match.types";

const EFFECT_DELAY_MS = 400;
const SETTLE_DELAY_MS = 300;

export interface I_FloatingNumber {
	id: string;
	value: number;
	type: "damage" | "heal";
	targetId: string;
}

export function useCombatChoreographer() {
	const isAnimating = ref(false);
	const floatingNumbers = ref<I_FloatingNumber[]>([]);

	async function processSequence(
		sequence: CombatSequenceEvent["content"],
		player: I_PlayerParticipant | undefined,
		npc: I_NPCParticipant | undefined,
		updateHealth: (entityId: string, health: number, maxHealth?: number) => void,
		sendAck: (matchId: string, token: string) => void,
		onMatchEnd?: (winnerId: string, loserId: string) => void,
	): Promise<void> {
		isAnimating.value = true;

		try {
			const visibleEffects = sequence.effects.filter(e => !e.deferred);

			for (const effect of visibleEffects) {
				// Update health per-effect
				if (effect.healthAfter !== undefined) {
					updateHealth(effect.targetId, effect.healthAfter);
				}

				// Push floating damage/heal number
				const numType = effect.action === "HEAL" || effect.action === "RESOURCE_RESTORE" ? "heal" : "damage";
				if (effect.value > 0) {
					const entry: I_FloatingNumber = {
						id: `${Date.now()}-${effect.index}`,
						value: effect.value,
						type: numType,
						targetId: effect.targetId,
					};
					floatingNumbers.value.push(entry);

					// Auto-remove after animation
					setTimeout(() => {
						floatingNumbers.value = floatingNumbers.value.filter(n => n.id !== entry.id);
					}, 800);
				}

				if (visibleEffects.indexOf(effect) < visibleEffects.length - 1) {
					await delay(EFFECT_DELAY_MS);
				}
			}

			await delay(SETTLE_DELAY_MS);

			if (sequence.matchEnded && sequence.winnerId && sequence.loserId && onMatchEnd) {
				onMatchEnd(sequence.winnerId, sequence.loserId);
			}
		} finally {
			isAnimating.value = false;
			sendAck(sequence.matchId, sequence.token);
		}
	}

	return {
		isAnimating,
		floatingNumbers,
		processSequence,
	};
}

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
