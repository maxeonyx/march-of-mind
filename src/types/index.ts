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
    __appStore?: {
      message: string;
      count: number;
    };
    __appMethods?: {
      dummyMethod: () => void;
    };
  }
}