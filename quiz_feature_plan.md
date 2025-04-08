# Implementation Plan: Tech Unlock Quiz Modal

This plan details the steps required to implement a feature where unlocking a technology requires answering a multiple-choice quiz via a modal window. While the modal is active, game time will be   
paused, and background UI interaction will be disabled. Upon selecting the correct answer, there will be a 5-second delay before the unlock proceeds.                                                 
                                                                                                                                                                                                      
## Detailed Plan                                                                                                                                                                                      
                                                                                                                                                                                                      
1.  **Update Data Structure (`src/data/techTree.json`)**                                                                                                                                              
    *   Define a standard structure for quiz data within each product and discovery object that requires a quiz to unlock.                                                                            
    *   Add a `quiz` object property to *each* initially locked item (and potentially others intended to be unlocked later). If an item should be unlocked without a quiz, omit the `quiz` property.  
    *   The `quiz` object structure:                                                                                                                                                                  
        ```json                                                                                                                                                                                       
        "quiz": {                                                                                                                                                                                     
          "question": "String containing the question text.",                                                                                                                                         
          "options": ["Array", "of", "string", "options"],                                                                                                                                            
          "correctOptionIndex": 0 // Zero-based index of the correct answer in the options array                                                                                                      
        }                                                                                                                                                                                             
        ```                                                                                                                                                                                           
    *   **Example (with simplified placeholders):**                                                                                                                                                   
        ```json                                                                                                                                                                                       
        // In src/data/techTree.json -> discoveries array                                                                                                                                             
        {                                                                                                                                                                                             
          "id": "discovery1",                                                                                                                                                                         
          "type": "discovery",                                                                                                                                                                        
          "name": "Discovery 1",                                                                                                                                                                      
          "description": "Placeholder",                                                                                                                                                               
          "workRequired": 100,                                                                                                                                                                        
          "creativity": 10,                                                                                                                                                                           
          "requiredDiscoveries": [],                                                                                                                                                                  
          "completionMakesAvailable": ["discovery2", "product1"],                                                                                                                                     
          "quiz": {                                                                                                                                                                                   
            "question": "Quiz question for Discovery 1",                                                                                                                                              
            "options": ["Correct", "Incorrect A", "Incorrect B", "Incorrect C"],                                                                                                                      
            "correctOptionIndex": 0 // Index of "Correct"                                                                                                                                             
          }                                                                                                                                                                                           
        },                                                                                                                                                                                            
        // In src/data/techTree.json -> discoveries array                                                                                                                                             
        {                                                                                                                                                                                             
          "id": "discoveryA",                                                                                                                                                                         
          "type": "discovery",                                                                                                                                                                        
          "name": "Discovery A",                                                                                                                                                                      
          // ... other properties                                                                                                                                                                     
          "quiz": {                                                                                                                                                                                   
            "question": "Quiz question for Discovery A",                                                                                                                                              
            "options": ["Incorrect X", "Correct", "Incorrect Y", "Incorrect Z"],                                                                                                                      
            "correctOptionIndex": 1 // Index of "Correct"                                                                                                                                             
          }                                                                                                                                                                                           
        }                                                                                                                                                                                             
        ```                                                                                                                                                                                           
    *   Populate this data for all relevant initial techs (`discovery1`, `discoveryA`) and any others intended to have quizzes using this placeholder format for now.                                 
                                                                                                                                                                                                      
2.  **Create UI Store (`src/stores/ui.ts`)**                                                                                                                                                          
    *   Create a new file `src/stores/ui.ts`.                                                                                                                                                         
    *   Define a new Pinia store named `ui`.                                                                                                                                                          
    *   Import `useTimeStore`.                                                                                                                                                                        
    *   **State:**                                                                                                                                                                                    
        *   `isQuizModalVisible: ref(false)`                                                                                                                                                          
        *   `quizTechId: ref<string | null>(null)`                                                                                                                                                    
    *   **Actions:**                                                                                                                                                                                  
        *   `showQuizModal(techId: string)`:                                                                                                                                                          
            *   Get the `timeStore` instance.                                                                                                                                                         
            *   Sets `quizTechId` to the passed `techId`.                                                                                                                                             
            *   Sets `isQuizModalVisible` to `true`.                                                                                                                                                  
            *   Calls `timeStore.pauseManually()`.                                                                                                                                                    
        *   `hideQuizModal()`:                                                                                                                                                                        
            *   Get the `timeStore` instance.                                                                                                                                                         
            *   Sets `isQuizModalVisible` to `false`.                                                                                                                                                 
            *   Sets `quizTechId` to `null`.                                                                                                                                                          
            *   Calls `timeStore.resumeManually()`.                                                                                                                                                   
                                                                                                                                                                                                      
3.  **Update Time Store (`stores/time.ts`)**                                                                                                                                                          
    *   *(No changes from the previous plan, just ensure these are implemented)*                                                                                                                      
    *   **State:** Add `isPausedManually: ref(false)`.                                                                                                                                                
    *   **Actions:** Add `pauseManually()` (sets `isPausedManually = true`) and `resumeManually()` (sets `isPausedManually = false`).                                                                 
    *   **Modify `tick()` function:** Add check at the beginning: `if (!isRunning.value || isPausedManually.value) { ... return; }`. Ensure the `setTimeout` logic handles the paused state correctly 
(re-scheduling the check).                                                                                                                                                                            
    *   **Modify `startGame()`:** Ensure `isPausedManually.value = false;` is set.                                                                                                                    
    *   **Modify `stopGame()`:** Ensure `isPausedManually.value = false;` is set.                                                                                                                     
                                                                                                                                                                                                      
4.  **Create Quiz Modal Component (`src/components/QuizModal.vue`)**                                                                                                                                  
    *   Use `<script setup lang="ts">`.                                                                                                                                                               
    *   Import `ref`, `computed`, `watch` from `vue`.                                                                                                                                                 
    *   Import `useUiStore`, `useTechTreeStore`, `findTechById`.                                                                                                                                      
    *   Get store instances (`uiStore`, `techTreeStore`).                                                                                                                                             
    *   **Component State:**                                                                                                                                                                          
        *   `areAnswersDisabled: ref(false)`                                                                                                                                                          
        *   `countdown: ref(0)`                                                                                                                                                                       
        *   `countdownInterval: ref<number | null>(null)`                                                                                                                                             
    *   **Computed Properties:**                                                                                                                                                                      
        *   `isVisible = computed(() => uiStore.isQuizModalVisible)`                                                                                                                                  
        *   `techId = computed(() => uiStore.quizTechId)`                                                                                                                                             
        *   `quizData = computed(() => { ... fetch tech/quiz data using findTechById(techId.value) ... handle nulls ... })`                                                                           
    *   **Template:**                                                                                                                                                                                 
        *   Wrap the entire component in a `div` with `v-if="isVisible"`.                                                                                                                             
        *   Include an overlay `div`.                                                                                                                                                                 
        *   Include a modal container `div`.                                                                                                                                                          
        *   Display the `quizData.question`.                                                                                                                                                          
        *   Use `v-for="(option, index) in quizData.options"` to render buttons.                                                                                                                      
            *   Bind `:disabled="areAnswersDisabled"` to each button.                                                                                                                                 
            *   Each button calls `checkAnswer(index)` on click.                                                                                                                                      
        *   Display the countdown timer conditionally: `<div v-if="countdown > 0">Continuing in {{ countdown }}...</div>`                                                                             
        *   Add a "Cancel" button that calls `cancelQuiz()`.                                                                                                                                          
    *   **Methods:**                                                                                                                                                                                  
        *   `checkAnswer(selectedIndex: number)`:                                                                                                                                                     
            *   If `areAnswersDisabled.value` is true, return early.                                                                                                                                  
            *   Compare `selectedIndex` with `quizData.correctOptionIndex`.                                                                                                                           
            *   If correct:                                                                                                                                                                           
                *   Set `areAnswersDisabled.value = true`.                                                                                                                                            
                *   Set `countdown.value = 5`.                                                                                                                                                        
                *   Clear any existing interval: `if (countdownInterval.value) clearInterval(countdownInterval.value);`                                                                               
                *   Start interval: `countdownInterval.value = setInterval(() => { ... }, 1000);`                                                                                                     
                    *   Inside interval: Decrement `countdown.value`.                                                                                                                                 
                    *   If `countdown.value <= 0`:                                                                                                                                                    
                        *   Clear interval: `clearInterval(countdownInterval.value); countdownInterval.value = null;`                                                                                 
                        *   Call `techTreeStore.unlock(techId.value)`.                                                                                                                                
                        *   Determine tech type, call `techTreeStore.selectProduct/Discovery(techId.value)`.                                                                                          
                        *   Call `uiStore.hideQuizModal()`.                                                                                                                                           
            *   If incorrect:                                                                                                                                                                         
                *   Provide simple visual feedback (e.g., flash button red briefly - keep simple). Do *not* close modal or disable buttons permanently.                                               
        *   `cancelQuiz()`:                                                                                                                                                                           
            *   Clear interval: `if (countdownInterval.value) clearInterval(countdownInterval.value); countdownInterval.value = null;`                                                                
            *   Call `uiStore.hideQuizModal()`.                                                                                                                                                       
    *   **Lifecycle/Watchers:**                                                                                                                                                                       
        *   Use `watch(isVisible, (newValue) => { ... })` to reset component state when the modal becomes hidden (`newValue` is false):                                                               
            *   `areAnswersDisabled.value = false;`                                                                                                                                                   
            *   `countdown.value = 0;`                                                                                                                                                                
            *   `if (countdownInterval.value) clearInterval(countdownInterval.value); countdownInterval.value = null;`                                                                                
                                                                                                                                                                                                      
5.  **Update Tech Card Component (`src/components/TechCard.vue`)**                                                                                                                                    
    *   Import `useUiStore`. Get the `uiStore` instance.                                                                                                                                              
    *   Modify the `handleClick()` method:                                                                                                                                                            
        *   Check `if (props.isLocked)`.                                                                                                                                                              
        *   Inside this `if`, call `uiStore.showQuizModal(props.id)`.                                                                                                                                 
        *   The `else` block remains unchanged.                                                                                                                                                       
                                                                                                                                                                                                      
6.  **Integrate Modal in App (`src/App.vue`)**                                                                                                                                                        
    *   Import the `QuizModal` component.                                                                                                                                                             
    *   Include `<QuizModal />` in the main template, outside main layout columns.                                                                                                                    
                                                                                                                                                                                                      
7.  **Styling (`src/components/QuizModal.vue`)**                                                                                                                                                      
    *   *(No changes from the previous plan)*                                                                                                                                                         
    *   Style overlay (fixed position, background, z-index).                                                                                                                                          
    *   Style modal container (fixed position, centered, background, padding, z-index, shadow).                                                                                                       
    *   Style buttons, question text, countdown text as needed.                                                                                                                                       
                                                                                                                                                                                                      
## Checklist                                                                                                                                                                                          
                                                                                                                                                                                                      
*   [x] Define `quiz` structure in documentation/notes.                                                                                                                                               
*   [x] Add simplified `quiz` data to relevant items in `src/data/techTree.json`.                                                                                                                     
*   [x] Create `src/stores/ui.ts` file.                                                                                                                                                               
*   [x] Define `ui` store in `src/stores/ui.ts`.                                                                                                                                                      
*   [x] Add `isQuizModalVisible` state to `uiStore`.                                                                                                                                                  
*   [x] Add `quizTechId` state to `uiStore`.                                                                                                                                                          
*   [x] Add `showQuizModal` action to `uiStore`.                                                                                                                                                      
*   [x] Add `hideQuizModal` action to `uiStore`.                                                                                                                                                      
*   [x] Add `isPausedManually` state to `timeStore`.                                                                                                                                                  
*   [x] Add `pauseManually` action to `timeStore`.                                                                                                                                                    
*   [x] Add `resumeManually` action to `timeStore`.                                                                                                                                                   
*   [x] Modify `timeStore.tick()` to check `isPausedManually`.                                                                                                                                        
*   [x] Ensure `timeStore.startGame()` resets `isPausedManually`.                                                                                                                                     
*   [x] Ensure `timeStore.stopGame()` resets `isPausedManually`.                                                                                                                                      
*   [x] Implement `uiStore.showQuizModal` logic (set state, call `timeStore.pauseManually`).                                                                                                          
*   [x] Implement `uiStore.hideQuizModal` logic (clear state, call `timeStore.resumeManually`).                                                                                                       
*   [x] Create `src/components/QuizModal.vue` file.                                                                                                                                                   
*   [x] Implement `QuizModal.vue` script setup (imports, stores, component state refs: `areAnswersDisabled`, `countdown`, `countdownInterval`).                                                       
*   [x] Implement `QuizModal.vue` computed props (`isVisible`, `techId`, `quizData`).                                                                                                                 
*   [x] Implement `QuizModal.vue` template (v-if, overlay, container, question, option buttons with `:disabled`, conditional countdown display, cancel button).                                       
*   [x] Implement `QuizModal.vue` `checkAnswer` method logic:                                                                                                                                         
    *   [x] Correct answer: Set disabled, start countdown interval.                                                                                                                                   
    *   [x] Interval logic: Decrement countdown, on zero clear interval, call unlock, select, hide.                                                                                                   
    *   [x] Incorrect answer: Simple feedback.                                                                                                                                                        
*   [x] Implement `QuizModal.vue` `cancelQuiz` method (clear interval, call hide).                                                                                                                    
*   [x] Implement `QuizModal.vue` watcher to reset state on hide.                                                                                                                                     
*   [x] Add basic CSS for overlay in `QuizModal.vue`.                                                                                                                                                 
*   [x] Add basic CSS for modal container in `QuizModal.vue`.                                                                                                                                         
*   [x] Modify `TechCard.vue`'s `handleClick` to import and use `uiStore`, call `showQuizModal`.                                                                                                      
*   [x] Import `QuizModal` component in `src/App.vue`.                                                                                                                                                
*   [x] Add `<QuizModal />` tag to `src/App.vue` template.                                                                                                                                            
*   [x] Test clicking a locked card triggers the modal.                                                                                                                                               
*   [x] Test game time pauses when modal is open.                                                                                                                                                     
*   [x] Test background UI is non-interactive.                                                                                                                                                        
*   [x] Test clicking correct answer disables buttons and shows countdown.                                                                                                                            
*   [x] Test after countdown: card unlocks, selects, modal closes, time resumes.                                                                                                                      
*   [x] Test clicking incorrect answer provides feedback, keeps modal open/interactive.                                                                                                               
*   [x] Test cancel button clears timer (if running), closes modal, resumes time.                                                                                                                     
*   [x] Test watcher resets modal state correctly for subsequent openings.                                                                                                                            
*   [x] Test clicking unlocked card still performs select action.                                                                                                                                     