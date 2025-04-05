/**
 * Basic application interfaces
 */

export enum GamePhase {
  JOB = 'job',
  COMPANY = 'company',
  MARKETING = 'marketing',
  RESEARCH = 'research'
}

export interface VersionInfo {
  version: string;
  name: string;
  buildTime: string;
}

export interface Product {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** In-game year when product becomes available */
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