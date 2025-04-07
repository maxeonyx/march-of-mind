Okay, I understand. You want a focused document detailing the *structure* of each Pinia store, specifically clarifying what should be reactive state (`ref`/`reactive`) versus derived state (`computed`), based on the plan and context provided.

Here is that breakdown:

---

## Pinia Store Structure Definition

This document outlines the intended structure for each Pinia store in the "Modern AI Game", focusing on the distinction between reactive state and computed (derived) properties.

### General Principles:

*   **State (`ref`, `reactive`):** Represents the core, fundamental data of the store. This is the data that actions will directly modify. Use `ref` for primitive types (numbers, strings, booleans) or simple objects/arrays where you replace the whole value. Use `reactive` for complex objects or collections (like Maps or Sets) where you need reactivity on nested properties or collection changes (add/delete).
*   **Getters (`computed`):** Represents data derived *from* state (or other getters). They recalculate automatically when their dependencies change. Use `computed` for these. They provide convenient, reusable calculations and help keep state minimal. Function-style getters (taking arguments) are also used where a dynamic check based on an ID is needed.
*   **Actions (Functions):** Methods defined within the store that are responsible for modifying the state. They contain the logic for updates, including checks and interactions with other stores.

---

### 1. Store: `resourcesStore`

*   **Purpose:** Manages the primary numerical resources influenced by game progression.

*   **State (Reactive Data):**
    *   `savingsAmount = ref(0)`: The player's spendable currency. Directly increased by income, decreased by spending actions (e.g., `spendSavings`).
    *   `thoughtsAmount = ref(0)`: The player's cumulative "score" or work generated. Directly increased over time based on `workRate`.

*   **Getters (Computed/Derived Data):**
    *   `incomeRate = computed(...)`: Calculated value.
        *   *Depends on:* `BASE_INCOME` (constant), `techTreeStore.totalIncomeRate`.
        *   *Reason:* Derives the current income per time unit from base value and completed products.
    *   `creativityRate = computed(...)`: Calculated value.
        *   *Depends on:* `datacentreStore.numResearchers` (and potentially future bonuses).
        *   *Reason:* Represents the research input derived from the number of researchers.
    *   `flopsRate = computed(...)`: Calculated value.
        *   *Depends on:* `datacentreStore.currentHardwareObject.flops` (and potentially future bonuses).
        *   *Reason:* Represents the hardware input derived from the current hardware's stats.
    *   `workRate = computed(...)`: Calculated value.
        *   *Depends on:* `creativityRate`, `flopsRate`.
        *   *Reason:* The core resource generation rate, derived from the two primary input rates.

*   **Actions (Mutating Functions):**
    *   `addSavings(amount)`: Modifies `savingsAmount`.
    *   `spendSavings(amount)`: Modifies `savingsAmount` (conditionally).
    *   `addThoughts(amount)`: Modifies `thoughtsAmount`.
    *   `initialize()`: Resets state refs to initial values.

---

### 2. Store: `datacentreStore`

*   **Purpose:** Manages researchers, hardware level, and how generated 'Work' is allocated.

*   **State (Reactive Data):**
    *   `numResearchers = ref(0)`: The current count of researchers. Directly modified by `hireResearcher` and `fireResearcher` actions.
    *   `currentHardwareId = ref('hardware1')`: The ID string of the currently equipped hardware. Directly modified by the `upgradeHardware` action.
    *   `proportionWorkSpentOnProducts = ref(0.5)`: The user-controlled slider value (0 to 1). Directly modified by the `setWorkAllocation` action (or v-model binding).

*   **Getters (Computed/Derived Data):**
    *   `currentHardwareObject = computed(...)`: Derived object.
        *   *Depends on:* `currentHardwareId`, static `allHardware` data.
        *   *Reason:* Provides the full hardware object based on the current ID for easy access to its properties (name, flops, tier, cost).
    *   `canAffordToHire = computed(...)`: Derived boolean.
        *   *Depends on:* `numResearchers`, `COST_PER_RESEARCHER` (constant), `resourcesStore.incomeRate`.
        *   *Reason:* Calculates if the *next* hire is affordable based on projected cost vs current income.
    *   `nextHardwareUpgrade = computed(...)`: Derived object or null.
        *   *Depends on:* `currentHardwareObject.tier`, static `allHardware` data.
        *   *Reason:* Finds the definition of the next potential hardware upgrade based on the current tier.
    *   `canAffordUpgrade = computed(...)`: Derived boolean.
        *   *Depends on:* `nextHardwareUpgrade.upgradeCost`, `resourcesStore.savingsAmount`.
        *   *Reason:* Calculates if the currently available upgrade can be purchased with current savings.

*   **Actions (Mutating Functions):**
    *   `hireResearcher()`: Modifies `numResearchers` (conditionally).
    *   `fireResearcher()`: Modifies `numResearchers` (conditionally).
    *   `upgradeHardware()`: Modifies `currentHardwareId` (conditionally, involves calls to `resourcesStore.spendSavings`).
    *   `setWorkAllocation(proportion)`: Modifies `proportionWorkSpentOnProducts`.
    *   `initialize()`: Resets state refs to initial values.

---

### 3. Store: `techTreeStore`

*   **Purpose:** Manages the state and progression of individual technology items (discoveries and products).

*   **State (Reactive Data):**
    *   `available = ref(new Set(['discovery1', 'discoveryA']))`: Set of ID strings for techs visible in the grids. Modified by `makeAvailable` (adds new IDs).
    *   `locked = ref(new Set(['discovery1', 'discoveryA']))`: Set of ID strings for techs that are available but not yet being worked on (show padlock). Modified by `unlock` (removes ID) and `makeAvailable` (adds new IDs).
    *   `unlocked_progress = reactive(new Map())`: Map where keys are tech IDs and values are objects `{ workRequired: number, workApplied: number }`. Tracks work progress on unlocked items. Modified by `unlock` (adds entry), `progressWork` (updates `workApplied`), and `completeWork` (removes entry). `reactive` is used for efficient updates and reactivity on the nested `workApplied` property.
    *   `complete = ref(new Set())`: Set of ID strings for techs that have finished researching/developing. Modified by `completeWork` (adds ID).
    *   `currentlySelectedProduct = ref(null)`: ID string of the product actively receiving work, or null. Directly modified by `selectProduct` and potentially `completeWork`.
    *   `currentlySelectedDiscovery = ref(null)`: ID string of the discovery actively receiving work, or null. Directly modified by `selectDiscovery` and potentially `completeWork`.

*   **Getters (Computed/Derived Data):**
    *   `totalIncomeRate = computed(...)`: Calculated number.
        *   *Depends on:* `complete` set, static `allTech` data (specifically `incomeGenerated`).
        *   *Reason:* Sums the income from all completed products.
    *   `availableProducts = computed(...)`: Derived array of IDs.
        *   *Depends on:* `available` set, static `allTech` data (type property).
        *   *Reason:* Provides a filtered list specifically for the Product grid UI.
    *   `availableDiscoveries = computed(...)`: Derived array of IDs.
        *   *Depends on:* `available` set, static `allTech` data (type property).
        *   *Reason:* Provides a filtered list specifically for the Discovery grid UI.
    *   `completedProducts = computed(...)`: Derived array of IDs.
        *   *Depends on:* `complete` set, static `allTech` data (type property).
        *   *Reason:* Provides a filtered list for the completed products section.
    *   `completedDiscoveries = computed(...)`: Derived array of IDs.
        *   *Depends on:* `complete` set, static `allTech` data (type property).
        *   *Reason:* Provides a filtered list for the completed discoveries section.
    *   `isLocked(id)`: Function-style Getter (Not `computed`).
        *   *Depends on:* `locked` set.
        *   *Reason:* Checks if a *specific* ID passed as an argument exists in the `locked` set. Used by `TechCard`.
    *   `getProgress(id)`: Function-style Getter (Not `computed`).
        *   *Depends on:* `unlocked_progress` map.
        *   *Reason:* Retrieves the progress object for a *specific* ID passed as an argument. Used by `TechCard`.

*   **Actions (Mutating Functions):**
    *   `unlock(id)`: Modifies `locked` and `unlocked_progress`.
    *   `progressWork(id, amount)`: Modifies `unlocked_progress` (specifically `workApplied`). May trigger `completeWork`.
    *   `completeWork(id)`: Modifies `unlocked_progress`, `complete`, `currentlySelectedProduct`/`Discovery`. May trigger `makeAvailable`. (Internal helper, called by `progressWork`).
    *   `makeAvailable(id)`: Modifies `available` and `locked`. (Internal helper, called by `completeWork`).
    *   `selectProduct(id)`: Modifies `currentlySelectedProduct`.
    *   `selectDiscovery(id)`: Modifies `currentlySelectedDiscovery`.
    *   `initialize()`: Resets all state refs/reactives to initial values.

---

### 4. Store: `timeStore`

*   **Purpose:** Manages the game's clock and orchestrates the periodic updates (the game loop).

*   **State (Reactive Data):**
    *   `currentYear = ref(START_YEAR)`: The current year in the game simulation. Directly modified by the `performTick` action.
    *   `currentMonthIndex = ref(0)`: The index (0-11) of the current month. Directly modified by the `performTick` action.
    *   `isRunning = ref(false)`: Boolean flag indicating if the game loop timer is active. Directly modified by `startGame` and `stopGame`.
    *   `lastTickTimestamp = ref(null)`: Stores the timestamp of the last tick execution for calculating `deltaTime`. Internal state for the loop mechanism, modified within `tick` and `startGame`/`stopGame`.
    *   *(Non-Reactive internal variable)* `timerId = null`: Holds the ID returned by `setTimeout` to allow clearing it. Not needed for UI reactivity.

*   **Getters (Computed/Derived Data):**
    *   `displayDate = computed(...)`: Derived string.
        *   *Depends on:* `currentYear`, `currentMonthIndex`, internal `months` array.
        *   *Reason:* Formats the current year and month index into a user-friendly string (e.g., "January 1950").

*   **Actions (Mutating Functions):**
    *   `performTick(deltaTimeSeconds)`: The core logic executed each interval. Modifies `currentYear`, `currentMonthIndex`. Calls actions in other stores (`resourcesStore.addSavings`, `resourcesStore.addThoughts`, `techTreeStore.progressWork`). Checks end condition. (Internal helper, called by `tick`).
    *   `tick()`: The function scheduled by `setTimeout`. Calculates `deltaTime`, calls `performTick`, schedules the next `tick`. Modifies `lastTickTimestamp`.
    *   `startGame()`: Modifies `isRunning`, resets time state (`currentYear`, `currentMonthIndex`, `lastTickTimestamp`), calls `initialize()` on other stores, starts the `tick` loop.
    *   `stopGame()`: Modifies `isRunning`, clears the `setTimeout` timer (`timerId`), resets `lastTickTimestamp`.

---