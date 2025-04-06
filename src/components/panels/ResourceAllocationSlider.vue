<template>
  <div class="resource-allocation">
    <div class="allocation-label-container left">
      <div class="allocation-label">{{ leftLabel }}</div>
      <div class="allocation-value">{{ leftValue }}x</div>
    </div>
    <input 
      type="range" 
      min="0" 
      max="1" 
      step="0.1" 
      :value="modelValue"
      @input="updateValue($event)"
      class="allocation-slider"
      data-testid="resource-allocation-slider"
    />
    <div class="allocation-label-container right">
      <div class="allocation-label">{{ rightLabel }}</div>
      <div class="allocation-value">{{ rightValue }}x</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  leftLabel?: string;
  rightLabel?: string;
  leftValue: number;
  rightValue: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

// Default props
const leftLabel = computed(() => props.leftLabel || 'Product Development');
const rightLabel = computed(() => props.rightLabel || 'Pure Research');

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
}
</script>

<style scoped>
.resource-allocation {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.allocation-label-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.allocation-label {
  font-size: 0.8rem;
  color: var(--text-color);
  margin-bottom: 5px;
}

.allocation-value {
  font-size: 1rem;
  font-weight: bold;
  color: var(--primary-color);
}

.allocation-label-container.left .allocation-value {
  color: var(--secondary-color);
}

.allocation-label-container.right .allocation-value {
  color: var(--primary-color);
}

.allocation-slider {
  flex-grow: 1;
  margin: 0 15px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .resource-allocation {
    flex-direction: column;
  }
  
  .allocation-slider {
    width: 100%;
  }
}
</style>