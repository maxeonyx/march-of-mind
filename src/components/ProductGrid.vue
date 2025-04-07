<template>
  <div class="product-grid">
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
    
    <h4>Completed Products</h4>
    <div class="completed-products">
      <div 
        v-for="id in techTreeStore.completedProducts" 
        :key="id"
        class="completed-item"
      >
        {{ findTechById(id)?.name || 'Unknown' }}
      </div>
      <div v-if="techTreeStore.completedProducts.length === 0" class="empty-message">
        No completed products yet
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
</style>