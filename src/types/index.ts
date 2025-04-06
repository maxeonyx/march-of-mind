/**
 * Basic application interfaces
 */

export enum GamePhase {
  JOB = 'job',
  COMPANY = 'company',
  MARKETING = 'marketing',
  RESEARCH = 'research',
  
  // New phases for educational pivot
  RESEARCH_PHASE = 'research_phase',
  LAB_PHASE = 'lab_phase',
  DISCOVERY_PHASE = 'discovery_phase',
  AGI_PHASE = 'agi_phase'
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

/**
 * Educational question for unlocking discoveries and products
 */
export interface EducationalQuestion {
  /** Question text */
  question: string;
  
  /** Possible answers */
  answers: string[];
  
  /** Index of correct answer (0-based) */
  correctAnswerIndex: number;
  
  /** Explanation shown after answering */
  explanation: string;
}

/**
 * Hardware tier for research
 */
export interface Hardware {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Year when this hardware becomes available */
  year: number;
  
  /** Description of this hardware generation */
  description: string;
  
  /** Cost to upgrade to this hardware tier */
  cost: number;
  
  /** FLOP/s provided by this hardware tier */
  flops: number;
  
  /** Educational question to unlock this hardware */
  educationalContent?: EducationalQuestion;
}

/**
 * AI discovery (technology)
 */
export interface Discovery {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Year when this discovery became available historically */
  year: number;
  
  /** Description of the discovery and its significance */
  description: string;
  
  /** Insights required to make this discovery */
  insightCost: number;
  
  /** Boost to insight generation rate (multiplier) */
  insightBoost: number;
  
  /** Prerequisites (other discovery IDs required) */
  prerequisites: string[];
  
  /** Educational question to unlock this discovery */
  educationalContent: EducationalQuestion;
}