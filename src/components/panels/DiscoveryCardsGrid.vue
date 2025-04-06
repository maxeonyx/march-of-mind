<template>
  <div class="section cards-section">
    <h3>{{ title }}</h3>
    <div class="cards-grid">
      <!-- Region for Available cards -->
      <div class="card-region">
        <div class="region-label">Available</div>
        <div v-for="card in availableCards" :key="card.id" class="card available"
             @click="selectCard(card.id)">
          <div class="card-title">{{ card.name }}</div>
          <div class="card-description" v-if="showDescription">{{ card.description }}</div>
        </div>
      </div>

      <!-- Region for Unlocked cards -->
      <div class="card-region">
        <div class="region-label">Unlocked</div>
        <div v-for="card in unlockedCards" :key="card.id" class="card unlocked"
             @click="selectCard(card.id)">
          <div class="card-title">{{ card.name }}</div>
          <div class="card-description" v-if="showDescription">{{ card.description }}</div>
          <div class="card-revenue" v-if="card.revenue">${{ card.revenue }}/mo</div>
        </div>
      </div>

      <!-- Region for Active/Developed cards -->
      <div class="card-region">
        <div class="region-label">{{ activeRegionLabel }}</div>
        <div v-for="card in activeCards" :key="card.id" class="card active"
             @click="showDetails(card.id)">
          <div class="card-title">{{ card.name }}</div>
          <div class="card-description" v-if="showDescription">{{ card.description }}</div>
          <div class="card-revenue" v-if="card.revenue">${{ card.revenue }}/mo</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Card {
  id: string;
  name: string;
  description?: string;
  revenue?: number;
  // Add other properties as needed
}

const props = defineProps<{
  // Title for the card grid
  title: string;
  
  // Cards for each region
  availableCards: Card[];
  unlockedCards: Card[];
  activeCards: Card[];
  
  // Optional props
  activeRegionLabel?: string;
  showDescription?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selectCard', id: string): void;
  (e: 'showDetails', id: string): void;
}>();

// Provide default values for optional props
const activeRegionLabel = props.activeRegionLabel || 'Active';

function selectCard(id: string) {
  emit('selectCard', id);
}

function showDetails(id: string) {
  emit('showDetails', id);
}
</script>

<style scoped>
.cards-section {
  display: flex;
  flex-direction: column;
  height: 900px; /* Triple the height */
  margin-bottom: 15px;
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  padding: 5px;
  flex: 1; /* Allow it to grow */
  height: 100%; /* Take full height */
}

.card-region {
  position: relative;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 20px 10px 10px 10px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Add scrolling to individual regions */
  height: auto; /* Only as tall as needed */
}

.region-label {
  position: absolute;
  top: 0;
  left: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Card Styling */
.card {
  background-color: white;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  margin-bottom: 8px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.card-description {
  display: none; /* Hide by default */
  font-size: 0.8rem;
  color: var(--text-color);
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3; /* Limit to 3 lines */
  -webkit-box-orient: vertical;
}

/* Show description on hover */
.card:hover .card-description {
  display: -webkit-box;
}

.card-revenue {
  color: var(--positive-color);
  font-weight: bold;
  font-size: 0.9rem;
}

/* Card states */
.card.available {
  border-left: 3px solid #ddd;
}

.card.unlocked {
  border-left: 3px solid var(--primary-color);
}

.card.active {
  border-left: 3px solid var(--positive-color);
}

/* Empty state */
.card-region:empty::after {
  content: "None";
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  color: var(--muted-text);
  font-style: italic;
  font-size: 0.8rem;
}
</style>
