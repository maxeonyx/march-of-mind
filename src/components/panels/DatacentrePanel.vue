<template>
  <div class="datacentre-panel">
    <!-- Top row with hardware and research -->
    <div class="top-row">
      <!-- Hardware Panel -->
      <HardwarePanel
        :hardware="hardware"
        :onUpgrade="onUpgradeHardware"
      />

      <!-- Research Button Panel -->
      <ResearchButtonPanel
        @research="onResearch"
      />
    </div>

    <!-- Insight Rate Indicator -->
    <InsightRateDisplay :rate="insightRate" />

    <!-- Resource Allocation Slider -->
    <ResourceAllocationSlider
      v-model="allocation"
      :leftValue="insightsToProducts"
      :rightValue="insightsToPureResearch"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HardwarePanel from '@/components/panels/HardwarePanel.vue';
import ResearchButtonPanel from '@/components/panels/ResearchButtonPanel.vue';
import InsightRateDisplay from '@/components/panels/InsightRateDisplay.vue';
import ResourceAllocationSlider from '@/components/panels/ResourceAllocationSlider.vue';
import type { HardwareStore } from '@/store/hardware';

const props = defineProps<{
  hardware: HardwareStore;
  insightRate: number;
  allocation: number;
  insightsToProducts: number;
  insightsToPureResearch: number;
}>();

const emit = defineEmits<{
  (e: 'update:allocation', value: number): void;
  (e: 'research'): void;
  (e: 'upgradeHardware'): void;
}>();

// Computed property for v-model binding of allocation
const allocation = computed({
  get: () => props.allocation,
  set: (value) => emit('update:allocation', value)
});

// Event handlers
function onResearch() {
  emit('research');
}

function onUpgradeHardware() {
  emit('upgradeHardware');
}
</script>

<style scoped>
.datacentre-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Top row with hardware and research */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .top-row {
    grid-template-columns: 1fr;
  }
}
</style>
