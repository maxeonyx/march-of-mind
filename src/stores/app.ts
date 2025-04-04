import { defineStore } from 'pinia';

/**
 * Simple central store for the application
 */
export const useAppStore = defineStore('app', {
  state: () => {
    return {
      message: 'Hello World from Pinia Store!',
      count: 0
    };
  },
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++;
    },
    
    decrement() {
      this.count--;
    },
    
    setMessage(message: string) {
      this.message = message;
    }
  }
});