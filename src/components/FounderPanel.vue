<template>
  <div class="founder-panel panel-card">
    <h3>Founder Actions (Startup Phase)</h3>
    <p>Manually drive initial breakthroughs by applying focused effort to discoveries.</p>
    <div v-if="techTreeStore.currentlySelectedDiscovery">
      <p>Applying effort to: <strong>{{ selectedDiscoveryName }}</strong></p>
      <button @click="doManualResearch" :disabled="!canDoResearch">
        Focus Effort (Applies {{ manualWorkPerClick.toFixed(2) }} Work)
      </button>
      <p v-if="!canDoResearch" class="error-message">
        Cannot apply effort: No discovery selected.
      </p>
    </div>
    <div v-else>
      <p class="info-message">Select an available Discovery to begin.</p>
      <button disabled>Focus Effort</button>
    </div>

    <div class="manual-work-info">
      Work per Click ≈ FLOPS<sup>0.7</sup> &times; 1<sup>0.3</sup> (Base Effort)
      <br/>
      Current FLOPS: {{ resourcesStore.flopsRate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTechTreeStore } from '../stores/techTree';
import { useResourcesStore } from '../stores/resources';
import { findTechById } from '../stores/staticData';

const techTreeStore = useTechTreeStore();
const resourcesStore = useResourcesStore();

const canDoResearch = computed(() => !!techTreeStore.currentlySelectedDiscovery);

const selectedDiscoveryName = computed(() => {
  if (!techTreeStore.currentlySelectedDiscovery) return 'None';
  const tech = findTechById(techTreeStore.currentlySelectedDiscovery);
  return tech?.name ?? 'Unknown';
});

// Calculate how much work one manual click generates
const manualWorkPerClick = computed(() => {
  // Design Decision: In 'startup', manual effort applies directly to discoveries.
  // We use current FLOPS, but assume a fixed "creativity input" of 1 per click.
  const flops = resourcesStore.flopsRate;
  const baseCreativityPerClick = 1; // Represents one unit of focused effort/creativity input.
  // Formula: Work = FLOPS^0.7 * Creativity^0.3
  return Math.pow(flops, 0.7) * Math.pow(baseCreativityPerClick, 0.3);
});

function doManualResearch() {
  if (!canDoResearch.value || !techTreeStore.currentlySelectedDiscovery) {
    console.warn("Attempted manual research without a selected discovery.");
    return;
  }

  const workAmount = manualWorkPerClick.value;
  const discoveryId = techTreeStore.currentlySelectedDiscovery;

  console.log(`Applying ${workAmount.toFixed(2)} manual work to ${discoveryId}`);
  techTreeStore.progressWork(discoveryId, workAmount);

  // Optional: Add visual feedback here (e.g., button flash)
}
</script>

<style scoped>
.panel-card { /* Use a consistent card style */
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

h3 {
  margin-top: 0;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
   background-color: #3aa876;
}

.error-message {
  color: var(--error-color, #e53935);
  font-size: 0.9rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.info-message {
   color: var(--muted-text, #666);
   font-style: italic;
   text-align: center;
}

.manual-work-info {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color, #ddd);
  font-size: 0.85rem;
  color: var(--muted-text, #666);
  font-family: monospace;
  text-align: center;
}
</style>