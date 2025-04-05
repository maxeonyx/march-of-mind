
/**
 * Type declaration for the gameStore global variable
 */

type _GameStore = ReturnType<typeof import("@app/store").useGameStore>

declare global {
  interface Window {
    gameStore?: _GameStore;
    getStore(): () => _GameStore;
  }
}

export {};