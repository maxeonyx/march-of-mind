<template>
  <div class="phase-container job-phase">
    <div class="actions">
      <ProgressButton
        :enabled="true"
        :progress="0"
        @click="workHard"
        theme="primary"
        data-testid="btn-work"
      >
        Work Hard
      </ProgressButton>

      <ProgressButton
        :enabled="canFoundCompany"
        :progress="companyFoundingProgress"
        @click="foundCompany"
        theme="secondary"
        firstTimeOnly
        data-testid="btn-found-company"
      >
        Found a Company
      </ProgressButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressButton from '@/components/ProgressButton.vue';
import { useGameStore } from '@/store';
import { GamePhase } from '@/types'

const gameStore = useGameStore();
const resources = gameStore.resources;

// Company founding cost
const COMPANY_FOUNDING_COST = 10;

/**
 * Calculate progress toward founding a company (0-1)
 */
const companyFoundingProgress = computed(() => {
  return Math.min(resources.money / COMPANY_FOUNDING_COST, 1);
});

/**
 * Check if player can found a company
 */
const canFoundCompany = computed(() => {
  return resources.money >= COMPANY_FOUNDING_COST;
});

function workHard() {
  resources.addMoney(1);
}

function foundCompany() {
  if (canFoundCompany.value) {
    gameStore.resources.spendMoney(COMPANY_FOUNDING_COST);
    gameStore.enterPhase(GamePhase.COMPANY);
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
</style>
