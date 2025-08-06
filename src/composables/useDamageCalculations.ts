/**
 * Damage Calculations Composable
 * Provides all damage calculation formulas and related utilities
 * Ported from scripts/damage_calculations.ts
 */

import { computed, reactive, toRefs } from 'vue';

// TypeScript interfaces for damage calculations
export interface StatBlock {
  name?: string;
  level?: number;
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}

export interface Equipment {
  strength: number;
  magic_damage: number;
  accuracy: number;
}

export interface DamageResult {
  min: number;
  max: number;
  average: number;
  formula: string;
  speedModifier?: number;
}

export interface CombatMetrics {
  damage: DamageResult;
  hitChance: number;
  dps: number;
  speedModifier: number;
  attackType: 'physical' | 'magical';
}

// Equipment tiers (OSRS-style additive)
export const EQUIPMENT_TIERS: Record<string, Equipment> = {
  none: { strength: 0, magic_damage: 0, accuracy: 0 },
  bronze: { strength: 10, magic_damage: 5, accuracy: 10 },
  iron: { strength: 20, magic_damage: 10, accuracy: 20 },
  steel: { strength: 30, magic_damage: 15, accuracy: 30 },
  mithril: { strength: 40, magic_damage: 20, accuracy: 40 },
  adamant: { strength: 50, magic_damage: 25, accuracy: 50 },
  rune: { strength: 60, magic_damage: 30, accuracy: 60 },
};

// Damage formula configuration constants
export const DAMAGE_CONSTANTS = {
  // OSRS Formula Constants
  OSRS: {
    EFFECTIVE_LEVEL_BONUS: 8,
    EQUIPMENT_BASE_MULTIPLIER: 64,
    DAMAGE_MULTIPLIER: 320,
    DAMAGE_DIVISOR: 640,
    MAX_DEFENSE_REDUCTION: 0.75,
    DEFENSE_SCALING_FACTOR: 200,
    MIN_DAMAGE_RATIO: 0.5
  },

  // Linear Formula Constants
  LINEAR: {
    DAMAGE_DIVISOR: 10,
    DEFENSE_BASE: 100,
    MIN_DAMAGE_RATIO: 0.8
  },

  // Power Curve Constants
  POWER: {
    ATTACK_EXPONENT: 1.2,
    DAMAGE_DIVISOR: 20,
    DEFENSE_BASE: 50,
    MIN_DAMAGE_RATIO: 0.7
  },

  // Difference Formula Constants
  DIFFERENCE: {
    DEFENSE_EFFECTIVENESS: 0.5,
    MIN_DAMAGE_MULTIPLIER: 0.1,
    FINAL_DIVISOR: 5,
    MIN_DAMAGE_RATIO: 0.6
  },

  // Speed-Conscious Constants
  SPEED: {
    NEUTRAL_SPEED: 40,
    PENALTY_THRESHOLD: 50,
    BONUS_THRESHOLD: 30,
    MAX_PENALTY: 0.5,
    MAX_BONUS: 0.3,
    PENALTY_SCALING: 30,
    BONUS_SCALING: 20,
    BASE_DIVISOR: 8,
    DEFENSE_EFFECTIVENESS: 0.7,
    DEFENSE_BASE: 80,
    MIN_DAMAGE_RATIO: 0.65,
    EQUIPMENT_SCALING: 0.75
  },

  // Global Constants
  GLOBAL: {
    MINIMUM_DAMAGE: 1,
    HIT_CHANCE_MIN: 0.05,
    HIT_CHANCE_MAX: 0.95
  }
};

export type DamageFormulaType = 'osrs' | 'linear' | 'power' | 'difference' | 'speed-conscious';

export function useDamageCalculations() {
  // Reactive state for calculation parameters
  const state = reactive({
    selectedFormula: 'osrs' as DamageFormulaType,
    customConstants: { ...DAMAGE_CONSTANTS },
  });

  // Formula implementations
  const formulas = {
    osrs: (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;

      const { OSRS, GLOBAL } = state.customConstants;

      const effectiveAttack = attackStat + OSRS.EFFECTIVE_LEVEL_BONUS;
      const maxHit = Math.floor(
        (effectiveAttack * (equipmentBonus + OSRS.EQUIPMENT_BASE_MULTIPLIER) + OSRS.DAMAGE_MULTIPLIER) /
        OSRS.DAMAGE_DIVISOR
      );

      const defenseReduction = Math.min(OSRS.MAX_DEFENSE_REDUCTION, defenseStat / OSRS.DEFENSE_SCALING_FACTOR);
      const damage = Math.floor(maxHit * (1 - defenseReduction));

      const minDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, Math.floor(damage * OSRS.MIN_DAMAGE_RATIO));
      const maxDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, damage);
      return {
        min: minDamage,
        max: maxDamage,
        average: (minDamage + maxDamage) / 2,
        formula: "OSRS-Inspired"
      };
    },

    linear: (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;

      const { LINEAR, GLOBAL } = state.customConstants;

      const baseDamage = (attackStat + equipmentBonus) / LINEAR.DAMAGE_DIVISOR;
      const mitigation = LINEAR.DEFENSE_BASE / (LINEAR.DEFENSE_BASE + defenseStat);
      const damage = Math.floor(baseDamage * mitigation);

      const minDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, Math.floor(damage * LINEAR.MIN_DAMAGE_RATIO));
      const maxDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, damage);
      return {
        min: minDamage,
        max: maxDamage,
        average: (minDamage + maxDamage) / 2,
        formula: "Linear Hybrid"
      };
    },

    power: (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;

      const { POWER, GLOBAL } = state.customConstants;

      const attackPower = Math.pow(attackStat + equipmentBonus, POWER.ATTACK_EXPONENT) / POWER.DAMAGE_DIVISOR;
      const defenseMultiplier = POWER.DEFENSE_BASE / (POWER.DEFENSE_BASE + defenseStat);
      const damage = Math.floor(attackPower * defenseMultiplier);

      const minDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, Math.floor(damage * POWER.MIN_DAMAGE_RATIO));
      const maxDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, damage);
      return {
        min: minDamage,
        max: maxDamage,
        average: (minDamage + maxDamage) / 2,
        formula: "Power Curve"
      };
    },

    difference: (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;

      const { DIFFERENCE, GLOBAL } = state.customConstants;

      const totalAttack = attackStat + equipmentBonus;
      const difference = totalAttack - (defenseStat * DIFFERENCE.DEFENSE_EFFECTIVENESS);
      const baseDamage = Math.max(totalAttack * DIFFERENCE.MIN_DAMAGE_MULTIPLIER, difference);
      const damage = Math.floor(baseDamage / DIFFERENCE.FINAL_DIVISOR);

      const minDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, Math.floor(damage * DIFFERENCE.MIN_DAMAGE_RATIO));
      const maxDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, damage);
      return {
        min: minDamage,
        max: maxDamage,
        average: (minDamage + maxDamage) / 2,
        formula: "Difference-Based"
      };
    },

    'speed-conscious': (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;
      const speed = attacker.speed || 40;

      const { SPEED, GLOBAL } = state.customConstants;

      // Calculate speed modifier
      let speedModifier = 1.0;
      if (speed > SPEED.PENALTY_THRESHOLD) {
        const excessSpeed = Math.min(speed - SPEED.PENALTY_THRESHOLD, SPEED.PENALTY_SCALING);
        const penaltyRatio = excessSpeed / SPEED.PENALTY_SCALING;
        speedModifier = 1 - (SPEED.MAX_PENALTY * penaltyRatio);
      } else if (speed < SPEED.BONUS_THRESHOLD) {
        const lackingSpeed = Math.min(SPEED.BONUS_THRESHOLD - speed, SPEED.BONUS_SCALING);
        const bonusRatio = lackingSpeed / SPEED.BONUS_SCALING;
        speedModifier = 1 + (SPEED.MAX_BONUS * bonusRatio);
      }

      const effectiveAttack = (attackStat + (equipmentBonus * SPEED.EQUIPMENT_SCALING)) * speedModifier;
      const basePower = effectiveAttack / SPEED.BASE_DIVISOR;
      const defenseMitigation = SPEED.DEFENSE_BASE / (SPEED.DEFENSE_BASE + (defenseStat * SPEED.DEFENSE_EFFECTIVENESS));
      const damage = Math.floor(basePower * defenseMitigation);

      const consistencyBonus = speed < SPEED.NEUTRAL_SPEED ? 0.1 : 0;
      const minRatio = Math.min(0.9, SPEED.MIN_DAMAGE_RATIO + consistencyBonus);

      const minDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, Math.floor(damage * minRatio));
      const maxDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, damage);
      return {
        min: minDamage,
        max: maxDamage,
        average: (minDamage + maxDamage) / 2,
        formula: "Speed-Conscious",
        speedModifier
      };
    }
  };

  // Calculate hit chance (OSRS-inspired)
  const calculateHitChance = (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): number => {
    const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
    const defenseStat = isPhysical ? defender.defense : defender.special_defense;

    const { OSRS, GLOBAL } = state.customConstants;

    const attackRoll = (attackStat + OSRS.EFFECTIVE_LEVEL_BONUS) * (equipment.accuracy + OSRS.EQUIPMENT_BASE_MULTIPLIER);
    const defenseRoll = (defenseStat + OSRS.EFFECTIVE_LEVEL_BONUS) * OSRS.EQUIPMENT_BASE_MULTIPLIER;

    const hitChance = attackRoll / (attackRoll + defenseRoll);
    return Math.min(GLOBAL.HIT_CHANCE_MAX, Math.max(GLOBAL.HIT_CHANCE_MIN, hitChance));
  };

  // Calculate damage with selected formula
  const calculateDamage = (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
    return formulas[state.selectedFormula](attacker, defender, equipment, isPhysical);
  };

  // Calculate DPS (damage per second) based on speed
  const calculateDPS = (damage: DamageResult, hitChance: number, speed: number): number => {
    const avgDamage = (damage.min + damage.max) / 2;
    const effectiveDamage = avgDamage * hitChance;
    
    // Speed affects attack rate: higher speed = more attacks per second
    // Base attack rate: 1 attack per 2 seconds at speed 40
    const baseAttackDelay = 2; // seconds
    const speedMultiplier = speed / 40;
    const attacksPerSecond = speedMultiplier / baseAttackDelay;
    
    return effectiveDamage * attacksPerSecond;
  };

  // Determine if attack should be physical or magical
  const shouldUsePhysicalAttack = (attacker: StatBlock): boolean => {
    return attacker.attack >= attacker.special_attack;
  };

  // Get full combat metrics for a matchup
  const getCombatMetrics = (attacker: StatBlock, defender: StatBlock, equipment: Equipment): CombatMetrics => {
    const isPhysical = shouldUsePhysicalAttack(attacker);
    const damage = calculateDamage(attacker, defender, equipment, isPhysical);
    const hitChance = calculateHitChance(attacker, defender, equipment, isPhysical);
    const dps = calculateDPS(damage, hitChance, attacker.speed);
    const speedModifier = damage.speedModifier || 1;

    return {
      damage,
      hitChance,
      dps,
      speedModifier,
      attackType: isPhysical ? 'physical' : 'magical'
    };
  };

  // Update formula constants
  const updateConstants = (newConstants: Partial<typeof DAMAGE_CONSTANTS>) => {
    state.customConstants = { ...state.customConstants, ...newConstants };
  };

  // Reset constants to defaults
  const resetConstants = () => {
    state.customConstants = { ...DAMAGE_CONSTANTS };
  };

  // Get all available formulas
  const availableFormulas = computed(() => [
    { value: 'osrs', label: 'OSRS-Inspired', description: 'Classic mathematical framework with low numbers' },
    { value: 'linear', label: 'Linear Hybrid', description: 'Simple calculation with high consistency' },
    { value: 'power', label: 'Power Curve', description: 'Slight exponential scaling for late game' },
    { value: 'difference', label: 'Difference-Based', description: 'Classic RPG style (Attack - Defense)' },
    { value: 'speed-conscious', label: 'Speed-Conscious', description: 'Implements speed trade-off mechanic' }
  ]);

  return {
    // State
    ...toRefs(state),
    
    // Constants
    EQUIPMENT_TIERS,
    DAMAGE_CONSTANTS,
    
    // Core functions
    calculateDamage,
    calculateHitChance,
    calculateDPS,
    shouldUsePhysicalAttack,
    getCombatMetrics,
    
    // Configuration
    updateConstants,
    resetConstants,
    availableFormulas,
    
    // Individual formula functions (for testing/debugging)
    formulas
  };
}