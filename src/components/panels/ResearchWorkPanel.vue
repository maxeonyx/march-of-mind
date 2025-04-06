<template>
  <div class="section research-panel">
    <div v-if="hasResearchInProgress" class="in-progress-research">
      <div class="research-title">{{ researchTitle }}</div>
      <div class="research-description">{{ researchDescription }}</div>
      <div class="progress-container">
        <div class="progress-bar research-progress" :style="{ width: `${progressPercentage}%` }"></div>
        <div class="progress-text">{{ Math.round(progressPercentage) }}%</div>
      </div>
      <div class="allocation-info">
        <span class="info-label">Allocation:</span>
        <span class="info-value research-value">{{ allocationValue }}x thought power per click</span>
      </div>
    </div>
    <div v-else class="no-research">
      <p>No research in progress</p>
      <button @click="startResearch" class="start-research-button" :disabled="!canStartResearch">
        Start Research
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  hasResearchInProgress: boolean;
  researchTitle?: string;
  researchDescription?: string;
  progress: number;
  allocationValue: number;
  canStartResearch?: boolean;
}>();

const emit = defineEmits<{
  (e: 'startResearch'): void
}>();

// Default props
const canStartResearch = computed(() => 
  props.canStartResearch !== undefined ? props.canStartResearch : true
);

// Compute progress as percentage
const progressPercentage = computed(() => props.progress * 100);

function startResearch() {
  emit('startResearch');
}
</script>

<style scoped>
.research-panel {
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.in-progress-research {
  width: 100%;
  min-height: 100px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid var(--primary-color);
}

.research-title {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 5px;
  color: var(--primary-color);
}

.research-description {
  font-size: 0.8rem;
  color: var(--text-color);
  margin-bottom: 10px;
  flex-grow: 1;
}

.progress-container {
  width: 100%;
  height: 12px;
  background-color: var(--progress-bg);
  border-radius: 6px;
  overflow: hidden;
  margin: 10px 0;
  position: relative;
}

.progress-bar.research-progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.allocation-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 5px;
}

.info-label {
  color: var(--muted-text);
}

.info-value.research-value {
  font-weight: bold;
  color: var(--primary-color);
}

.no-research {
  color: var(--muted-text);
  font-style: italic;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.start-research-button {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.start-research-button:disabled {
  background-color: var(--muted-text);
  cursor: not-allowed;
}
</style>