<template>
  <div id="app">
    <PopulationSimulatorPage />
  </div>
</template>

<script setup lang="ts">
import PopulationSimulatorPage from './components/PopulationSimulatorPage.vue';
</script>

<style>
:root {
  --primary-color: #42b983;
  --primary-hover: #3aa876;
  --error-color: #e53935;
  --text-color: #2c3e50;
  --muted-text: #666;
  --border-color: #ddd;
  --bg-color: #f9f9f9;
}

html, body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  margin: 0 auto;
  padding: 0;
}
</style>
