import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { GamePhase } from '@/types/game-phase';
import { useResources } from './resources';
import { useTime } from './time';
import { useTalent } from './talent';
import { useProducts } from './products';
import { useResearchers } from './researchers';
import { useDiscoveries } from './discoveries';
import { useHardware } from './hardware';

// Cost to found a company (moved from usePhase)
export const COMPANY_FOUNDING_COST = 100;

// Cost to found a lab in insights
export const LAB_FOUNDING_COST = 10;

/**
 * Main game store that coordinates all modules
 */
// Adding a type cast to fix circular reference issues
export const useGameStore = defineStore('game', () => {
  // Create a message for the welcome screen
  const message = ref('Welcome to March of Mind!');
  const lastSavedAt = ref(0);
  const showWelcomeScreen = ref(false); // Will be used for future welcome screen

  // Initialize our module states
  const resources = useResources();
  const time = useTime();
  
  // Legacy modules (will be replaced)
  const talent = useTalent(resources);
  const products = useProducts(resources, talent, time);
  
  // New modules for educational pivot
  const discoveries = useDiscoveries(resources);
  const hardware = useHardware(resources);
  const researchers = useResearchers(resources, hardware, discoveries);

  // Game phase directly in the store
  const phase = ref(GamePhase.JOB);

  // Phase-related computed properties
  const hasFoundedCompany = computed(() => phase.value !== GamePhase.JOB);
  const hasFoundedLab = computed(() => phase.value === GamePhase.LAB_PHASE);

  const phaseTitle = computed(() => {
    switch (phase.value) {
      // Original phases
      case GamePhase.JOB:
        return "Working for the Man";
      case GamePhase.COMPANY:
        return "Company Dashboard";
      case GamePhase.MARKETING:
        return "Marketing Department";
      case GamePhase.RESEARCH:
        return "Research & Development";
        
      // New phases
      case GamePhase.RESEARCH_PHASE:
        return "Research Lab";
      case GamePhase.LAB_PHASE:
        return "AI Research Center";
      case GamePhase.DISCOVERY_PHASE:
        return "Advanced Research";
      case GamePhase.AGI_PHASE:
        return "AGI Development";
        
      default:
        return "March of Mind";
    }
  });

  // Phase-related methods
  function enterPhase(newPhase: GamePhase) {
    phase.value = newPhase;
  }

  function resetPhase() {
    phase.value = GamePhase.RESEARCH_PHASE;
  }

  function savePhase() {
    return {
      gamePhase: phase.value
    };
  }

  function loadPhase(data: any) {
    if (data) {
      phase.value = data.gamePhase || GamePhase.RESEARCH_PHASE;
    }
  }

  /**
   * Process one month of game time
   */
  function processOneMonth() {
    // Only process game mechanics if in company phase or beyond
    if (phase.value !== GamePhase.JOB) {
      // Process talent income/expenses
      talent.processMonthlyFinances();

      // Process product development
      products.processMonthlyDevelopment();
    }
    
    // Process new game phases
    if (phase.value === GamePhase.LAB_PHASE || 
        phase.value === GamePhase.DISCOVERY_PHASE || 
        phase.value === GamePhase.AGI_PHASE) {
      // Process researcher finances
      researchers.processMonthlyFinances();
    }

    // Save the game
    saveGame();
  }

  /**
   * Start the game ticker
   * @param saveCallback Optional callback to run after saving the game
   */
  function startGameTicker(saveCallback?: (saveData: any) => void) {
    // Create a wrapper function that calls processOneMonth and then the callback
    const tickWrapper = () => {
      processOneMonth();
      if (saveCallback) {
        const saveData = saveGame();
        saveCallback(saveData);
      }
    };

    time.startGameTicker(tickWrapper);
  }

  /**
   * Stop the game ticker
   */
  function stopGameTicker() {
    time.stopGameTicker();
  }

  /**
   * Save the game state and return the save data object
   * @returns The saved game data object
   */
  function saveGame() {
    // Collect save data from each module
    const saveData = {
      savedAt: Date.now(),

      // Each module's save data
      phase: savePhase(),
      resources: resources.save(),
      time: time.save(),
      
      // Legacy modules
      talent: talent.save(),
      products: products.save(),
      
      // New modules
      discoveries: discoveries.save(),
      hardware: hardware.save(),
      researchers: researchers.save()
    };

    lastSavedAt.value = saveData.savedAt;
    return saveData;
  }

  /**
   * Load the game state from localStorage
   */
  function loadGame(saveData: any) {
    try {
      // Load each module's state
      loadPhase(saveData.phase);
      resources.load(saveData.resources);
      time.load(saveData.time);
      
      // Legacy modules
      talent.load(saveData.talent);
      products.load(saveData.products);
      
      // New modules (with null checks)
      if (saveData.discoveries) discoveries.load(saveData.discoveries);
      if (saveData.hardware) hardware.load(saveData.hardware);
      if (saveData.researchers) researchers.load(saveData.researchers);

      lastSavedAt.value = saveData.savedAt || 0;
      return true;
    } catch (e) {
      throw Error('Failed to load save data');
    }
  }

  /**
   * Reset the game state (for testing or starting over)
   */
  function resetGame() {
    // Reset all modules
    resetPhase();
    resources.reset();
    time.reset();
    
    // Legacy modules
    talent.reset();
    products.reset();
    
    // New modules
    discoveries.reset();
    hardware.reset();
    researchers.reset();

    // Restart the time ticker
    startGameTicker();

    lastSavedAt.value = 0;
  }

  return {
    // State
    message,
    lastSavedAt,
    showWelcomeScreen,

    // Phase state
    phase,
    phaseTitle,
    hasFoundedCompany,
    hasFoundedLab,
    enterPhase,

    // Module states (accessible as properties)
    resources,
    time,
    
    // Legacy modules
    talent,
    products,
    
    // New modules
    discoveries,
    hardware,
    researchers,

    // Methods
    processOneMonth,
    startGameTicker,
    stopGameTicker,
    saveGame,
    loadGame,
    resetGame,
  };
});