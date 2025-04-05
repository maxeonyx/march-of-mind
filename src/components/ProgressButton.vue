<template>
  <button 
    :class="[
      'progress-button',
      { 
        'button-enabled': enabled && !firstTimeOnly, 
        'button-disabled': !enabled,
        'first-time': firstTimeOnly && !unlocked,
        'unlocked': unlocked
      }
    ]"
    :disabled="!enabled"
    @click="handleClick"
  >
    <div 
      class="progress-fill" 
      :style="{ 
        width: `${progress * 100}%`,
        opacity: firstTimeOnly && !enabled ? 0.7 : 1
      }"
    ></div>
    <span class="button-content">
      <slot></slot>
      <!-- FIXME: Animation disabled due to click issues -->
      <span class="button-effect" v-if="clicked"></span> 
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  // Button state
  enabled: {
    type: Boolean,
    default: true
  },
  // Progress value (0-1)
  progress: {
    type: Number,
    default: 0
  },
  // Whether this is a one-time unlock button
  firstTimeOnly: {
    type: Boolean,
    default: false
  },
  // Whether this button has been unlocked (for first-time buttons)
  unlocked: {
    type: Boolean,
    default: false
  },
  // Button color theme (primary, secondary, danger, etc.)
  theme: {
    type: String,
    default: 'primary'
  }
});

const emit = defineEmits(['click']);

// Animation state
const clicked = ref(false);

function handleClick() {
  if (!props.enabled) return;
  
  emit('click');
  
  // Button click animation
  if (!clicked.value) {
    clicked.value = true;
    setTimeout(() => {
      clicked.value = false;
    }, 300);
  }
}
</script>

<style>
.progress-button {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  min-width: 200px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: var(--secondary-color);
}

.progress-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.progress-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-button.button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--disabled-color);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease-out;
  z-index: 1;
}

.button-content {
  position: relative;
  z-index: 2;
  color: white;
  display: block;
  width: 100%;
}

/* First-time button styles */
.progress-button.first-time {
  background-color: var(--disabled-color);
}

.progress-button.first-time .progress-fill {
  background-color: var(--secondary-color);
  opacity: 0.7;
}

.progress-button.unlocked .progress-fill {
  background-color: var(--primary-color);
  width: 100%;
}

/* Button effect animation */
.button-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: scale(1);
  animation: ripple 0.3s linear;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(40);
    opacity: 0;
  }
}
</style>