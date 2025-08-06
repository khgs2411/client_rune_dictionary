import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, watch } from "vue";
import {
  EQUIPMENT_TIERS,
  useDamageCalculations,
  type DamageFormulaType,
  type DamageResult,
  type Equipment,
  type StatBlock
} from "../composables/useDamageCalculations";

// Damage formula configuration constants - centralized in store
export const DEFAULT_DAMAGE_CONSTANTS = {
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

// Interfaces
export interface DamageCalculatorPreset {
  id: string;
  name: string;
  playerStats: StatBlock;
  enemyStats: StatBlock;
  playerEquipment: string;
  enemyEquipment: string;
  activeFormulas: DamageFormulaType[];
  timestamp: number;
}

export interface FormulaResult {
  formula: DamageFormulaType;
  damage: DamageResult;
  hitChance: number;
  dps: number;
  speedModifier: number;
  tempoModifier?: number;
  effectiveSpeed?: number;
  attackType: 'physical' | 'magical';
}

export const useDamageCalculatorStore = defineStore(
  "damageCalculatorStore",
  () => {
    // State
    const _damageConstants = useLocalStorage<typeof DEFAULT_DAMAGE_CONSTANTS>(
      "_damageConstants",
      () => JSON.parse(JSON.stringify(DEFAULT_DAMAGE_CONSTANTS)) // Deep clone to avoid reference issues
    );

    const _playerStats = useLocalStorage<StatBlock>('_playerStats', {
      name: "Player",
      level: 50,
      hp: 100,
      attack: 50,
      defense: 50,
      special_attack: 50,
      special_defense: 50,
      speed: 50,
      tempo: 100
    });

    const _enemyStats = useLocalStorage<StatBlock>('_enemyStats', {
      name: "Enemy",
      level: 50,
      hp: 100,
      attack: 50,
      defense: 50,
      special_attack: 50,
      special_defense: 50,
      speed: 50,
      tempo: 100
    });

    const _playerEquipment = useLocalStorage<string>("_playerEquipment", 'none');
    const _enemyEquipment = useLocalStorage<string>("_enemyEquipment", 'none');
    const _activeFormulas = useLocalStorage<DamageFormulaType[]>('_activeFormulas', ["osrs"]);
    const _presets = useLocalStorage<DamageCalculatorPreset[]>("damageCalculatorPresets", []);
    const _autoCalculate = useLocalStorage('_autoCalculate', true);
    const _results = useLocalStorage<FormulaResult[]>('_results', []);

    // Computed - Direct ref access for better performance
    const damageConstants = computed(() => _damageConstants.value);
    const playerStats = computed(() => _playerStats.value);
    const enemyStats = computed(() => _enemyStats.value);
    const playerEquipment = computed(() => _playerEquipment.value);
    const enemyEquipment = computed(() => _enemyEquipment.value);
    const activeFormulas = computed(() => _activeFormulas.value);
    const presets = computed(() => _presets.value);
    const autoCalculate = computed(() => _autoCalculate.value);
    const results = computed(() => _results.value);

    // Equipment getters
    const playerEquipmentData = computed((): Equipment => {
      return EQUIPMENT_TIERS[_playerEquipment.value] || EQUIPMENT_TIERS.none;
    });

    const enemyEquipmentData = computed((): Equipment => {
      return EQUIPMENT_TIERS[_enemyEquipment.value] || EQUIPMENT_TIERS.none;
    });

    // Memoized equipment bonus calculations
    const playerEquipmentBonus = computed((): number => {
      const equipment = EQUIPMENT_TIERS[_playerEquipment.value] || EQUIPMENT_TIERS.none;
      return ((equipment.strength + equipment.magic_damage) / 2) / 100;
    });

    const enemyEquipmentBonus = computed((): number => {
      const equipment = EQUIPMENT_TIERS[_enemyEquipment.value] || EQUIPMENT_TIERS.none;
      return ((equipment.strength + equipment.magic_damage) / 2) / 100;
    });

    // Optimized stats with equipment - minimize object creation
    const playerStatsWithEquipment = computed((): StatBlock => {
      const bonus = 1 + playerEquipmentBonus.value;
      const stats = _playerStats.value;
      return {
        name: stats.name,
        level: stats.level,
        hp: stats.hp,
        attack: Math.floor(stats.attack * bonus),
        defense: Math.floor(stats.defense * bonus),
        special_attack: Math.floor(stats.special_attack * bonus),
        special_defense: Math.floor(stats.special_defense * bonus),
        speed: stats.speed, // Speed not affected by equipment
        tempo: stats.tempo, // Tempo not affected by basic equipment
      };
    });

    const enemyStatsWithEquipment = computed((): StatBlock => {
      const bonus = 1 + enemyEquipmentBonus.value;
      const stats = _enemyStats.value;
      return {
        name: stats.name,
        level: stats.level,
        hp: stats.hp,
        attack: Math.floor(stats.attack * bonus),
        defense: Math.floor(stats.defense * bonus),
        special_attack: Math.floor(stats.special_attack * bonus),
        special_defense: Math.floor(stats.special_defense * bonus),
        speed: stats.speed, // Speed not affected by equipment
        tempo: stats.tempo, // Tempo not affected by basic equipment
      };
    });

    // Actions
    function updatePlayerStat(stat: keyof StatBlock, value: number) {
      if (stat === 'name' || stat === 'level') return; // Skip non-numeric stats
      const clampedValue = Math.max(1, Math.min(999, value));
      _playerStats.value = { ..._playerStats.value, [stat]: clampedValue };
    }

    function updateEnemyStat(stat: keyof StatBlock, value: number) {
      if (stat === 'name' || stat === 'level') return;
      const clampedValue = Math.max(1, Math.min(999, value));
      _enemyStats.value = { ..._enemyStats.value, [stat]: clampedValue };
    }

    function setPlayerEquipment(tier: string) {
      if (tier in EQUIPMENT_TIERS) {
        _playerEquipment.value = tier;
      }
    }

    function setEnemyEquipment(tier: string) {
      if (tier in EQUIPMENT_TIERS) {
        _enemyEquipment.value = tier;
      }
    }

    function toggleFormula(formula: DamageFormulaType) {
      const index = _activeFormulas.value.indexOf(formula);
      if (index > -1) {
        _activeFormulas.value = _activeFormulas.value.filter(f => f !== formula);
      } else {
        _activeFormulas.value = [..._activeFormulas.value, formula];
      }
    }

    function setActiveFormulas(formulas: DamageFormulaType[]) {
      _activeFormulas.value = formulas;
    }

    function resetStats(target: 'player' | 'enemy' | 'both' = 'both') {
      const defaultStats: StatBlock = {
        name: "",
        level: 50,
        hp: 100,
        attack: 50,
        defense: 50,
        special_attack: 50,
        special_defense: 50,
        speed: 50,
        tempo: 100
      };

      if (target === 'player' || target === 'both') {
        _playerStats.value = { ...defaultStats, name: "Player" };
        _playerEquipment.value = "none";
      }
      if (target === 'enemy' || target === 'both') {
        _enemyStats.value = { ...defaultStats, name: "Enemy" };
        _enemyEquipment.value = "none";
      }
    }

    function calculateResults() {
      // Create damage calculations with reactive constants from store
      const damageCalc = useDamageCalculations(_damageConstants.value);
      const results: FormulaResult[] = [];

      for (const formula of _activeFormulas.value) {
        damageCalc.selectedFormula.value = formula;
        const metrics = damageCalc.getCombatMetrics(
          playerStatsWithEquipment.value,
          enemyStatsWithEquipment.value,
          playerEquipmentData.value
        );

        results.push({
          formula,
          damage: metrics.damage,
          hitChance: metrics.hitChance,
          dps: metrics.dps,
          speedModifier: metrics.speedModifier,
          tempoModifier: metrics.tempoModifier,
          effectiveSpeed: metrics.effectiveSpeed,
          attackType: metrics.attackType
        });
      }

      _results.value = results;
    }

    function clearResults() {
      _results.value = [];
    }

    function setAutoCalculate(value: boolean) {
      _autoCalculate.value = value;
      if (value) {
        calculateResults();
      }
    }

    // Constants management
    function updateConstants(newConstants: Partial<typeof DEFAULT_DAMAGE_CONSTANTS>) {
      _damageConstants.value = { ..._damageConstants.value, ...newConstants };
    }

    function resetConstants() {
      _damageConstants.value = JSON.parse(JSON.stringify(DEFAULT_DAMAGE_CONSTANTS));
    }

    function updateFormulaConstants(formula: DamageFormulaType, constants: Record<string, number>) {
      const formulaKey = getFormulaConstantKey(formula);
      if (!formulaKey) return;

      _damageConstants.value = {
        ..._damageConstants.value,
        [formulaKey]: { ..._damageConstants.value[formulaKey as keyof typeof _damageConstants.value], ...constants }
      };
    }

    function updateGlobalConstants(constants: Partial<typeof DEFAULT_DAMAGE_CONSTANTS.GLOBAL>) {
      _damageConstants.value = {
        ..._damageConstants.value,
        GLOBAL: { ..._damageConstants.value.GLOBAL, ...constants }
      };
    }

    function getFormulaConstantKey(formula: DamageFormulaType): string | null {
      switch (formula) {
        case "osrs": return "OSRS";
        case "linear": return "LINEAR";
        case "power": return "POWER";
        case "difference": return "DIFFERENCE";
        case "speed-conscious": return "SPEED";
        default: return null;
      }
    }

    // Preset management
    function savePreset(name: string) {
      const preset: DamageCalculatorPreset = {
        id: `preset_${Date.now()}`,
        name,
        playerStats: { ..._playerStats.value },
        enemyStats: { ..._enemyStats.value },
        playerEquipment: _playerEquipment.value,
        enemyEquipment: _enemyEquipment.value,
        activeFormulas: [..._activeFormulas.value],
        timestamp: Date.now()
      };

      _presets.value = [..._presets.value, preset];
    }

    function loadPreset(presetId: string) {
      const preset = _presets.value.find(p => p.id === presetId);
      if (!preset) return;

      _playerStats.value = { ...preset.playerStats };
      _enemyStats.value = { ...preset.enemyStats };
      _playerEquipment.value = preset.playerEquipment;
      _enemyEquipment.value = preset.enemyEquipment;
      _activeFormulas.value = [...preset.activeFormulas];

      if (_autoCalculate.value) {
        calculateResults();
      }
    }

    function deletePreset(presetId: string) {
      _presets.value = _presets.value.filter(p => p.id !== presetId);
    }

    function exportPresets(): string {
      return JSON.stringify(_presets.value, null, 2);
    }

    function importPresets(jsonString: string) {
      try {
        const imported = JSON.parse(jsonString);
        if (Array.isArray(imported)) {
          // Validate preset structure
          const validPresets = imported.filter(p =>
            p.id && p.name && p.playerStats && p.enemyStats &&
            p.playerEquipment && p.enemyEquipment && p.activeFormulas
          );
          _presets.value = [..._presets.value, ...validPresets];
        }
      } catch (error) {
        console.error("Failed to import presets:", error);
      }
    }

    // Performance-optimized auto-calculation with improved debouncing
    let calculateTimeout: any = null;

    function debouncedCalculate() {
      if (!_autoCalculate.value) return;

      if (calculateTimeout) {
        clearTimeout(calculateTimeout);
      }

      // Reduced debounce time for more responsive UI
      calculateTimeout = setTimeout(() => {
        calculateResults();
      }, 150);
    }

    // Optimized watchers - separate shallow watchers for better performance
    watch(_playerEquipment, debouncedCalculate);
    watch(_enemyEquipment, debouncedCalculate);
    watch(_activeFormulas, debouncedCalculate, { deep: false });
    watch(_damageConstants, debouncedCalculate, { deep: true });

    // Deep watch only stats that need it, with reduced frequency
    watch(_playerStats, debouncedCalculate, { deep: true, flush: 'post' });
    watch(_enemyStats, debouncedCalculate, { deep: true, flush: 'post' });

    // Initial calculation
    if (_autoCalculate.value && _activeFormulas.value.length > 0) {
      calculateResults();
    }

    return {
      // State
      damageConstants,
      playerStats,
      enemyStats,
      playerEquipment,
      enemyEquipment,
      activeFormulas,
      presets,
      autoCalculate,
      results,

      // Computed
      playerEquipmentData,
      enemyEquipmentData,
      playerEquipmentBonus,
      enemyEquipmentBonus,
      playerStatsWithEquipment,
      enemyStatsWithEquipment,

      // Actions
      updatePlayerStat,
      updateEnemyStat,
      setPlayerEquipment,
      setEnemyEquipment,
      toggleFormula,
      setActiveFormulas,
      resetStats,
      calculateResults,
      clearResults,
      setAutoCalculate,

      // Constants management
      updateConstants,
      resetConstants,
      updateFormulaConstants,
      updateGlobalConstants,
      getFormulaConstantKey,

      // Constants reference
      DEFAULT_DAMAGE_CONSTANTS,

      // Preset management
      savePreset,
      loadPreset,
      deletePreset,
      exportPresets,
      importPresets,
    };
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDamageCalculatorStore, import.meta.hot));
}