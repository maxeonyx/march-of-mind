<template>
  <div class="population-simulator-page">
    <PopulationSimulator />
  </div>
</template>

<script setup lang="ts">
import PopulationSimulator from './PopulationSimulator.vue';
</script>

<style scoped>
.population-simulator-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
