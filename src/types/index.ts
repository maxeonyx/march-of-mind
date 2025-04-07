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

// Global window interface extensions for testing compatibility
declare global {
  interface Window {
    __APP_STORE_INITIALIZED?: boolean;
    __appStore?: object;
    __resourcesStore?: {
      savingsAmount: number;
      thoughtsAmount: number;
      incomeRate: number;
      workRate: number;
    };
    __datacentreStore?: {
      numResearchers: number;
      currentHardwareId: string;
      proportionWorkSpentOnProducts: number;
    };
    __techTreeStore?: {
      currentlySelectedProduct: string | null;
      currentlySelectedDiscovery: string | null;
      tick: () => void;
      progressWork: (id: string, amount: number) => void;
    };
    __timeStore?: {
      isRunning: boolean;
      currentYear: number;
      currentMonthIndex: number;
      tick: () => void;
      performTick: (deltaTimeSeconds: number) => void;
    };
    __appMethods?: {
      dummyMethod: () => void;
      initializeStores: () => void;
      startGame: () => void;
      stopGame: () => void;
    };
  }
}