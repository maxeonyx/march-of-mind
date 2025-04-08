<template>
  <div v-if="isVisible" class="quiz-modal-container">
    <div class="quiz-modal-overlay"></div>
    <div class="quiz-modal">
      <h2>Technology Quiz</h2>
      
      <div v-if="quizData" class="quiz-content">
        <div class="quiz-tech-name">{{ techName }}</div>
        <div class="quiz-question">{{ quizData.question }}</div>
        
        <div class="quiz-options">
          <button 
            v-for="(option, index) in quizData.options" 
            :key="index"
            :class="{ 'incorrect': lastIncorrectIndex === index }"
            :disabled="areAnswersDisabled"
            @click="checkAnswer(index)"
          >
            {{ option }}
          </button>
        </div>
        
        <div v-if="countdown > 0" class="quiz-countdown">
          Continuing in {{ countdown }}...
        </div>
        
        <button class="quiz-cancel-btn" @click="cancelQuiz">
          Cancel
        </button>
      </div>
      
      <div v-else class="quiz-error">
        Quiz data not found for this technology.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUiStore } from '../stores/ui';
import { useTechTreeStore } from '../stores/techTree';
import { findTechById } from '../stores/staticData';

// Stores
const uiStore = useUiStore();
const techTreeStore = useTechTreeStore();

// Component state
const areAnswersDisabled = ref(false);
const countdown = ref(0);
const countdownInterval = ref<number | null>(null);
const lastIncorrectIndex = ref<number | null>(null);

// Computed properties
const isVisible = computed(() => uiStore.isQuizModalVisible);
const techId = computed(() => uiStore.quizTechId);

const techName = computed(() => {
  const tech = techId.value ? findTechById(techId.value) : null;
  return tech?.name || 'Unknown Technology';
});

const quizData = computed(() => {
  if (!techId.value) return null;
  
  const tech = findTechById(techId.value);
  if (!tech || !tech.quiz) return null;
  
  return tech.quiz;
});

// Methods
function checkAnswer(selectedIndex: number) {
  if (areAnswersDisabled.value || !quizData.value) return;
  
  const correctIndex = quizData.value.correctOptionIndex;
  
  if (selectedIndex === correctIndex) {
    // Correct answer, proceed immediately
    if (techId.value) {
      techTreeStore.unlock(techId.value);
      
      // Determine tech type and select it
      const tech = findTechById(techId.value);
      if (tech?.type === 'product') {
        techTreeStore.selectProduct(techId.value);
      } else if (tech?.type === 'discovery') {
        techTreeStore.selectDiscovery(techId.value);
      }
      
      // Hide the modal
      uiStore.hideQuizModal();
    }
  } else {
    // Incorrect answer - show brief feedback and 5 second wait
    lastIncorrectIndex.value = selectedIndex;
    areAnswersDisabled.value = true;
    countdown.value = 5;

    // Clear any existing interval
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
    }

    // Start the countdown
    countdownInterval.value = setInterval(() => {
      countdown.value--;

      if (countdown.value <= 0) {
        // Clear the interval
        if (countdownInterval.value) {
          clearInterval(countdownInterval.value);
          countdownInterval.value = null;
        }

        // Re-enable answers after countdown
        areAnswersDisabled.value = false;
        lastIncorrectIndex.value = null;
      }
    }, 1000);

    // Reset the feedback after a short delay
    setTimeout(() => {
      lastIncorrectIndex.value = null;
    }, 500);
  }
}

function cancelQuiz() {
  // Clear any running interval
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }
  
  // Hide the modal
  uiStore.hideQuizModal();
}

// Reset component state when modal is hidden
watch(isVisible, (newValue) => {
  if (!newValue) {
    areAnswersDisabled.value = false;
    countdown.value = 0;
    lastIncorrectIndex.value = null;
    
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
      countdownInterval.value = null;
    }
  }
});
</script>

<style scoped>
.quiz-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000; /* Ensure it's above everything else */
}

.quiz-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.quiz-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  width: 500px;
  z-index: 1001;
}

h2 {
  margin-top: 0;
  color: var(--primary-color, #42b983);
  text-align: center;
}

.quiz-tech-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.quiz-question {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.quiz-options button {
  text-align: left;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #ddd);
  background-color: #f5f5f5;
  color: var(--text-color, #333);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.quiz-options button:hover:not(:disabled) {
  background-color: #e9e9e9;
}

.quiz-options button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz-options button.incorrect {
  background-color: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.2);
}

.quiz-countdown {
  text-align: center;
  margin: 1rem 0;
  font-weight: bold;
  color: var(--primary-color, #42b983);
}

.quiz-cancel-btn {
  margin-top: 1rem;
  background-color: transparent;
  border: 1px solid var(--border-color, #ddd);
  color: var(--text-color, #333);
  width: 100%;
}

.quiz-cancel-btn:hover {
  background-color: #f5f5f5;
}

.quiz-error {
  text-align: center;
  color: var(--error-color, #e53935);
  padding: 1rem;
}
</style>
