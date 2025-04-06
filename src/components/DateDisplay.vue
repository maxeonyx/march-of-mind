<template>
  <div class="date-display">
    <span>{{ gameStore.time.formattedDate }}</span>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/store';

const gameStore = useGameStore();
</script>

<style scoped>
.date-display {
  display: inline-block;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-weight: bold;
  color: var(--text-color);
  font-size: 16px;
}
</style>
