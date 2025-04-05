/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * Type declaration for the gameStore global variable
 */
declare global {
  interface Window {
    gameStore?: any; // Use any to avoid circular references in tests
  }
}

export {};