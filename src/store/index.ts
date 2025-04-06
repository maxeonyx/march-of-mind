import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { GamePhase } from '@/types/game-phase';
import { useResources } from './resources';
import { useTime } from './time';
import { useResearchers } from './researchers';
import { useDiscoveries } from './discoveries';
import { useHardware } from './hardware';
import { useAIProducts } from './ai-products';

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
  
  // Core modules for educational pivot
  const discoveries = useDiscoveries(resources);
  const hardware = useHardware(resources);
  const researchers = useResearchers(resources, hardware, discoveries);
  const aiProducts = useAIProducts(resources, hardware);

  // Game phase directly in the store
  const phase = ref(GamePhase.RESEARCH_PHASE);

  // Phase-related computed properties
  const hasFoundedLab = computed(() => phase.value === GamePhase.LAB_PHASE || 
                                        phase.value === GamePhase.INDUSTRY_PHASE || 
                                        phase.value === GamePhase.AGI_PHASE);

  const phaseTitle = computed(() => {
    switch (phase.value) {
      case GamePhase.RESEARCH_PHASE:
        return "Research Lab";
      case GamePhase.LAB_PHASE:
        return "AI Research Center";
      case GamePhase.INDUSTRY_PHASE:
        return "AI Industry Applications";
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
    // Process researchers for lab phase and beyond
    if (phase.value === GamePhase.LAB_PHASE || 
        phase.value === GamePhase.INDUSTRY_PHASE || 
        phase.value === GamePhase.AGI_PHASE) {
      // Process researcher finances
      researchers.processMonthlyFinances();
      
      // Add income from developed AI products
      resources.addMoney(aiProducts.monthlyIncome.value);
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
      
      // Core modules
      discoveries: discoveries.save(),
      hardware: hardware.save(),
      researchers: researchers.save(),
      aiProducts: aiProducts.save()
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
      
      // Core modules (with null checks)
      if (saveData.discoveries) discoveries.load(saveData.discoveries);
      if (saveData.hardware) hardware.load(saveData.hardware);
      if (saveData.researchers) researchers.load(saveData.researchers);
      if (saveData.aiProducts) aiProducts.load(saveData.aiProducts);

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
    
    // Core modules
    discoveries.reset();
    hardware.reset();
    researchers.reset();
    aiProducts.reset();

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
    hasFoundedLab,
    enterPhase,

    // Module states (accessible as properties)
    resources,
    time,
    
    // Core modules
    discoveries,
    hardware,
    researchers,
    aiProducts,

    // Methods
    processOneMonth,
    startGameTicker,
    stopGameTicker,
    saveGame,
    loadGame,
    resetGame,
  };
});