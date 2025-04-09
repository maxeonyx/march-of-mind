# Implementation Instructions: Event System and Phase Transitions

This document provides step-by-step instructions for implementing an event system with phase transitions in the "March of Mind" game. Please follow these instructions carefully to ensure a robust and maintainable implementation.

## 1. File Creation and Modification

Here's a list of files that need to be created or modified:

* Create: src/stores/events.ts
* Create: src/stores/phases.ts
* Modify: src/stores/techTree.ts
* Modify: src/App.vue
* Modify: src/components/DatacentrePanel.vue
* Modify: src/components/TechCard.vue
* Modify: src/stores/resources.ts
* Modify: src/components/DebugPanel.vue (Optional, for debugging)

## 2. src/stores/events.ts (Create)

This file will manage the event system.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEventsStore = defineStore('events', () => {
    const triggeredEvents = ref<Set<string>>(new Set());

    const triggerEvent = (eventId: string) => {
        if (!triggeredEvents.value.has(eventId)) {
            triggeredEvents.value.add(eventId);
            console.log(`Event triggered: ${eventId}`);
        }
    };

    const hasEventTriggered = (eventId: string) => {
        return triggeredEvents.value.has(eventId);
    };

    const resetEvents = () => {
        triggeredEvents.value.clear();
    };

    return {
        triggeredEvents,
        triggerEvent,
        hasEventTriggered,
        resetEvents,
    };
});
```

## 3. src/stores/phases.ts (Create)

This file will manage the game phases.

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePhasesStore = defineStore('phases', () => {
    const currentPhase = ref('startup'); // Initial phase

    const setPhase = (phase: string) => {
        currentPhase.value = phase;
        console.log(`Phase changed to: ${phase}`);
    };

    return {
        currentPhase,
        setPhase,
    };
});
```

## 4. src/stores/techTree.ts (Modify)

Modify this file to trigger the event on the first product completion and provide a way to check if a product is the first one.

```typescript
// ... existing imports ...
import { useEventsStore } from './stores/events';

export const useTechTreeStore = defineStore('techTree', () => {
    // ... existing state ...
    const firstProductCompleted = ref(false);

    // ... existing getters ...

    // New getter to check if a product is the first one
    function isFirstProduct(id: string) {
        return !firstProductCompleted.value && availableProducts.value.includes(id);
    }

    // ... existing actions ...

    function completeWork(id: string) {
        // ... existing logic ...

        if (tech?.type === 'product' && !firstProductCompleted.value) {
            const eventsStore = useEventsStore();
            eventsStore.triggerEvent('first_product_completed');
            firstProductCompleted.value = true;
        }

        // ... existing logic ...
    }

    function initialize() {
        // ... existing logic ...
        firstProductCompleted.value = false; // Reset on initialization
    }

    return {
        // ... existing returns ...
        isFirstProduct,
        initialize,
    };
});
```

## 5. src/App.vue (Modify)

Import and use the new stores.

```typescript
// ... existing imports ...
import { useEventsStore } from './stores/events';
import { usePhasesStore } from './stores/phases';

// ... existing setup ...
const eventsStore = useEventsStore();
const phasesStore = usePhasesStore();

// Placeholder for popup logic (replace with actual UI)
const showPopup = ref(false);
const popupMessage = ref('');

watch(() => eventsStore.triggeredEvents, (newEvents) => {
    if (newEvents.has('first_product_completed')) {
        showPopup.value = true;
        popupMessage.value = 'Congratulations! You have completed your first product. The Lab phase begins!';
        timeStore.stopGame(); // Pause the game
    }
});

function closePopup() {
    showPopup.value = false;
    eventsStore.triggeredEvents.delete('first_product_completed');
    phasesStore.setPhase('lab');
    timeStore.startGame(); // Resume the game
}

// ... existing template ...
```

```html
<template>
    // ... existing template ...

    <div v-if="showPopup" class="popup">
        <p>{{ popupMessage }}</p>
        <button @click="closePopup">OK</button>
    </div>

    // ... existing template ...
</template>

// ... existing style ...

<style scoped>
.popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border: 1px solid black;
    z-index: 1000;
}
</style>
```

## 6. src/components/DatacentrePanel.vue (Modify)

Conditionally render the correct panel based on the current phase.

```typescript
// ... existing imports ...
import { usePhasesStore } from '../stores/phases';
import ResearchersPanel from './ResearchersPanel.vue';
import HardwarePanel from './HardwarePanel.vue';
import WorkPanel from './WorkPanel.vue';
import WorkAllocatorPanel from './WorkAllocatorPanel.vue';
import FounderPanel from './FounderPanel.vue'; // Import the new FounderPanel

const phasesStore = usePhasesStore();

// ... existing template ...
```

```html
<template>
    <div class="datacentre-panel">
        <h2>Datacentre</h2>
        <div class="datacentre-content">
            <FounderPanel v-if="phasesStore.currentPhase === 'startup'" class="full-width" />
            <template v-else>
                <ResearchersPanel class="grid-item" />
                <HardwarePanel class="grid-item" />
                <WorkPanel class="full-width" />
                <WorkAllocatorPanel class="full-width" />
            </template>
        </div>
    </div>
</template>

// ... existing style ...
```

## 7. src/components/FounderPanel.vue (Create)

This component will be specific to the startup phase.

```html
<template>
    <div class="founder-panel">
        <h3>Founder Panel</h3>
        <button @click="doResearch">Do Research</button>
        <div class="work-formula">Work = FLOPS<sup>0.7</sup> × Creativity<sup>0.3</sup></div>
    </div>
</template>

<script setup lang="ts">
import { useResourcesStore } from '../stores/resources';
import { useTechTreeStore } from '../stores/techTree';
import { computed } from 'vue';

const resourcesStore = useResourcesStore();
const techTreeStore = useTechTreeStore();

function doResearch() {
    const creativity = 1; // Base creativity for manual click (adjust as needed)
    const flops = resourcesStore.flopsRate;
    const workAmount = Math.pow(flops, 0.7) * Math.pow(creativity, 0.3);

    if (techTreeStore.currentlySelectedDiscovery) {
        techTreeStore.progressWork(techTreeStore.currentlySelectedDiscovery, workAmount);
    } else if (techTreeStore.currentlySelectedProduct && techTreeStore.isFirstProduct(techTreeStore.currentlySelectedProduct)) {
        techTreeStore.progressWork(techTreeStore.currentlySelectedProduct, workAmount);
    }
}
</script>

<style scoped>
.founder-panel {
    background-color: #fff;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
    margin-top: 0;
    color: #2c3e50;
}

button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #42b983;
    color: white;
    cursor: pointer;
    width: 100%;
}

.work-formula {
    font-style: italic;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}
</style>
```

## 8. src/components/TechCard.vue (Modify)

Adjust the logic for handling clicks in the startup phase.

```typescript
// ... existing imports ...
import { usePhasesStore } from '../stores/phases';

const phasesStore = usePhasesStore();

// ... existing props ...

function handleClick() {
    if (phasesStore.currentPhase === 'startup' && props.isLocked && tech.value?.type === 'discovery') {
        // Only unlock discoveries in startup phase
        const techData = findTechById(props.id);
        if (techData && techData.quiz) {
            uiStore.showQuizModal(props.id);
        } else {
            techTreeStore.unlock(props.id);
        }
    } else if (phasesStore.currentPhase !== 'startup' && props.isLocked) {
        // Existing logic for other phases
        const techData = findTechById(props.id);
        if (techData && techData.quiz) {
            uiStore.showQuizModal(props.id);
        } else {
            techTreeStore.unlock(props.id);
        }
    } else {
        // Select the card if it's already unlocked
        if (tech.value?.type === 'product') {
            techTreeStore.selectProduct(props.id);
        } else if (tech.value?.type === 'discovery') {
            techTreeStore.selectDiscovery(props.id);
        }
    }
}

// ... existing template ...
```

## 9. src/stores/resources.ts (Modify)

Remove the work calculation from the store, as it's now handled in the FounderPanel for the startup phase.

```typescript
// ... existing imports ...
import { usePhasesStore } from '../stores/phases';

export const useResourcesStore = defineStore('resources', () => {
    // ... existing state ...

    // ... existing getters ...

    const workRate = computed(() => {
        if (usePhasesStore().currentPhase.value === 'startup') {
            return 0; // Work is calculated and applied directly in FounderPanel
        } else {
            return Math.pow(flopsRate.value, 0.7) * Math.pow(creativityRate.value, 0.3);
        }
    });

    // ... existing actions ...

    return {
        // ... existing returns ...
        workRate,
    };
});
```

## 10. src/components/DebugPanel.vue (Modify - Optional)

Add phase control for easier testing.

```typescript
// ... existing imports ...
import { usePhasesStore } from '../stores/phases';

const phasesStore = usePhasesStore();
const currentPhase = ref(phasesStore.currentPhase);

function setPhase() {
    phasesStore.setPhase(currentPhase.value);
}

// ... existing template ...
```

```html
<template>
    // ... existing template ...

    <div class="debug-section">
        <h3>Phase Control</h3>
        <div class="debug-action">
            <select v-model="currentPhase">
                <option value="startup">Startup</option>
                <option value="lab">Lab</option>
            </select>
            <button @click="setPhase">Set Phase</button>
        </div>
    </div>

    // ... existing template ...
</template>
```

## 11. Testing Guidance

### Initial State:
- Verify the game starts in the "startup" phase.
- Verify the FounderPanel is displayed in the DatacentrePanel.

### Manual Research:
- Click the "Do Research" button in the FounderPanel.
- Verify that work is applied to the selected discovery or the first product.

### First Product Completion:
- Continue clicking the "Do Research" button until the first product is completed.
- Verify the "first_product_completed" event is triggered (check the console).
- Verify the popup appears with the correct message.
- Verify the game is paused while the popup is shown.

### Phase Transition:
- Click the "OK" button to dismiss the popup.
- Verify the game transitions to the "lab" phase.
- Verify the FounderPanel is replaced by the ResearchersPanel, HardwarePanel, WorkPanel, and WorkAllocatorPanel in the DatacentrePanel.
- Verify the game resumes.

### Lab Phase Mechanics:
- Verify that work is now generated automatically per tick.
- Verify that hiring researchers and upgrading hardware function correctly.

### Persistence (Optional):
- If persistence is implemented, verify that the phase and triggered events are saved and loaded correctly.

## Implementation Checklist

- [ ] Create src/stores/events.ts
- [ ] Create src/stores/phases.ts
- [ ] Modify src/stores/techTree.ts to trigger the "first_product_completed" event and check for the first product.
- [ ] Modify src/App.vue to handle the event and phase transition.
- [ ] Modify src/components/DatacentrePanel.vue to conditionally render panels based on the phase.
- [ ] Create src/components/FounderPanel.vue for the startup phase.
- [ ] Modify src/components/TechCard.vue to handle click logic for the startup phase.
- [ ] Modify src/stores/resources.ts to adjust work rate calculation based on the phase.
- [ ] Modify src/components/DebugPanel.vue (Optional) for phase control.
- [ ] Thoroughly test all functionalities as outlined in the testing guidance.
- [ ] Verify code adheres to coding standards (TypeScript, comments, etc.).
- [ ] Review and refactor code for clarity and efficiency.
- [ ] Complete documentation for the event and phase systems.