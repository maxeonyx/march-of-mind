import { reactive } from 'vue';


/**
 * Resources module for managing player resources (money, etc.)
 */
export function useResources() {

  // TODO: Refactor other files in src/composables to match this style.
  const resources = reactive({
    money: 0,
    thoughtPower: 0,

    addMoney(amount: number) {
      resources.money += amount;
    },
    
    addThoughtPower(amount: number) {
      resources.thoughtPower += amount;
    },
  
    spendMoney(amount: number): boolean {
      if (resources.money >= amount) {
        resources.money -= amount;
        return true;
      }
      return false;
    },

    spendThoughtPower(amount: number): boolean {
      if (resources.thoughtPower >= amount) {
        resources.thoughtPower -= amount;
        return true;
      }
      return false;
    },
    
    reset() {
      resources.money = 0;
      resources.thoughtPower = 0;
    },

    save() {
      return {
        money: resources.money,
        thoughtPower: resources.thoughtPower,
      };
    },

    load(data: any) {
      if (data) {
        resources.money = data.money || 0;
        resources.thoughtPower = data.insights || 0; // Handle legacy saves
      }
    },
  });
  
  return resources;
}

export type ResourcesStore = ReturnType<typeof useResources>;