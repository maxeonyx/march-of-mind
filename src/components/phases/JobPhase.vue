<template>
  <div class="phase-container job-phase">    
    <div class="actions">
      <ProgressButton
        :enabled="true"
        :progress="0"
        @click="workHard"
        theme="primary"
      >
        Work for the Man
      </ProgressButton>
      
      <ProgressButton
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
import { computed } from 'vue';
import ProgressButton from '../ProgressButton.vue';
import { useGameStore } from '../../stores/game';
import { useResourcesStore } from '../../stores/modules/resources';

const gameStore = useGameStore();
const resourcesStore = useResourcesStore();

const foundingProgress = computed(() => resourcesStore.companyFoundingProgress);
const canFoundCompany = computed(() => resourcesStore.canFoundCompany);

function workHard() {
  gameStore.earnMoney();
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
</style>