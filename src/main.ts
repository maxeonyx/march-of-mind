import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Import App component
import App from './App.vue';
import { useGameStore } from './store';
import { GamePhase } from './types/game-phase';

// Create Vue app instance
const app = createApp(App);

// Set up Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Mount the app
app.mount('#app');

if (typeof window !== 'undefined' && !window.gameStore) {
  const game = useGameStore();

  // Load save data from localStorage
  try {
    const savedData = localStorage.getItem('marchOfMindSave');
    if (savedData) {
      game.loadGame(JSON.parse(savedData));
    } else {
      // For new games, start in the research phase for the educational pivot
      game.enterPhase(GamePhase.RESEARCH_PHASE);
    }
  } catch (e) {
    console.error('Failed to load save data', e);
    // If there's an error loading, also start in research phase
    game.enterPhase(GamePhase.RESEARCH_PHASE);
  }

  // Start the game ticker with a callback to save to localStorage
  game.startGameTicker(() => {
    // Save game and store the result in localStorage
    const saveData = game.saveGame();
    localStorage.setItem('marchOfMindSave', JSON.stringify(saveData));
  });

  // Expose store for tests & manual debugging. This also marks startup
  window.gameStore = game;
  window.getStore = () => {
    if (window.gameStore) {
      return window.gameStore;
    } else {
      throw Error("Game store not created. This means the app has not initialized correctly")
    }
  };

  console.log("Store initialized.")
}
