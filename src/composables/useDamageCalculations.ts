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
  tempo: number;
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
  tempoModifier: number;
  effectiveSpeed: number;
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

  // TEMPO System Constants
  TEMPO: {
    NEUTRAL_TEMPO: 100,
    MIN_TEMPO: 25,
    MAX_TEMPO: 200,
    EFFECTIVENESS_CURVE_STEEPNESS: 0.002, // Controls how aggressive the curve is
    FREQUENCY_MULTIPLIER: 1.0, // How much tempo affects action frequency
    DAMAGE_MULTIPLIER: 1.0 // How much tempo affects damage effectiveness
  },

  // Global Constants
  GLOBAL: {
    MINIMUM_DAMAGE: 1,
    HIT_CHANCE_MIN: 0.05,
    HIT_CHANCE_MAX: 0.95
  }
};

export type DamageFormulaType = 'osrs' | 'linear' | 'power' | 'difference' | 'speed-conscious' | 'tempo-separated';

export function useDamageCalculations(constants?: typeof DAMAGE_CONSTANTS) {
  // Use provided constants or fallback to default
  const activeConstants = constants || DAMAGE_CONSTANTS;
  
  // Reactive state for calculation parameters
  const state = reactive({
    selectedFormula: 'osrs' as DamageFormulaType,
    customConstants: { ...activeConstants },
  });

  // TEMPO calculation functions
  const calculateTempoEffectiveness = (tempo: number): number => {
    const NEUTRAL_TEMPO = 100;
    const EFFECTIVENESS_CURVE_STEEPNESS = 0.002;
    const DAMAGE_MULTIPLIER = 1.0;
    
    const tempoDeviation = tempo - NEUTRAL_TEMPO;
    
    // Effectiveness curve: lower tempo = more effective, higher tempo = less effective
    // Using exponential decay for smooth curve
    const effectiveness = 1 - (tempoDeviation * EFFECTIVENESS_CURVE_STEEPNESS * DAMAGE_MULTIPLIER);
    return Math.max(0.25, Math.min(1.75, effectiveness)); // Clamp between 25% and 175%
  };

  const calculateTempoFrequency = (speed: number, tempo: number): number => {
    const NEUTRAL_TEMPO = 100;
    const FREQUENCY_MULTIPLIER = 1.0;
    
    // Base frequency from speed, modified by tempo
    const tempoFrequencyMultiplier = tempo / NEUTRAL_TEMPO;
    return speed * tempoFrequencyMultiplier * FREQUENCY_MULTIPLIER;
  };

  const getTempoModifiers = (speed: number, tempo: number) => {
    const effectiveness = calculateTempoEffectiveness(tempo);
    const effectiveSpeed = calculateTempoFrequency(speed, tempo);
    
    return {
      tempoModifier: effectiveness,
      effectiveSpeed,
      speedModifier: 1.0 // Keep original speed modifier for backwards compatibility
    };
  };

  // Formula implementations
  const formulas = {
    osrs: (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;

      const { OSRS, GLOBAL } = activeConstants;

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

      const { LINEAR, GLOBAL } = activeConstants;

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

      const { POWER, GLOBAL } = activeConstants;

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

      const { DIFFERENCE, GLOBAL } = activeConstants;

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

      const { SPEED, GLOBAL } = activeConstants;

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
    },

    'tempo-separated': (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
      const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
      const defenseStat = isPhysical ? defender.defense : defender.special_defense;
      const equipmentBonus = isPhysical ? equipment.strength : equipment.magic_damage;
      const speed = attacker.speed || 40;
      const tempo = attacker.tempo || 100;

      const { SPEED, GLOBAL } = activeConstants;

      // Get tempo modifiers (effectiveness and frequency)
      const { tempoModifier } = getTempoModifiers(speed, tempo);

      // Apply tempo effectiveness to attack stats (not speed penalties)
      const effectiveAttack = (attackStat + (equipmentBonus * SPEED.EQUIPMENT_SCALING)) * tempoModifier;
      const basePower = effectiveAttack / SPEED.BASE_DIVISOR;
      const defenseMitigation = SPEED.DEFENSE_BASE / (SPEED.DEFENSE_BASE + (defenseStat * SPEED.DEFENSE_EFFECTIVENESS));
      const damage = Math.floor(basePower * defenseMitigation);

      // Higher effectiveness (lower tempo) gives more consistent damage
      const consistencyBonus = tempo < 100 ? (100 - tempo) * 0.001 : 0;
      const minRatio = Math.min(0.9, SPEED.MIN_DAMAGE_RATIO + consistencyBonus);

      const minDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, Math.floor(damage * minRatio));
      const maxDamage = Math.max(GLOBAL.MINIMUM_DAMAGE, damage);
      
      return {
        min: minDamage,
        max: maxDamage,
        average: (minDamage + maxDamage) / 2,
        formula: "Tempo-Separated",
        speedModifier: tempoModifier
      };
    }
  };

  // Calculate hit chance (OSRS-inspired)
  const calculateHitChance = (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): number => {
    const attackStat = isPhysical ? attacker.attack : attacker.special_attack;
    const defenseStat = isPhysical ? defender.defense : defender.special_defense;

    const { OSRS, GLOBAL } = activeConstants;

    const attackRoll = (attackStat + OSRS.EFFECTIVE_LEVEL_BONUS) * (equipment.accuracy + OSRS.EQUIPMENT_BASE_MULTIPLIER);
    const defenseRoll = (defenseStat + OSRS.EFFECTIVE_LEVEL_BONUS) * OSRS.EQUIPMENT_BASE_MULTIPLIER;

    const hitChance = attackRoll / (attackRoll + defenseRoll);
    return Math.min(GLOBAL.HIT_CHANCE_MAX, Math.max(GLOBAL.HIT_CHANCE_MIN, hitChance));
  };

  // Calculate damage with selected formula
  const calculateDamage = (attacker: StatBlock, defender: StatBlock, equipment: Equipment, isPhysical: boolean = true): DamageResult => {
    return formulas[state.selectedFormula](attacker, defender, equipment, isPhysical);
  };

  // Calculate DPS (damage per second) based on speed and tempo
  const calculateDPS = (damage: DamageResult, hitChance: number, speed: number, tempo?: number): number => {
    const avgDamage = (damage.min + damage.max) / 2;
    const effectiveDamage = avgDamage * hitChance;
    
    // If tempo is provided, use effective speed calculation
    let effectiveSpeed = speed;
    if (tempo !== undefined) {
      const { effectiveSpeed: calculatedEffectiveSpeed } = getTempoModifiers(speed, tempo);
      effectiveSpeed = calculatedEffectiveSpeed;
    }
    
    // Speed affects attack rate: higher speed = more attacks per second
    // Base attack rate: 1 attack per 2 seconds at speed 40
    const baseAttackDelay = 2; // seconds
    const speedMultiplier = effectiveSpeed / 40;
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
    
    // Calculate tempo modifiers if tempo is present
    const tempo = attacker.tempo || 100;
    const { tempoModifier, effectiveSpeed } = getTempoModifiers(attacker.speed, tempo);
    
    const dps = calculateDPS(damage, hitChance, attacker.speed, tempo);
    const speedModifier = damage.speedModifier || 1;

    return {
      damage,
      hitChance,
      dps,
      speedModifier,
      tempoModifier,
      effectiveSpeed,
      attackType: isPhysical ? 'physical' : 'magical'
    };
  };

  // Update formula constants
  const updateConstants = (newConstants: Partial<typeof DAMAGE_CONSTANTS>) => {
    state.customConstants = { ...state.customConstants, ...newConstants };
  };

  // Reset constants to defaults
  const resetConstants = () => {
    state.customConstants = { ...activeConstants };
  };

  // Get all available formulas
  const availableFormulas = computed(() => [
    { value: 'osrs', label: 'OSRS-Inspired', description: 'Classic mathematical framework with low numbers' },
    { value: 'linear', label: 'Linear Hybrid', description: 'Simple calculation with high consistency' },
    { value: 'power', label: 'Power Curve', description: 'Slight exponential scaling for late game' },
    { value: 'difference', label: 'Difference-Based', description: 'Classic RPG style (Attack - Defense)' },
    { value: 'speed-conscious', label: 'Speed-Conscious', description: 'Implements speed trade-off mechanic' },
    { value: 'tempo-separated', label: 'TEMPO-Separated', description: 'Speed for frequency, TEMPO for effectiveness trade-offs' }
  ]);

  return {
    // State
    ...toRefs(state),
    
    // Constants
    EQUIPMENT_TIERS,
    DAMAGE_CONSTANTS: computed(() => activeConstants),
    
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