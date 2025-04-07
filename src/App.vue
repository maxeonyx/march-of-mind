<template>
  <div id="app">
    <HeaderPanel />
    
    <main>
      <div class="game-controls">
        <button 
          @click="startGame" 
          :disabled="timeStore.isRunning" 
          class="start-button"
        >
          Start Game
        </button>
        <button 
          @click="stopGame" 
          :disabled="!timeStore.isRunning" 
          class="stop-button"
        >
          Stop Game
        </button>
      </div>

      <div class="main-content">
        <div class="left-column">
          <ResourcePanel />
          <DatacentrePanel />
        </div>
        <div class="right-column">
          <TechnologyPanel />
        </div>
      </div>
      
      <!-- Debug Panel with advanced actions - will be removed later -->
      <DebugPanel />
      
      <div class="debug-section">
        <h3>Debug Controls</h3>
        <button @click="initializeAllStores">Initialize All Stores</button>
      </div>
    </main>
    
    <footer>
      <p>Version {{ version }}</p>
      <p v-if="versionInfo?.buildTime" class="build-time">
        Built: {{ new Date(versionInfo.buildTime).toLocaleString() }}
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useVersion } from './composables/useVersion';
import HeaderPanel from './components/HeaderPanel.vue';
import ResourcePanel from './components/ResourcePanel.vue';
import DatacentrePanel from './components/DatacentrePanel.vue';
import TechnologyPanel from './components/TechnologyPanel.vue';
import DebugPanel from './components/DebugPanel.vue';

// Import stores for initialization
import { useResourcesStore } from './stores/resources';
import { useDatacentreStore } from './stores/datacentre';
import { useTechTreeStore } from './stores/techTree';
import { useTimeStore } from './stores/time';

const { version: versionInfo } = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');

// For debugging initialization
const resourcesStore = useResourcesStore();
const datacentreStore = useDatacentreStore();
const techTreeStore = useTechTreeStore();
const timeStore = useTimeStore();

function initializeAllStores() {
  resourcesStore.initialize();
  datacentreStore.initialize();
  techTreeStore.initialize();
  timeStore.initialize();
  console.log('All stores initialized');
}

// Game control functions
function startGame() {
  timeStore.startGame();
}

function stopGame() {
  timeStore.stopGame();
}

// Start the game when the component is mounted
onMounted(() => {
  // Start game automatically
  timeStore.startGame();
});
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

main {
  margin-bottom: 50px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.start-button {
  background-color: var(--primary-color);
}

.stop-button {
  background-color: var(--error-color);
}

.debug-section {
  background-color: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: left;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

footer {
  text-align: center;
  margin: 30px 0;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  color: var(--muted-text);
  font-size: 14px;
}

footer p {
  margin: 5px 0;
}

footer .build-time {
  font-size: 12px;
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  #app {
    padding: 0 15px;
  }
}
</style>
