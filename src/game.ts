import { useGameStore } from './stores/game';
import { useProductStore } from './stores/modules/products';

/**
 * Initialize the game
 */
export function initGame() {
  const gameStore = useGameStore();
  const productStore = useProductStore();
  
  // Initialize the game
  gameStore.init();
  
  // Initialize products
  productStore.init();
  
  return gameStore;
}