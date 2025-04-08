<template>
  <div id="app">
    <HeaderPanel />
    
    <main>
      <div class="game-controls">
        <button 
          @click="resetGame" 
          class="reset-button"
        >
          Reset Game
        </button>
        <button 
          @click="togglePause" 
          class="toggle-button"
          :class="{ 'paused': !timeStore.isRunning || timeStore.isPausedManually }"
        >
          {{ isPaused ? 'Resume Game' : 'Pause Game' }}
        </button>
        <div class="game-status">
          The game loop is {{ isPaused ? 'paused' : 'running' }}
        </div>
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

    <!-- Quiz Modal Component -->
    <QuizModal />
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
import QuizModal from './components/QuizModal.vue';

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
function resetGame() {
  // First pause the game if it's running
  if (!isPaused.value) {
    togglePause();
  }
  
  // Reset all stores to initial state
  resourcesStore.initialize();
  datacentreStore.initialize();
  techTreeStore.initialize();
  timeStore.initialize();
  
  // Start the game after reset
  togglePause();
  
  console.log('Game has been reset to initial state');
}

const isPaused = computed(() => {
  return !timeStore.isRunning || timeStore.isPausedManually;
});

function togglePause() {
  if (isPaused.value) {
    // Resume the game
    if (!timeStore.isRunning) {
      // If completely stopped, start the game
      timeStore.startGame();
    } else if (timeStore.isPausedManually) {
      // If just paused, resume
      timeStore.isPausedManually = false;
      timeStore.lastTickTimestamp = Date.now(); // Reset timestamp to prevent time jump
      
      // Restart tick loop if needed
      if (timeStore.timerId === null) {
        timeStore.tick();
      }
    }
    console.log('Game resumed');
  } else {
    // Pause the game
    timeStore.isPausedManually = true;
    console.log('Game paused');
  }
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
  height: 100%;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.reset-button {
  background-color: var(--error-color);
}

.toggle-button {
  background-color: var(--primary-color);
}

.toggle-button.paused {
  background-color: #f39c12; /* Orange for paused state */
}

.game-status {
  margin-left: 1rem;
  font-weight: bold;
  display: inline-block;
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
