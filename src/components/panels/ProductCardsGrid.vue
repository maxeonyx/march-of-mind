<template>
  <div class="section products-section">
    <h3>Products</h3>
    <div class="cards-grid products-grid">
      <!-- Available but not unlocked products -->
      <div v-for="product in availableProducts" :key="product.id" class="card product-card available">
        <div v-if="!isProductUnlocked(product.id)" class="card-status">
          <span class="status-text">quiz not done yet</span>
        </div>
        <div class="card-title">{{ product.name }}</div>
        <div class="card-action">
          <button @click="selectProduct(product.id)" class="action-button">Select</button>
        </div>
      </div>
      
      <!-- Unlocked products -->
      <div v-for="product in unlockedProducts" :key="product.id" class="card product-card unlocked">
        <div class="card-title">{{ product.name }}</div>
        <div class="card-action">
          <button @click="selectProduct(product.id)" class="action-button">
            select to put in-progress
          </button>
        </div>
      </div>
      
      <!-- Developed products -->
      <div v-for="product in developedProducts" :key="product.id" class="card product-card developed">
        <div class="card-title">{{ product.name }}</div>
        <div class="card-revenue">${{ product.revenue }}/mo</div>
        <div class="card-detail">
          <button @click="showProductDetails(product.id)" class="detail-button">Detail</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIProduct } from '@/store/ai-products';

const props = defineProps<{
  availableProducts: AIProduct[];
  unlockedProducts: AIProduct[];
  developedProducts: AIProduct[];
  isProductUnlocked: (id: string) => boolean;
}>();

const emit = defineEmits<{
  (e: 'selectProduct', id: string): void;
  (e: 'showDetails', id: string): void;
}>();

function selectProduct(id: string) {
  emit('selectProduct', id);
}

function showProductDetails(id: string) {
  emit('showDetails', id);
}
</script>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding: 5px;
}

/* Card Styling */
.card {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.card-status {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 5px;
  border-radius: 0 6px 0 6px;
  font-size: 0.7rem;
}

.card-action {
  margin-top: 8px;
}

.action-button {
  width: 100%;
  padding: 5px;
  font-size: 0.8rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card-revenue {
  color: var(--positive-color);
  font-weight: bold;
  font-size: 0.9rem;
}

.detail-button {
  margin-top: 5px;
  padding: 3px;
  font-size: 0.7rem;
  background-color: transparent;
  color: var(--muted-text);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
}

/* Card states */
.card.available {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
}

.card.unlocked {
  background-color: #f0f8ff;
  border: 1px solid var(--secondary-color);
}

.card.developed {
  background-color: #e8f5e9;
  border: 1px solid var(--positive-color);
}

.status-text {
  color: var(--muted-text);
  font-size: 0.7rem;
}
</style>