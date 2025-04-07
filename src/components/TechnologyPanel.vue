<template>
  <div class="technology-panel">
    <h2>Technology</h2>
    <div class="tech-container">
      <div class="products-section">
        <h3>Products</h3>
        <ProductGrid />
      </div>
      <div class="discoveries-section">
        <h3>Discoveries</h3>
        <DiscoveryGrid />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductGrid from './ProductGrid.vue';
import DiscoveryGrid from './DiscoveryGrid.vue';
</script>

<style scoped>
.technology-panel {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

.tech-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  flex-grow: 1;
}

.products-section,
.discoveries-section {
  display: flex;
  flex-direction: column;
  min-height: 0; /* allow children to shrink */
}

.discoveries-section {
  /* Make the discovery grid fill vertical space */
  flex-grow: 1;
}

.discoveries-section > *:last-child {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.discoveries-section .discovery-grid {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

h3 {
  color: #2c3e50;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}
</style>
