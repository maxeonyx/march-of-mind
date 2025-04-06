<template>
  <div class="section hardware-section">
    <h3>Hardware</h3>
    <div class="hardware-info">
      <p>{{ currentHardware.name }}</p>
      <p>{{ currentHardware.flops }} FLOP/s</p>
    </div>
    
    <div v-if="nextHardware" class="hardware-upgrade">
      <ProgressButton 
        @click="upgradeHardware" 
        :enabled="canUpgrade"
        :progress="upgradeProgress"
        theme="secondary"
        data-testid="btn-upgrade-hardware"
      >
        Upgrade
      </ProgressButton>
    </div>
    <div v-else class="max-hardware">
      <p>Maximum hardware reached</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressButton from '@/components/ProgressButton.vue';
import type { HardwareStore } from '@/store/hardware';

const props = defineProps<{
  hardware: HardwareStore,
  onUpgrade?: () => void
}>();

// Hardware related computed properties
const currentHardware = computed(() => props.hardware.currentHardware);
const nextHardware = computed(() => props.hardware.nextHardware);
const canUpgrade = computed(() => props.hardware.canUpgrade);
const upgradeProgress = computed(() => props.hardware.upgradeProgress);

function upgradeHardware() {
  if (!canUpgrade.value || !nextHardware.value) return;
  
  if (props.onUpgrade) {
    // Let the parent handle educational modal
    props.onUpgrade();
  } else {
    // Direct upgrade if no handler provided
    props.hardware.upgrade();
  }
}
</script>

<style scoped>
.hardware-section {
  text-align: center;
}

.hardware-info {
  margin-bottom: 10px;
}

.hardware-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.max-hardware {
  color: var(--muted-text);
  font-style: italic;
  padding: 8px 0;
}

/* Common section styling will be applied from the parent */
</style>