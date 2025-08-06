import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import {
  EQUIPMENT_TIERS,
  useDamageCalculations,
  type DamageFormulaType,
  type DamageResult,
  type Equipment,
  type StatBlock
} from "../composables/useDamageCalculations";

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
  attackType: 'physical' | 'magical';
}

export const useDamageCalculatorStore = defineStore(
  "damageCalculatorStore",
  () => {
    // Import damage calculations composable
    const damageCalc = useDamageCalculations();

    // State
    const _playerStats = ref<StatBlock>({
      name: "Player",
      level: 50,
      hp: 100,
      attack: 50,
      defense: 50,
      special_attack: 50,
      special_defense: 50,
      speed: 50
    });

    const _enemyStats = ref<StatBlock>({
      name: "Enemy",
      level: 50,
      hp: 100,
      attack: 50,
      defense: 50,
      special_attack: 50,
      special_defense: 50,
      speed: 50
    });

    const _playerEquipment = ref<string>("none");
    const _enemyEquipment = ref<string>("none");
    const _activeFormulas = ref<DamageFormulaType[]>(["osrs"]);
    const _presets = useLocalStorage<DamageCalculatorPreset[]>("damageCalculatorPresets", []);
    const _autoCalculate = ref(true);
    const _results = ref<FormulaResult[]>([]);

    // Computed - Direct ref access for better performance
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
        speed: 50
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
      // Update selected formula in damage calculations
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
    
    // Deep watch only stats that need it, with reduced frequency
    watch(_playerStats, debouncedCalculate, { deep: true, flush: 'post' });
    watch(_enemyStats, debouncedCalculate, { deep: true, flush: 'post' });

    // Initial calculation
    if (_autoCalculate.value && _activeFormulas.value.length > 0) {
      calculateResults();
    }

    return {
      // State
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

      // Preset management
      savePreset,
      loadPreset,
      deletePreset,
      exportPresets,
      importPresets,
    };
  }
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDamageCalculatorStore, import.meta.hot));
}