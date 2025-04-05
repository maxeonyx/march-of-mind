import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useGameStore } from './stores/game';

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
}