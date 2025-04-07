Okay, here is the revised checklist, starting from Pinia integration and formatted with markdown checkboxes.

**Development Checklist: Modern AI Game (Revised Start)**

---

**Phase 1: Project Foundation & Static Data**

*   [x] **Task 1.1:** Integrate Pinia into `src/main.js` (create Pinia instance, use `app.use(pinia)`).
*   [x] **Task 1.2:** Create `src/data/hardware.json` with sample hardware data.
*   [x] **Task 1.3:** Create `src/data/techTree.json` with sample tech items ('discovery1', 'discoveryA', etc.).
*   [x] **Task 1.4:** Create `src/stores/staticData.js` and import/export JSON data and constants (`COST_PER_RESEARCHER`, `BASE_INCOME`, etc.). Include helper functions like `findTechById`.

*   **STOPPING POINT 1**
    *   **App State:** The app runs (shows default Vite/Vue template or blank screen if template removed). No game UI yet. Pinia is configured.
    *   **Functionality:** Project setup complete *up to Pinia integration*. Static data is defined and accessible via `staticData.js`.
    *   **Goal:** Verify Pinia setup and data file creation/accessibility.

---

**Phase 2: Store Structure & Basic State Display**

*   [x] **Task 2.1:** Create store files: `resources.js`, `datacentre.js`, `techTree.js`, `time.js` in `src/stores/`.
*   [x] **Task 2.2:** Define **state** (`ref`, `reactive`) in each store with initial values (e.g., `savingsAmount = ref(0)`, `numResearchers = ref(0)`, `available = ref(new Set(['discovery1', 'discoveryA']))`, `currentYear = ref(START_YEAR)`).
*   [x] **Task 2.3:** Define simple **getters** (`computed`) within each store that *do not* depend on other stores (e.g., `currentHardwareObject`, `displayDate`, basic filtered lists like `availableProducts` just based on type).
*   [x] **Task 2.4:** Define the `initialize()` action stub in each store (can just log "Initializing X store" for now).
*   [x] **Task 2.5:** Create basic component files: `App.vue`, `HeaderPanel.vue`, `ResourcePanel.vue`, `DatacentrePanel.vue`, `ResearchersPanel.vue`, `HardwarePanel.vue`, `WorkPanel.vue`, `WorkAllocatorPanel.vue`, `TechnologyPanel.vue`, `ProductGrid.vue`, `DiscoveryGrid.vue`, `TechCard.vue`.
*   [x] **Task 2.6:** In `App.vue`, import and render the main panel components (`HeaderPanel`, `ResourcePanel`, etc.). Add minimal CSS for basic layout (e.g., flex columns/rows) so panels appear roughly in place.
*   [x] **Task 2.7:** In each component, import the relevant store(s) and display the initial state values and simple getters defined in Task 2.2/2.3. Use placeholder text for buttons/sliders. Do *not* wire up any actions yet.
    *   _Example (`ResourcePanel.vue`):_ Import `useResourcesStore`, display `store.savingsAmount`, `store.thoughtsAmount`.
    *   _Example (`TechCard.vue`):_ Accept `id` prop, use `findTechById` from `staticData.js` to display the name. Show basic text like "[Padlock]" or "[Progress Bar]" based on dummy props.

*   **STOPPING POINT 2**
    *   **App State:** The app displays the main UI layout structure. All panels and grids are visible. Initial static values from the stores (Savings: 0, Researchers: 0, Year: 1950, available tech names, etc.) are displayed in the correct places.
    *   **Functionality:** UI rendering based on initial store state works. No buttons, sliders, or clicks do anything yet. The game doesn't progress. Getters that *don't* cross store boundaries work.
    *   **Goal:** Verify UI structure and basic store state binding.

---

**Phase 3: Inter-Store Getters & Simple Interactions**

*   [x] **Task 3.1:** Implement **getters** that depend on other stores (e.g., `incomeRate`, `creativityRate`, `flopsRate`, `workRate` in `resources.js`; `canAffordToHire`, `canAffordUpgrade` in `datacentre.js`; `totalIncomeRate` in `techTree.js`). Ensure stores are imported correctly within the getters. Verify these derived values display correctly in the UI.
*   [x] **Task 3.2:** Implement simple **actions** that modify only their *own* store's state:
    *   `datacentreStore`: `fireResearcher`, `setWorkAllocation`.
    *   `techTreeStore`: `selectProduct`, `selectDiscovery`.
*   [x] **Task 3.3:** Wire up corresponding UI elements:
    *   `ResearchersPanel`: "Fire" button calls `fireResearcher`. Add `:disabled="store.numResearchers <= 0"`.
    *   `WorkAllocatorPanel`: Range slider input updates `proportionWorkSpentOnProducts` via `@input` or `v-model`. Display the calculated percentages next to "Products" / "Research".
    *   `TechCard.vue`: Implement `@click="handleClick"`. Add logic inside `handleClick` to call `selectProduct` or `selectDiscovery` *only* if the card is *not* locked (check dummy `isLocked` prop for now). Pass a dummy `isSelected` prop and add basic styling (e.g., border color) if `isSelected` is true.
    *   `ProductGrid/DiscoveryGrid`: Pass the correct `isSelected` prop to `TechCard` based on `techTreeStore.currentlySelectedProduct/Discovery`.

*   **STOPPING POINT 3**
    *   **App State:** Derived values like Work Rate, Income Rate, affordability checks are calculated and displayed.
    *   **Functionality:**
        *   Firing researchers works and updates the count.
        *   Work allocation slider works, updating percentages and the store value.
        *   Clicking *unlocked* tech cards highlights them (changes `isSelected` state) and updates `currentlySelectedProduct/Discovery` in the store.
    *   **Won't Work Yet:** Hiring, upgrading, unlocking techs, game time progression, saving/spending, work application, progress bars.
    *   **Goal:** Verify derived state calculation and simple UI interactions that modify local store state.

---

**Phase 4: Complex Interactions & Core Mechanics**

*   [x] **Task 4.1:** Implement complex **actions** involving cross-store checks or multi-step logic:
    *   `resourcesStore`: `spendSavings` (check amount, decrease savings, return success/fail).
    *   `datacentreStore`: `hireResearcher` (check `canAffordToHire`), `upgradeHardware` (check `canAffordUpgrade`, call `resourcesStore.spendSavings`, update `currentHardwareId`).
    *   `techTreeStore`: `unlock` (check `locked`, update `locked` & `unlocked_progress`), `progressWork` (update `workApplied`, check for completion), `completeWork` (move from `unlocked_progress` to `complete`, deselect, call `makeAvailable`), `makeAvailable` (add to `available` & `locked`).
*   [x] **Task 4.2:** Update `initialize()` actions in stores to properly reset state to initial values defined earlier.
*   [x] **Task 4.3:** Wire up remaining complex UI elements:
    *   `ResearchersPanel`: "Hire" button calls `hireResearcher`, wire up `:disabled="!datacentreStore.canAffordToHire"`.
    *   `HardwarePanel`: "Upgrade" button calls `upgradeHardware`, display dynamic cost, wire up `:disabled` based on `!datacentreStore.nextHardwareUpgrade || !datacentreStore.canAffordUpgrade`.
    *   `TechCard.vue`: Update `handleClick` to call `techTreeStore.unlock(id)` if `isLocked` is true. Pass the *real* `isLocked` prop from the grid (`techTreeStore.isLocked(id)`). Pass the *real* `progress` prop (`techTreeStore.getProgress(id)`). Implement the actual progress bar based on `progress.workApplied / progress.workRequired`. Display the padlock correctly.
    *   `ProductGrid/DiscoveryGrid`: Pass the correct `isLocked` and `progress` props to `TechCard`.

*   **STOPPING POINT 4**
    *   **App State:** All store state and getters should be functional. Progress object in `techTreeStore` updates when `progressWork` is called (manually via devtools for now).
    *   **Functionality:**
        *   Hiring researchers works, respecting affordability checks.
        *   Upgrading hardware works, spending savings and updating hardware details.
        *   Clicking locked cards unlocks them (removes padlock, adds to `unlocked_progress` in store, progress bar appears at 0%).
        *   Calling `progressWork` via devtools increases the progress bar; calling it enough triggers `completeWork`, moving the card to the completed list and potentially making new techs available/locked.
    *   **Won't Work Yet:** The game doesn't run automatically; time doesn't pass; savings/thoughts don't accumulate automatically; work isn't applied automatically based on selection/allocation.
    *   **Goal:** Verify all core game mechanics (hiring, upgrading, unlocking, completing) work when triggered manually.

---

**Phase 5: Game Loop Implementation**

*   [x] **Task 5.1:** Implement the `timeStore`: `performTick`, `tick`, `startGame`, `stopGame` actions exactly as described in the plan, including time progression, savings/thoughts accumulation, and calling `techTreeStore.progressWork` based on `workRate` and allocation.
*   [x] **Task 5.2:** In `App.vue`, import `useTimeStore`. Call `timeStore.startGame()` in the `onMounted` hook. Add simple "Start" / "Stop" buttons that call `timeStore.startGame()` / `timeStore.stopGame()` for testing. (Ensure `startGame` also calls the `initialize()` functions of other stores).

*   **STOPPING POINT 5**
    *   **App State:** The game runs automatically after mounting (or clicking "Start"). Time (Year/Month) advances. Savings and Thoughts increase based on rates. Progress bars on selected items fill up over time.
    *   **Functionality:** The core game loop is active. Resources accumulate, research/development progresses automatically based on allocation and selection, techs complete, new techs become available. The game plays itself according to the defined rules. Start/Stop controls work.
    *   **Won't Work Yet:** Visual styling might be basic/unstyled. Number formatting might be rough.
    *   **Goal:** Verify the game runs autonomously and core progression loops work correctly over time.

---

**Phase 6: Styling, Polish & Final Testing**

*   [ ] **Task 6.1:** Apply CSS styling to all components to match the layout diagram and improve visual clarity (borders, padding, alignment, fonts). Style the progress bars, selected card state, disabled buttons, etc.
*   [ ] **Task 6.2:** Format displayed numbers (savings, thoughts, rates) appropriately (e.g., using `toFixed`, locale string formatting, or helper functions).
*   [ ] **Task 6.3:** Add minor UI feedback (e.g., brief message/indicator when tech completes or hardware upgrades). Add the "Work = Creativity * Flops" text to `WorkPanel`.
*   [ ] **Task 6.4:** Perform thorough playtesting:
    *   Does the game progress reasonably within the target time?
    *   Are resource calculations correct?
    *   Do all buttons/interactions work as expected?
    *   Are disabled states accurate?
    *   Are there any visual glitches?
    *   Check console for errors/warnings.
    *   Use Vue Devtools to monitor state changes during gameplay.
*   [ ] **Task 6.5:** Fix any bugs or visual issues identified during testing.

*   **FINAL STOPPING POINT**
    *   **App State:** Fully functional and styled game matching the specification.
    *   **Functionality:** All features implemented and working correctly. Game loop runs, interactions are responsive, UI is clear and visually matches the design intent.
    *   **Goal:** Verify the completed game against the original requirements.

---