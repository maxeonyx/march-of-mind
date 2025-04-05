import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useGameStore } from './stores/game';
import { initGame } from './game';

// Make Pinia available for tests
if (typeof window !== 'undefined' && window.Pinia) {
  window.Pinia.createPinia = createPinia;
  window.Pinia.useGameStore = useGameStore;
}

// Create Vue app instance
const app = createApp(App);

// Set up Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Make the store available globally for tests
if (typeof window !== 'undefined' && !window.__APP_STORE_INITIALIZED) {
  window.__APP_STORE_INITIALIZED = true;
  
  // Initial store setup
  setTimeout(() => {
    const store = useGameStore();
    
    // Prevent auto-loading in tests with fresh localStorage
    const isInTest = window.location.href.includes('playwright');
    
    // Try to load saved game state if not in test
    if (!isInTest) {
      initGame();
    }
    
    // Expose store for tests
    window.__appStore = store;
    window.__appMethods = {
      // Add basic methods for test compatibility
      loadGame: () => store.loadGame(),
      saveGame: () => store.saveGame(),
      resetGame: () => store.resetGame(),
      earnMoney: () => store.earnMoney(),
      foundCompany: () => store.foundCompany()
    };
  }, 0);
}

// Mount the app
app.mount('#app');