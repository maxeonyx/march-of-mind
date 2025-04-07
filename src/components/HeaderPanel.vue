<template>
  <div class="header-panel">
    <h1>March of Mind</h1>
    <div class="date">{{ timeStore.displayDate }}</div>
  </div>
</template>

<script setup lang="ts">
import { useTimeStore } from '../stores/time';

const timeStore = useTimeStore();
</script>

<style scoped>
.header-panel {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  color: #42b983;
}

.date {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>