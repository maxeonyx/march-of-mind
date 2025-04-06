import type { useGameStore } from "@app/store";

declare global {
  interface Window {
    gameStore?: ReturnType<typeof useGameStore>;
    getStore(): () => ReturnType<typeof useGameStore>;
  }
}
