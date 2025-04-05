import { defineStore } from 'pinia';
import { ref } from 'vue';
import { GamePhase } from '../types';
import { useResources } from '../composables/useResources';
import { useTime } from '../composables/useTime';
import { usePhase } from '../composables/usePhase';
import { useTalent } from '../composables/useTalent';
import { useProducts } from '../composables/useProducts';

/**
 * Main game store that coordinates all modules
 */
export const useGameStore = defineStore('game', () => {
  // Create a message for the welcome screen
  const message = ref('Welcome to March of Mind!'); // TODO: Maybe make an opening screen / menu screen? with a "Play" button?
  const lastSavedAt = ref(0);

  // Initialize our module states
  const resources = useResources();
  const time = useTime();
  const phase = usePhase();
  const talent = useTalent(resources);
  const products = useProducts(resources, talent, time);

  /**
   * Process one month of game time
   */
  function processOneMonth() {
    // Only process game mechanics if in company phase or beyond
    if (phase.state.gamePhase !== GamePhase.JOB) {
      // Process talent income/expenses
      talent.processMonthlyFinances();

      // Process product development
      products.processMonthlyDevelopment();
    }

    // Save the game
    saveGame();
  }

  /**
   * Start the game ticker
   */
  function startGameTicker() {
    time.startGameTicker(processOneMonth);
  }

  /**
   * Stop the game ticker
   */
  function stopGameTicker() {
    time.stopGameTicker();
  }

  /**
   * Save the game state to localStorage
   */
  function saveGame() {
    // Collect save data from each module
    const saveData = {
      savedAt: Date.now(),
      
      // Each module's save data
      phase: phase.save(),
      resources: resources.save(),
      time: time.save(),
      talent: talent.save(),
      products: products.save()
    };

    localStorage.setItem('marchOfMindSave', JSON.stringify(saveData));
    lastSavedAt.value = saveData.savedAt;
  }

  /**
   * Load the game state from localStorage
   */
  function loadGame() {
    const saveString = localStorage.getItem('marchOfMindSave');
    if (saveString) {
      try {
        const saveData = JSON.parse(saveString);
        
        // Load each module's state
        phase.load(saveData.phase);
        resources.load(saveData.resources);
        time.load(saveData.time);
        talent.load(saveData.talent);
        products.load(saveData.products);
        
        lastSavedAt.value = saveData.savedAt || 0;
        return true;
      } catch (e) {
        console.error('Failed to load save data', e);
        return false;
      }
    }

    return false;
  }

  /**
   * Initialize the game
   */
  function init() {
    loadGame();
    startGameTicker();
  }

  /**
   * Reset the game state (for testing or starting over)
   */
  function resetGame() {
    // Reset all modules
    phase.reset();
    resources.reset();
    time.reset();
    talent.reset();
    products.reset();

    // Restart the time ticker
    startGameTicker();

    // Clear localStorage
    localStorage.removeItem('marchOfMindSave');
    lastSavedAt.value = 0;
  }

  return {
    // State
    message,
    lastSavedAt,
    
    // Module states (accessible as properties)
    resources,
    time,
    phase,
    talent,
    products,
    
    // Methods
    init,
    processOneMonth,
    startGameTicker,
    stopGameTicker,
    saveGame,
    loadGame,
    resetGame,
  };
});