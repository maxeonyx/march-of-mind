<template>
  <!--
    UI Design Guidelines:
    - All content should always fit within the viewport without scrolling
    - Any scrolling should ONLY happen within individual components
    - Layout uses a compact horizontal header to maximize vertical game space
    - Footer remains minimal to preserve screen real estate
  -->
  <header class="app-header">
    <div class="header-left">
      <img alt="March of Mind logo" src="./assets/logo.png" class="logo">
      <h1>March of Mind</h1>
    </div>
    <div class="header-center">
      <DateDisplay />
    </div>
    <div class="header-right">
      <button @click="gameStore.resetGame()" class="dev-button" data-testid="btn-reset-game">Reset Game (Dev)</button>
    </div>
  </header>
  <main>
    <h2>{{ gameStore.phaseTitle }}</h2>

    <div class="game-container">
      <!-- Resource display - show different stats based on game phase -->
      <ResourceDisplay 
        :showIncomeStats="gameStore.phase === 'lab_phase' || gameStore.phase === 'industry_phase' || gameStore.phase === 'agi_phase'" 
        :showResearchStats="gameStore.phase === 'research_phase' || gameStore.phase === 'lab_phase' || gameStore.phase === 'industry_phase' || gameStore.phase === 'agi_phase'"
        :showHardwareStats="gameStore.phase === 'lab_phase' || gameStore.phase === 'industry_phase' || gameStore.phase === 'agi_phase'"
      />

      <!-- Educational Game Phases -->
      <ResearchPhase v-if="gameStore.phase === 'research_phase'" />
      <LabPhase v-if="gameStore.phase === 'lab_phase'" />
    </div>
  </main>
  <footer>
    <p>Version {{ version }}</p>
    <p v-if="versionInfo.value?.buildTime" class="build-time">
      Built: {{ new Date(versionInfo.value.buildTime).toLocaleString() }}
    </p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVersion } from './store/version';
import { useGameStore } from './store';

// Components
import DateDisplay from './components/DateDisplay.vue';
import ResourceDisplay from './components/ResourceDisplay.vue';

// Educational game phase components
import ResearchPhase from './phases/ResearchPhase.vue';
import LabPhase from './phases/LabPhase.vue';

// Version info
const versionInfo = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');

// Game store
const gameStore = useGameStore();

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
  --marketing-color: #ff9800;
  --marketing-hover: #f57c00;
  --success-color: #4caf50;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-center {
  flex-grow: 1;
  padding: 0 20px;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

h1 {
  font-size: 24px;
  color: var(--primary-color);
  margin: 0;
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
  flex: 1;
  margin-bottom: 20px;
}

.game-container {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 1400px; /* Increased max-width to give more space */
  margin: 0 auto;
  width: 100%;
}

footer {
  text-align: center;
  padding: 10px 0;
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
    font-size: 20px;
  }

  h2 {
    font-size: 18px;
  }

  .logo {
    width: 30px;
    height: 30px;
  }

  .app-header {
    padding: 5px 0;
  }
}
</style>
