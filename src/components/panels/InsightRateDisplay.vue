<template>
  <div class="insight-rate">
    <div class="insight-multiplier">{{ rate }}x</div>
    <div class="insight-label">insight</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rate: number;
}>();
</script>

<style scoped>
.insight-rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 5px 15px;
  border: 1px solid var(--border-color);
}

.insight-multiplier {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.insight-label {
  font-size: 0.8rem;
  color: var(--muted-text);
}
</style>