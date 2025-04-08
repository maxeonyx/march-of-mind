<template>
  <div class="product-grid card">
    <div class="available-section">
      <h4>Available Products</h4>
      <div class="available-products">
        <TechCard
          v-for="id in techTreeStore.availableProducts"
          :key="id"
          :id="id"
          :isLocked="techTreeStore.isLocked(id)"
          :progress="techTreeStore.getProgress(id)"
          :isSelected="id === techTreeStore.currentlySelectedProduct"
        />
        <div v-if="techTreeStore.availableProducts.length === 0" class="empty-message">
          No products available yet
        </div>
      </div>
    </div>
    
    <div class="completed-section">
      <h4>Completed Products</h4>
      <div class="completed-products">
        <div 
          v-for="id in techTreeStore.completedProducts" 
          :key="id"
          class="completed-item"
        >
          <template v-if="findTechById(id)">
            {{ findTechById(id).name }}<br>
            <span class="income-info">+{{ findTechById(id).incomeGenerated }} income</span>
          </template>
          <template v-else>
            Unknown
          </template>
        </div>
        <div v-if="techTreeStore.completedProducts.length === 0" class="empty-message">
          No completed products yet
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTechTreeStore } from '../stores/techTree';
import { findTechById } from '../stores/staticData';
import TechCard from './TechCard.vue';

const techTreeStore = useTechTreeStore();
</script>

<style scoped>
.product-grid {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%; /* Ensure it takes full height */
}

.available-section {
  flex: 1; /* Change from 2 to 1 to match DiscoveryGrid */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  min-height: 0; /* Allow it to shrink if needed */
}

.completed-section {
  flex: 1; /* Give less space to completed section */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 0; /* Allow it to shrink if needed */
}

.available-products,
.completed-products {
  overflow-y: auto;
  flex-grow: 1;
}

h4 {
  margin: 0.5rem 0;
  color: #42b983;
}

.empty-message {
  font-style: italic;
  color: #999;
  padding: 1rem 0;
}

.completed-item {
  background-color: #f0f8ff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

/* Make product cards distinct from background */
.available-products > * {
  background-color: #eef6ff;
  border: 1px solid #b3d4fc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.income-info {
  font-size: 0.75rem;
  color: #333;
}
</style>
