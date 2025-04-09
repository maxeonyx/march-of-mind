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
 * Represents the major phases of the game.
 */
export type GamePhase = 'startup' | 'lab'; // Add more phases later as needed

/**
 * Quiz data structure
 */
export interface Quiz {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

/**
 * Base tech item interface
 */
export interface TechItem {
  id: string;
  type: 'product' | 'discovery';
  name: string;
  description: string;
  workRequired: number;
  requiredDiscoveries: string[];
  completionMakesAvailable: string[];
  quiz?: Quiz;
}

/**
 * Product interface
 */
export interface Product extends TechItem {
  type: 'product';
  incomeGenerated: number;
}

/**
 * Discovery interface
 */
export interface Discovery extends TechItem {
  type: 'discovery';
  creativity: number;
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
      proportionWorkSpentOnResearch: number;
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
      pauseGame: () => void;
      resumeGame: () => void;
    };
    __uiStore?: {
      isQuizModalVisible: boolean;
      quizTechId: string | null;
      showQuizModal: (techId: string) => void;
      hideQuizModal: () => void;
      isPopupVisible: boolean;
      popupTitle: string | null;
      popupMessage: string | null;
      showPopup: (title: string, message: string) => void;
      hidePopup: () => void;
    };
    __phaseStore?: {
      currentPhase: GamePhase;
      setPhase: (phase: GamePhase) => void;
    };
    __appMethods?: {
      dummyMethod: () => void;
    };
  }
}
