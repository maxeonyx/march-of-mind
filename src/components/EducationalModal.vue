<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeIfCancellable">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button v-if="cancellable" class="close-button" @click="emitCancel">×</button>
      </div>
      
      <div class="modal-body">
        <!-- Educational content section -->
        <div class="educational-content">
          <p v-html="content"></p>
        </div>
        
        <!-- Question section -->
        <div v-if="!questionAnswered" class="question-section">
          <h4>{{ question.question }}</h4>
          <div class="answers">
            <button 
              v-for="(answer, index) in question.answers" 
              :key="index"
              class="answer-button"
              :class="{ selected: selectedAnswerIndex === index }"
              @click="selectAnswer(index)"
            >
              {{ answer }}
            </button>
          </div>
          <button 
            class="submit-button" 
            :disabled="selectedAnswerIndex === null"
            @click="submitAnswer"
          >
            Submit Answer
          </button>
        </div>
        
        <!-- Feedback section (after answering) -->
        <div v-if="questionAnswered" class="feedback-section">
          <div class="feedback" :class="{ correct: isCorrect, incorrect: !isCorrect }">
            <h4>{{ isCorrect ? 'Correct!' : 'Incorrect' }}</h4>
            <p>{{ question.explanation }}</p>
          </div>
          
          <button 
            v-if="isCorrect" 
            class="continue-button"
            @click="emitSuccess"
          >
            Continue
          </button>
          
          <button 
            v-if="!isCorrect" 
            class="try-again-button"
            @click="resetQuestion"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { EducationalQuestion } from '@/types';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  question: {
    type: Object as () => EducationalQuestion,
    required: true
  },
  cancellable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['success', 'cancel']);

// State
const selectedAnswerIndex = ref<number | null>(null);
const questionAnswered = ref(false);
const isCorrect = ref(false);

// Methods
function selectAnswer(index: number) {
  selectedAnswerIndex.value = index;
}

function submitAnswer() {
  if (selectedAnswerIndex.value === null) return;
  
  questionAnswered.value = true;
  isCorrect.value = selectedAnswerIndex.value === props.question.correctAnswerIndex;
}

function resetQuestion() {
  selectedAnswerIndex.value = null;
  questionAnswered.value = false;
  isCorrect.value = false;
}

function emitSuccess() {
  emit('success');
  resetQuestion();
}

function emitCancel() {
  emit('cancel');
  resetQuestion();
}

function closeIfCancellable() {
  if (props.cancellable) {
    emitCancel();
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--muted-text);
}

.modal-body {
  padding: 20px;
}

.educational-content {
  margin-bottom: 20px;
  line-height: 1.6;
}

.question-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color);
}

.answers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.answer-button {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  text-align: left;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.answer-button:hover {
  background-color: #f5f5f5;
}

.answer-button.selected {
  border-color: var(--primary-color);
  background-color: rgba(66, 185, 131, 0.1);
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-section {
  margin-top: 20px;
}

.feedback {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.feedback.correct {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid var(--success-color);
}

.feedback.incorrect {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--error-color);
}

.continue-button {
  width: 100%;
  padding: 12px;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.try-again-button {
  width: 100%;
  padding: 12px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>