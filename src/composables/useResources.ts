import { reactive } from 'vue';


/**
 * Resources module for managing player resources (money, etc.)
 */
export function useResources() {

  // TODO: Refactor other files in src/composables to match this style.
  const resources = reactive({
    money: 0,
    insights: 0,

    addMoney(amount: number) {
      resources.money += amount;
    },
    
    addInsights(amount: number) {
      resources.insights += amount;
    },
  
    spendMoney(amount: number): boolean {
      if (resources.money >= amount) {
        resources.money -= amount;
        return true;
      }
      return false;
    },

    spendInsights(amount: number): boolean {
      if (resources.insights >= amount) {
        resources.insights -= amount;
        return true;
      }
      return false;
    },
    
    reset() {
      resources.money = 0;
      resources.insights = 0;
    },

    save() {
      return {
        money: resources.money,
        insights: resources.insights,
      };
    },

    load(data: any) {
      if (data) {
        resources.money = data.money || 0;
        resources.insights = data.insights || 0;
      }
    },
  });
  
  return resources;
}

export type ResourcesStore = ReturnType<typeof useResources>;