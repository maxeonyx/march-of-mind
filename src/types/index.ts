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
    };
    __appMethods?: {
      loadGame: () => boolean;
      saveGame: () => void;
      resetGame: () => void;
      earnMoney: () => void;
      foundCompany: () => boolean;
    };
  }
}