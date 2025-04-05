<template>
  <div id="app">
    <header>
      <img alt="March of Mind logo" src="./assets/logo.png" class="logo">
      <h1>March of Mind</h1>
      <div class="dev-controls">
        <button @click="resetGame" class="dev-button">Reset Game (Dev)</button>
      </div>
    </header>
    <main>
      <h2>{{ phaseTitle }}</h2>
      
      <!-- Date display -->
      <DateDisplay />
      
      <div class="game-container">
        <!-- Resource display -->
        <ResourceDisplay :showIncomeStats="gamePhase === 'company'" />
        
        <!-- Job Phase -->
        <JobPhase v-if="gamePhase === 'job'" />
        
        <!-- Company Phase -->
        <CompanyPhase v-if="gamePhase === 'company'" />
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
import { useGameStore } from './stores/game';
import { usePhaseStore } from './stores/modules/phase';

// Components
import DateDisplay from './components/DateDisplay.vue';
import ResourceDisplay from './components/ResourceDisplay.vue';
import JobPhase from './components/phases/JobPhase.vue';
import CompanyPhase from './components/phases/CompanyPhase.vue';

// Version info
const { version: versionInfo } = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');

// Game stores
const gameStore = useGameStore();
const phaseStore = usePhaseStore();

// Game state
const gamePhase = computed(() => phaseStore.gamePhase);
const phaseTitle = computed(() => phaseStore.phaseTitle);

// Game actions
function resetGame() {
  gameStore.resetGame();
}

// Initialize game on component mount
onMounted(() => {
  gameStore.init();
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
  --secondary-color: #4a8af4;
  --secondary-hover: #3a7ae4;
  --disabled-color: #b0b0b0;
  --progress-bg: #e0e0e0;
  --progress-fill: #42b983;
  --positive-color: #4caf50;
  --negative-color: #f44336;
  --hire-color: #4a8af4;
  --hire-hover: #3a7ae4;
  --fire-color: #e53935;
  --fire-hover: #d32f2f;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

header {
  margin: 60px 0;
  position: relative;
}

.logo {
  width: 80px;
  height: 80px;
}

h1 {
  font-size: 28px;
  color: var(--primary-color);
}

.dev-controls {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
}

.dev-button {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.dev-button:hover {
  opacity: 1;
}

main {
  margin-bottom: 50px;
}

.game-container {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
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
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>