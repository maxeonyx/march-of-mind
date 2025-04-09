<template>
  <div v-if="uiStore.isPopupVisible" class="info-popup-container">
    <div class="info-popup-overlay"></div>
    <div class="info-popup">
      <h2 v-if="uiStore.popupTitle">{{ uiStore.popupTitle }}</h2>
      <p v-if="uiStore.popupMessage">{{ uiStore.popupMessage }}</p>
      <button @click="closePopup">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();

function closePopup() {
  uiStore.hidePopup();
}
</script>

<style scoped>
.info-popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000; /* Ensure it's above other content but below potential debug overlays */
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.info-popup {
  position: relative; /* To be above overlay */
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  width: 450px;
  z-index: 1001;
  text-align: center;
}

h2 {
  margin-top: 0;
  color: var(--primary-color, #42b983);
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1.5rem;
  color: var(--text-color, #2c3e50);
  line-height: 1.6;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: var(--primary-color, #42b983);
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: var(--primary-hover, #3aa876);
}
</style>