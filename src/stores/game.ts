import { defineStore } from 'pinia';
import { useTimeStore } from './modules/time';
import { usePhaseStore, GamePhase } from './modules/phase';
import { useResourcesStore } from './modules/resources';
import { useTalentStore } from './modules/talent';
import { useProductStore } from './modules/products';

/**
 * Main game store that coordinates all other stores
 */
export const useGameStore = defineStore('game', {
  state: () => {
    return {
      message: 'Welcome to March of Mind!',
      lastSavedAt: 0
    };
  },
  
  actions: {
    /**
     * Initialize the game
     */
    init() {
      this.loadGame();
      
      const timeStore = useTimeStore();
      
      // Start the time ticker for all phases
      timeStore.startGameTicker(() => this.processOneMonth());
      
      // Expose store to window for testing
      if (typeof window !== 'undefined') {
        window.__appStore = this;
        window.__appMethods = {
          addMoney: this.addMoney,
          setPhase: this.setPhase
        };
        window.__APP_STORE_INITIALIZED = true;
      }
    },
    
    /**
     * Process one month of game time
     */
    processOneMonth() {
      const phaseStore = usePhaseStore();
      
      // Only process game mechanics if in company phase or beyond
      if (phaseStore.gamePhase !== GamePhase.JOB) {
        const talentStore = useTalentStore();
        const productStore = useProductStore();
        
        // Process talent income/expenses
        talentStore.processMonthlyFinances();
        
        // Process product development
        productStore.processMonthlyDevelopment();
      }
      
      // Save the game
      this.saveGame();
    },
    
    /**
     * Earn money through manual labor
     */
    earnMoney() {
      const resourcesStore = useResourcesStore();
      resourcesStore.earnMoney();
      this.saveGame();
    },
    
    /**
     * Found a company when enough money is available
     */
    foundCompany() {
      const resourcesStore = useResourcesStore();
      const phaseStore = usePhaseStore();
      
      if (resourcesStore.canFoundCompany) {
        resourcesStore.payForCompanyFounding();
        phaseStore.enterCompanyPhase();
        this.saveGame();
        return true;
      }
      return false;
    },
    
    /**
     * Hire a new talent
     */
    hireTalent() {
      const talentStore = useTalentStore();
      const result = talentStore.hireTalent();
      if (result) {
        this.saveGame();
      }
      return result;
    },
    
    /**
     * Fire an existing talent
     */
    fireTalent() {
      const talentStore = useTalentStore();
      const result = talentStore.fireTalent();
      if (result) {
        this.saveGame();
      }
      return result;
    },
    
    /**
     * Launch the first product when enough development points are available
     */
    launchProduct() {
      const productStore = useProductStore();
      const result = productStore.launchProduct();
      if (result) {
        this.saveGame();
      }
      return result;
    },
    
    /**
     * Save the game state to localStorage
     */
    saveGame() {
      const phaseStore = usePhaseStore();
      const resourcesStore = useResourcesStore();
      const timeStore = useTimeStore();
      const talentStore = useTalentStore();
      const productStore = useProductStore();
      
      const saveData = {
        savedAt: Date.now(),
        gamePhase: phaseStore.gamePhase,
        money: resourcesStore.money,
        totalMonths: timeStore.totalMonths,
        talent: talentStore.talent,
        hasHiredTalent: talentStore.hasHiredTalent,
        developmentPoints: productStore.developmentPoints,
        hasProduct: productStore.hasProduct,
        hasLaunchedFirstProduct: productStore.hasLaunchedFirstProduct
      };
      
      localStorage.setItem('marchOfMindSave', JSON.stringify(saveData));
      this.lastSavedAt = saveData.savedAt;
    },
    
    /**
     * Load the game state from localStorage
     */
    loadGame() {
      const phaseStore = usePhaseStore();
      const resourcesStore = useResourcesStore();
      const timeStore = useTimeStore();
      const talentStore = useTalentStore();
      const productStore = useProductStore();
      
      const saveData = localStorage.getItem('marchOfMindSave');
      if (saveData) {
        try {
          const data = JSON.parse(saveData);
          
          // Set phase
          phaseStore.gamePhase = data.gamePhase || GamePhase.JOB;
          
          // Load resources
          resourcesStore.money = data.money || 0;
          
          // Load time system data
          timeStore.totalMonths = data.totalMonths || 0;
          
          // Load talent system data
          talentStore.talent = data.talent || 0;
          talentStore.hasHiredTalent = data.hasHiredTalent || false;
          
          // Load product development data
          productStore.developmentPoints = data.developmentPoints || 0;
          productStore.hasProduct = data.hasProduct || false;
          productStore.hasLaunchedFirstProduct = data.hasLaunchedFirstProduct || false;
          
          this.lastSavedAt = data.savedAt || 0;
          
          return true;
        } catch (e) {
          console.error('Failed to load save data', e);
          return false;
        }
      }
      
      return false;
    },
    
    /**
     * Reset the game state (for testing or starting over)
     */
    resetGame() {
      const phaseStore = usePhaseStore();
      const resourcesStore = useResourcesStore();
      const timeStore = useTimeStore();
      const talentStore = useTalentStore();
      const productStore = useProductStore();
      
      // Reset all stores
      phaseStore.reset();
      resourcesStore.reset();
      timeStore.reset();
      talentStore.reset();
      productStore.reset();
      
      // Restart the time ticker
      timeStore.startGameTicker(() => this.processOneMonth());
      
      // Clear localStorage
      localStorage.removeItem('marchOfMindSave');
      this.lastSavedAt = 0;
    },
    
    /**
     * For testing: add money directly
     */
    addMoney(amount: number) {
      const resourcesStore = useResourcesStore();
      resourcesStore.addMoney(amount);
    },
    
    /**
     * For testing: set game phase directly
     */
    setPhase(phase: GamePhase) {
      const phaseStore = usePhaseStore();
      phaseStore.gamePhase = phase;
    }
  }
});