import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useAppStore } from './stores/app';
import { useResourcesStore } from './stores/resources';
import { useDatacentreStore } from './stores/datacentre';
import { useTechTreeStore } from './stores/techTree';
import { useTimeStore } from './stores/time';

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
    const appStore = useAppStore();
    const resourcesStore = useResourcesStore();
    const datacentreStore = useDatacentreStore();
    const techTreeStore = useTechTreeStore();
    const timeStore = useTimeStore();
    
    // Expose stores for tests
    window.__appStore = appStore;
    window.__resourcesStore = resourcesStore;
    window.__datacentreStore = datacentreStore;
    window.__techTreeStore = techTreeStore;
    window.__timeStore = timeStore;
    
    window.__appMethods = {
      // Add basic methods for test compatibility
      dummyMethod: () => console.log('Test method called'),
      initializeStores: () => {
        resourcesStore.initialize();
        datacentreStore.initialize();
        techTreeStore.initialize();
        timeStore.initialize();
      },
      startGame: () => timeStore.startGame(),
      stopGame: () => timeStore.stopGame()
    };
  }, 0);
}

// Mount the app
app.mount('#app');