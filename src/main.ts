import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Import App component
import App from './App.vue';
import { useGameStore } from './store';

// Create Vue app instance
const app = createApp(App);

// Set up Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Mount the app
app.mount('#app');

if (typeof window !== 'undefined' && !window.gameStore) {
  const game = useGameStore();

  game.init();

  // Expose store for tests & manual debugging. This also marks startup
  window.gameStore = game;
  window.getStore = () => {
      if (window.gameStore) {
        return window.gameStore;
      } else {
        throw Error("Game store not created. This means the app has not initialized correctly")
      }
  };
}