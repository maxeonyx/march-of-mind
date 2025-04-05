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
      <h2>{{ gameTitle }}</h2>
      <div class="game-container">
        <div class="resource-display">
          <h3>Money: ${{ money }}</h3>
        </div>
        
        <!-- Job Phase UI -->
        <div v-if="gamePhase === 'job'" class="phase-container job-phase">
          <div class="progress-container">
            <div class="progress-label">Progress to founding company: {{ Math.floor(foundingProgress * 100) }}%</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${foundingProgress * 100}%` }"></div>
            </div>
            <div class="progress-info">
              <span>{{ money }} / {{ COMPANY_FOUNDING_COST }}</span>
            </div>
          </div>
          
          <div class="actions">
            <button @click="workForTheMad" class="action-button work-button">
              Work for the Man
              <span class="button-effect" v-if="workButtonClicked"></span>
            </button>
            
            <button 
              @click="foundCompany" 
              class="action-button found-button"
              :class="{ 'button-enabled': canFoundCompany }"
              :disabled="!canFoundCompany"
            >
              Found a Company
            </button>
          </div>
        </div>
        
        <!-- Company Phase UI (will expand in future phases) -->
        <div v-if="gamePhase === 'company'" class="phase-container company-phase">
          <div class="company-info">
            <h3>Your Company is Founded!</h3>
            <p>More features coming in the next development phase...</p>
          </div>
        </div>
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
import { computed, ref, onMounted } from 'vue';
import { useVersion } from './composables/useVersion';
import { useAppStore, COMPANY_FOUNDING_COST, GamePhase } from './stores/app';

// Version info
const { version: versionInfo } = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');

// Store and game state
const store = useAppStore();
const money = computed(() => store.money);
const gamePhase = computed(() => store.gamePhase);
const foundingProgress = computed(() => store.companyFoundingProgress);
const canFoundCompany = computed(() => store.canFoundCompany);

// Button click animation state
const workButtonClicked = ref(false);

// Dynamic game title based on phase
const gameTitle = computed(() => {
  switch (store.gamePhase) {
    case GamePhase.JOB:
      return "Working for the Man";
    case GamePhase.COMPANY:
      return "Company Dashboard";
    case GamePhase.MARKETING:
      return "Marketing Department";
    case GamePhase.RESEARCH:
      return "Research & Development";
    default:
      return "March of Mind";
  }
});

// Game actions
function workForTheMad() {
  // Always increment the money counter regardless of animation state
  store.earnMoney();
  
  // Button click animation - decoupled from the money earning
  // This ensures rapid clicks are all counted even during animation
  if (!workButtonClicked.value) {
    workButtonClicked.value = true;
    setTimeout(() => {
      workButtonClicked.value = false;
    }, 300);
  }
}

function foundCompany() {
  if (canFoundCompany.value) {
    store.foundCompany();
  }
}

// Reset game state for development purposes
function resetGame() {
  store.resetGame();
}

// Initialize game on component mount
onMounted(() => {
  store.loadGame();
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

.resource-display {
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.resource-display h3 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0;
}

.phase-container {
  margin-top: 20px;
}

/* Progress bar styles */
.progress-container {
  margin: 20px 0;
}

.progress-label {
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: var(--progress-bg);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--progress-fill);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  font-size: 14px;
  color: var(--muted-text);
}

/* Action buttons */
.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

.action-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.action-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Work button specific styles */
.work-button {
  background-color: var(--primary-color);
}

.work-button:hover {
  background-color: var(--primary-hover);
}

/* Found button specific styles */
.found-button {
  background-color: var(--secondary-color);
  opacity: 0.6;
  cursor: not-allowed;
}

.found-button.button-enabled {
  opacity: 1;
  cursor: pointer;
}

.found-button.button-enabled:hover {
  background-color: var(--secondary-hover);
}

/* Button click effect */
.button-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: scale(1);
  animation: ripple 0.3s linear;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(40);
    opacity: 0;
  }
}

/* Company phase specific styles */
.company-phase {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.company-info h3 {
  color: var(--primary-color);
  margin-bottom: 10px;
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
  
  .action-button {
    min-width: 180px;
    padding: 10px 20px;
  }
}
</style>