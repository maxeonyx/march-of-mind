<template>
  <div class="section research-section">
    <h3>Research</h3>
    <ProgressButton
      :enabled="true"
      :progress="0"
      @click="doResearch"
      theme="primary"
      data-testid="btn-research"
    >
      Research
    </ProgressButton>
  </div>
</template>

<script setup lang="ts">
import ProgressButton from '@/components/ProgressButton.vue';

const emit = defineEmits<{
  (e: 'research'): void
}>();

function doResearch() {
  emit('research');
}
</script>

<style scoped>
.research-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>