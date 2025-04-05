<template>
  <div class="date-display">
    <h3>{{ formattedDate }}</h3>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimeStore } from '../stores/modules/time';

const timeStore = useTimeStore();
const formattedDate = computed(() => timeStore.formattedDate);
</script>

<style scoped>
.date-display {
  text-align: center;
  margin: 10px 0 20px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.date-display h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}
</style>