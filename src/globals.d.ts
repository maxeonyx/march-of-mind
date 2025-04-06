import type { useGameStore } from "./store";

declare global {
  interface Window {
    gameStore?: ReturnType<typeof useGameStore>;
    getStore(): ReturnType<typeof useGameStore>;
  }
}
