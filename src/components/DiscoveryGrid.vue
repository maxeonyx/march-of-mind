<template>
  <div class="discovery-grid">
    <h4>Available Discoveries</h4>
    <div class="available-discoveries">
      <TechCard
        v-for="id in techTreeStore.availableDiscoveries"
        :key="id"
        :id="id"
        :isLocked="techTreeStore.isLocked(id)"
        :progress="techTreeStore.getProgress(id)"
        :isSelected="id === techTreeStore.currentlySelectedDiscovery"
      />
      <div v-if="techTreeStore.availableDiscoveries.length === 0" class="empty-message">
        No discoveries available yet
      </div>
    </div>
    
    <h4>Completed Discoveries</h4>
    <div class="completed-discoveries">
      <div 
        v-for="id in techTreeStore.completedDiscoveries" 
        :key="id"
        class="completed-item"
      >
        {{ findTechById(id)?.name || 'Unknown' }}
      </div>
      <div v-if="techTreeStore.completedDiscoveries.length === 0" class="empty-message">
        No completed discoveries yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTechTreeStore } from '../stores/techTree';
import { findTechById } from '../stores/staticData';
import TechCard from './TechCard.vue';

const techTreeStore = useTechTreeStore();
</script>

<style scoped>
.discovery-grid {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

h4 {
  margin: 0.5rem 0;
  color: #42b983;
}

.empty-message {
  font-style: italic;
  color: #999;
  padding: 1rem 0;
}

.completed-item {
  background-color: #f0f8ff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
</style>
