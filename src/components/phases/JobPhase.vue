<template>
  <div class="phase-container job-phase">
    <div class="progress-container" v-if="!useProgressButton">
      <div class="progress-label">Progress to founding company: {{ Math.floor(foundingProgress * 100) }}%</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${foundingProgress * 100}%` }"></div>
      </div>
      <div class="progress-info">
        <span>{{ money }} / {{ COMPANY_FOUNDING_COST }}</span>
      </div>
    </div>
    
    <div class="actions">
      <!-- Regular button version -->
      <button 
        v-if="!useProgressButton"
        @click="workForTheMad" 
        class="action-button work-button"
      >
        Work for the Man
        <span class="button-effect" v-if="workButtonClicked"></span>
      </button>
      
      <!-- ProgressButton version -->
      <ProgressButton
        v-else
        :enabled="true"
        :progress="0"
        @click="workForTheMad"
        theme="primary"
      >
        Work for the Man
      </ProgressButton>
      
      <!-- Regular button version -->
      <button 
        v-if="!useProgressButton"
        @click="foundCompany" 
        class="action-button found-button"
        :class="{ 'button-enabled': canFoundCompany }"
        :disabled="!canFoundCompany"
      >
        Found a Company
      </button>
      
      <!-- ProgressButton version -->
      <ProgressButton
        v-else
        :enabled="canFoundCompany"
        :progress="foundingProgress"
        @click="foundCompany"
        theme="secondary"
        firstTimeOnly
      >
        Found a Company
      </ProgressButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ProgressButton from '../ProgressButton.vue';
import { useGameStore } from '../../stores/game';
import { useResourcesStore } from '../../stores/modules/resources';
import { COMPANY_FOUNDING_COST } from '../../stores/modules/phase';

// Whether to use the new ProgressButton component
const useProgressButton = ref(true);

const gameStore = useGameStore();
const resourcesStore = useResourcesStore();

const money = computed(() => resourcesStore.money);
const foundingProgress = computed(() => resourcesStore.companyFoundingProgress);
const canFoundCompany = computed(() => resourcesStore.canFoundCompany);

// Button click animation state
const workButtonClicked = ref(false);

function workForTheMad() {
  gameStore.earnMoney();
  
  // Button click animation - only used for old button style
  if (!useProgressButton.value && !workButtonClicked.value) {
    workButtonClicked.value = true;
    setTimeout(() => {
      workButtonClicked.value = false;
    }, 300);
  }
}

function foundCompany() {
  if (canFoundCompany.value) {
    gameStore.foundCompany();
  }
}
</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

/* Legacy styles for non-ProgressButton version */
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
</style>