<template>
  <div 
    class="tech-card" 
    :class="{ 'selected': isSelected }"
    @click="handleClick"
  >
    <div class="tech-name">{{ tech?.name || 'Unknown' }}</div>
    <div v-if="isLocked" class="locked-indicator">🔒</div>
    <div v-else-if="progress" class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    <div class="tech-type">{{ tech?.type }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { findTechById } from '../stores/staticData';
import { useTechTreeStore } from '../stores/techTree';

const techTreeStore = useTechTreeStore();

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Object,
    default: null
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

const tech = computed(() => findTechById(props.id));

const progressPercentage = computed(() => {
  if (!props.progress) return 0;
  return (props.progress.workApplied / props.progress.workRequired) * 100;
});

function handleClick() {
  if (props.isLocked) {
    // Unlock the card if it's locked
    techTreeStore.unlock(props.id);
  } else {
    // Select the card if it's already unlocked
    if (tech.value?.type === 'product') {
      techTreeStore.selectProduct(props.id);
    } else if (tech.value?.type === 'discovery') {
      techTreeStore.selectDiscovery(props.id);
    }
  }
}
</script>

<style scoped>
.tech-card {
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.tech-card:hover {
  border-color: #42b983;
  background-color: #f9fff9;
}

.tech-card.selected {
  border-color: #42b983;
  background-color: #f0fff0;
}

.tech-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.tech-type {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.75rem;
  color: #888;
  font-style: italic;
}

.locked-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.2rem;
}

.progress-bar {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #42b983;
  width: 0%;
}
</style>