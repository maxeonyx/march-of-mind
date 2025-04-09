# Events and Phases System Documentation

This document describes the event and phase systems implemented in the "March of Mind" game.

## 1. Event System

The event system is designed to detect specific occurrences within the game and trigger corresponding actions. It is managed by the useEventsStore.

### 1.1. Core Functionality

- **Event Triggering**: The triggerEvent(eventId: string) function is used to signal that a specific event has occurred.
- **Event Detection**: The hasEventTriggered(eventId: string) function checks if a particular event has been triggered.
- **Event Storage**: The triggeredEvents (Set<string>) ref stores the IDs of all events that have been triggered.
- **Event Resetting**: The resetEvents() function clears all triggered events. This is useful for resetting the game state.

### 1.2. Example

```typescript
import { useEventsStore } from './stores/events';

const eventsStore = useEventsStore();

// Trigger an event
eventsStore.triggerEvent('research_completed');

// Check if an event has been triggered
if (eventsStore.hasEventTriggered('research_completed')) {
    console.log('Research completed event detected!');
    // Perform actions related to research completion
}
```

### 1.3. Adding New Events

1. Define a unique eventId string. This should be descriptive and follow a consistent naming convention (e.g., first_upgrade_purchased, new_technology_discovered).
2. Call eventsStore.triggerEvent(eventId) when the event condition is met. This can be done in any part of the codebase.
3. Use eventsStore.hasEventTriggered(eventId) to check for the event and execute the appropriate logic.

### 1.4. Best Practices

- Keep event IDs consistent and descriptive. This improves code readability and maintainability.
- Avoid triggering events too frequently. This can lead to performance issues.
- Use the event system for significant game state changes. Minor updates do not need to be tracked as events.

### 1.5. Common Mistakes to Avoid

- Duplicating event IDs: Ensure each event has a unique ID to prevent conflicts.
- Forgetting to check if an event has been triggered: Always use hasEventTriggered() before performing event-specific logic.
- Overusing the event system: Only use it when necessary to keep the codebase clean.

## 2. Phase System

The phase system manages the different stages of the game, controlling which components are displayed and how game mechanics function. It is managed by the usePhasesStore.

### 2.1. Core Functionality

- **Phase Tracking**: The currentPhase (ref<string>) ref stores the current game phase.
- **Phase Setting**: The setPhase(phase: string) function is used to change the current game phase.

### 2.2. Example

```typescript
import { usePhasesStore } from './stores/phases';

const phasesStore = usePhasesStore();

// Get the current phase
const currentPhase = phasesStore.currentPhase;
console.log(`Current phase: ${currentPhase}`);

// Set a new phase
phasesStore.setPhase('development');
```

### 2.3. Adding New Phases

1. Define a unique phase string. This should be descriptive (e.g., exploration, production, research).
2. Use phasesStore.setPhase(phase) to transition to the new phase. This can be triggered by events, player actions, or other game logic.
3. Conditionally render components or modify game logic based on phasesStore.currentPhase.

### 2.4. Best Practices

- Define clear phase transitions. Know when and why the game should move from one phase to another.
- Use v-if or computed properties to conditionally render components based on the phase. This keeps the template clean.
- Keep phase-specific logic encapsulated. Avoid spreading phase checks throughout the codebase.

### 2.5. Common Mistakes to Avoid

- Using inconsistent phase names: Stick to a naming convention to avoid errors.
- Creating too many phases: This can make the game overly complex.
- Not handling all necessary phase transitions: Ensure all possible phase changes are accounted for.

## 3. System Interaction

The event and phase systems work together to create dynamic gameplay. Events can trigger phase transitions, and the current phase can influence which events are relevant.

### 3.1. System Interaction Diagram

```
+-----------------+     Trigger Event     +-----------------+     Set Phase     +-----------------+
|   Game Logic    |--------------------->|  Events Store   |--------------------->|   Phases Store  |
+-----------------+                     +-----------------+                     +-----------------+
        ^                                       |                                       |
        | Check Phase                             | Check Event                             | Conditionally Render/Logic
        |                                       |                                       |
+-----------------+     hasEventTriggered     +-----------------+     currentPhase      +-----------------+
|   Phases Store  |<---------------------|   Events Store   |<---------------------|   Game Logic    |
+-----------------+                     +-----------------+                     +-----------------+
```

### 3.2. Startup to Lab Transition Example

In the "March of Mind" game, the first_product_completed event triggers a transition from the "startup" phase to the "lab" phase.

1. When a product is completed, the techTreeStore triggers the first_product_completed event.
2. The App.vue component listens for this event.
3. When the event is triggered, the App.vue component shows a popup and pauses the game.
4. After the player dismisses the popup, the App.vue component sets the game phase to "lab" using phasesStore.setPhase('lab') and resumes the game.
5. The DatacentrePanel.vue component conditionally renders the FounderPanel in the "startup" phase and the ResearchersPanel, HardwarePanel, WorkPanel, and WorkAllocatorPanel in the "lab" phase.
6. The FounderPanel.vue handles work application in the startup phase.
7. The resourcesStore adjusts work rate calculation based on the current phase.

## 4. Known Limitations

- **Popup System**: The popup system is currently a placeholder. A more robust UI implementation is needed.
- **Event Persistence**: Event persistence is not implemented in these instructions. If required, it will need to be added.
- **Error Handling**: More comprehensive error handling may be needed for edge cases.

This documentation provides a comprehensive overview of the event and phase systems. By following the best practices and avoiding the common mistakes, you can effectively use these systems to create engaging and dynamic gameplay in "March of Mind."