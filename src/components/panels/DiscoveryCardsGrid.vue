<template>
  <div class="section discoveries-section">
    <h3>Discoveries</h3>
    <div class="cards-grid discoveries-grid">
      <!-- Available discoveries -->
      <div v-for="(discovery, index) in availableDiscoveries" :key="index" class="card discovery-card available">
        <div class="card-status">
          <span class="status-text">quiz not done yet</span>
        </div>
      </div>
      
      <!-- Unlocked discoveries -->
      <div v-for="(discovery, index) in unlockedDiscoveries" :key="index" class="card discovery-card unlocked">
        <span class="status-text">unlocked</span>
      </div>
      
      <!-- Active discoveries -->
      <div v-for="(discovery, index) in activeDiscoveries" :key="index" class="card discovery-card active">
        <span class="status-text">active</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  // Using any for now since discovery type isn't fully defined yet
  availableDiscoveries: any[];
  unlockedDiscoveries: any[];
  activeDiscoveries: any[];
}>();
</script>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding: 5px;
}

/* Card Styling */
.card {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.card-status {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 5px;
  border-radius: 0 6px 0 6px;
  font-size: 0.7rem;
}

/* Card states */
.card.available {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
}

.card.unlocked {
  background-color: #f0f8ff;
  border: 1px solid var(--primary-color);
}

.card.active {
  background-color: #e8f5e9;
  border: 1px solid var(--positive-color);
}

.status-text {
  color: var(--muted-text);
  font-size: 0.7rem;
  padding: 5px;
}
</style>