<template>
  <div id="app">
    <header>
      <img alt="March of Mind logo" src="./assets/logo.png" class="logo">
      <h1>March of Mind</h1>
    </header>
    <main>
      <h2>Company Dashboard</h2>
      <div class="game-container">
        <div class="resource-display">
          <h3>Money: ${{ money }}</h3>
        </div>
        <div class="actions">
          <button @click="earnMoney" class="action-button">Unrealistically Earn Money</button>
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
import { computed } from 'vue';
import { useVersion } from './composables/useVersion';
import { useAppStore } from './stores/app';

const { version: versionInfo } = useVersion();
const version = computed(() => versionInfo.value?.version || '0.0.0');
const store = useAppStore();
const money = computed(() => store.count);

function earnMoney() {
  store.increment();
}
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

header {
  margin: 60px 0;
}

.logo {
  width: 80px;
  height: 80px;
}

h1 {
  font-size: 28px;
  color: var(--primary-color);
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
}

.resource-display h3 {
  font-size: 24px;
  color: var(--text-color);
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.action-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: var(--primary-hover);
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
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>