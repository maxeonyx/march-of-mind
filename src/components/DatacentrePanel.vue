<template>
  <div class="datacentre-panel">
    <h2>Datacentre</h2>
    <div class="datacentre-content" :class="layoutClass">
      <template v-if="phaseStore.currentPhase === 'startup'">
        <FounderPanel class="grid-founder" />
        <HardwarePanel class="grid-hardware" />
        <WorkPanel class="grid-work" />
      </template>

      <template v-else-if="phaseStore.currentPhase === 'lab'">
        <ResearchersPanel class="grid-researchers" />
        <HardwarePanel class="grid-hardware" />
        <WorkPanel class="grid-work" />
        <WorkAllocatorPanel class="grid-allocator" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePhaseStore } from '../stores/phase';

// Import all possible panels
import FounderPanel from './FounderPanel.vue';
import ResearchersPanel from './ResearchersPanel.vue';
import HardwarePanel from './HardwarePanel.vue';
import WorkPanel from './WorkPanel.vue';
import WorkAllocatorPanel from './WorkAllocatorPanel.vue';

const phaseStore = usePhaseStore();

// Computed property for layout class
const layoutClass = computed(() => {
  return `${phaseStore.currentPhase}-layout`; // e.g., 'startup-layout' or 'lab-layout'
});
</script>

<style scoped>
.datacentre-panel {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  text-align: center;
}

.datacentre-content {
  display: grid;
  gap: 1rem;
}

/* Default Layout (Lab Phase) */
.datacentre-content.lab-layout {
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "researchers hardware"
    "work work"
    "allocator allocator";
}
.lab-layout .grid-researchers { grid-area: researchers; }
.lab-layout .grid-hardware { grid-area: hardware; }
.lab-layout .grid-work { grid-area: work; }
.lab-layout .grid-allocator { grid-area: allocator; }

/* Startup Phase Layout */
.datacentre-content.startup-layout {
   grid-template-columns: 1fr; /* Single column */
   grid-template-areas:
     "founder"
     "hardware"
     "work";
}
.startup-layout .grid-founder { grid-area: founder; }
.startup-layout .grid-hardware { grid-area: hardware; }
.startup-layout .grid-work { grid-area: work; }
</style>