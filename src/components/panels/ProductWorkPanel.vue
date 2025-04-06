<template>
  <div class="section product-panel">
    <div v-if="hasProductInProgress" class="in-progress-product">
      <div class="product-title">{{ productName }}</div>
      <div class="product-description">{{ productDescription }}</div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
        <div class="progress-text">{{ Math.round(progressPercentage) }}%</div>
      </div>
      <div class="allocation-info">
        <span class="info-label">Allocation:</span>
        <span class="info-value">{{ allocationValue }}x thought power per click</span>
      </div>
    </div>
    <div v-else class="no-product">
      <p>Select a product to develop</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  hasProductInProgress: boolean;
  productName?: string;
  productDescription?: string;
  progress: number;
  allocationValue: number;
}>();

// Compute progress as percentage
const progressPercentage = computed(() => props.progress * 100);
</script>

<style scoped>
.product-panel {
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.in-progress-product {
  width: 100%;
  min-height: 100px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid var(--secondary-color);
}

.product-title {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 5px;
  color: var(--secondary-color);
}

.product-description {
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

.progress-bar {
  height: 100%;
  background-color: var(--secondary-color);
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

.info-value {
  font-weight: bold;
  color: var(--secondary-color);
}

.no-product {
  color: var(--muted-text);
  font-style: italic;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>