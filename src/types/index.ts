/**
 * Basic application interfaces
 */

/**
 * Version information
 */
export interface VersionInfo {
  /** Version number from package.json */
  version: string;
  
  /** Application name */
  name: string;
  
  /** Build timestamp */
  buildTime: string;
}

/**
 * Product data structure
 */
export interface Product {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Year when product becomes available */
  year: number;
  
  /** Product description */
  description: string;
  
  /** Base cost to develop product (in insights) */
  baseCost: number;
  
  /** Base monthly income generated */
  baseIncome: number;
  
  /** Product category */
  category: string;
}

/**
 * Product instance with runtime state
 */
export interface ProductInstance extends Product {
  /** Whether the product has been launched */
  launched: boolean;
  
  /** Current market saturation (0-100%) */
  saturation: number;
  
  /** Current income after applying marketing effects */
  currentIncome: number;
  
  /** Development progress (0-1) */
  progress: number;
}

// Global window interface extensions for game state and testing compatibility
declare global {
  interface Window {
    __APP_STORE_INITIALIZED?: boolean;
    __appStore?: {
      message: string;
      count: number;
      gamePhase: string;
      saveGame: () => void;
      loadGame: () => boolean;
      resetGame: () => void;
      earnMoney: () => void;
      foundCompany: () => boolean;
      addMoney: (amount: number) => void;
      setPhase: (phase: string) => void;
    };
    __appMethods?: {
      loadGame: () => boolean;
      saveGame: () => void;
      resetGame: () => void;
      earnMoney: () => void;
      foundCompany: () => boolean;
      addMoney: (amount: number) => void;
      setPhase: (phase: string) => void;
    };
    Pinia?: {
      createPinia: () => unknown;
      useGameStore: () => unknown;
      _useGameStore?: () => unknown;
      instance?: unknown;
    };
  }
}