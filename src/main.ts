import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useAppStore } from './stores/app';

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
    const store = useAppStore();
    
    // Expose store for tests
    window.__appStore = store;
    window.__appMethods = {
      // Add basic methods for test compatibility
      dummyMethod: () => console.log('Test method called')
    };
  }, 0);
}

// Mount the app
app.mount('#app');