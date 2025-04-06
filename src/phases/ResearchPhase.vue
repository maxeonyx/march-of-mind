<template>
  <div class="phase-container research-phase">
    <div class="actions">
      <ProgressButton
        :enabled="true"
        :progress="0"
        @click="doResearch"
        theme="primary"
        data-testid="btn-research"
      >
        Research
      </ProgressButton>

      <ProgressButton
        :enabled="canFoundLab"
        :progress="labFoundingProgress"
        @click="foundLab"
        theme="secondary"
        firstTimeOnly
        data-testid="btn-found-lab"
      >
        Found a Lab
      </ProgressButton>
    </div>

    <!-- Educational modal for first discovery -->
    <EducationalModal
      :visible="showEducationalModal"
      :title="firstDiscovery.name"
      :content="firstDiscovery.description"
      :question="firstDiscovery.educationalContent"
      :cancellable="false"
      @success="completeFirstDiscovery"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ProgressButton from '@/components/ProgressButton.vue';
import EducationalModal from '@/components/EducationalModal.vue';
import { useGameStore } from '@/store';
import { GamePhase } from '@/types/game-phase';
import type { Discovery, EducationalQuestion } from '@/types';

const gameStore = useGameStore();
const resources = gameStore.resources;

// Lab founding cost in insights
const LAB_FOUNDING_COST = 10;

// First discovery - Mark I Perceptron
const firstDiscovery: Discovery = {
  id: 'perceptron',
  name: 'Mark I Perceptron',
  year: 1957,
  description: `
    <p>The Perceptron was one of the earliest artificial neural networks, invented in 1957 by Frank Rosenblatt at the Cornell Aeronautical Laboratory.</p>
    <p>It was designed to model the way a human neuron works and was initially implemented as a machine rather than a program. The Mark I Perceptron was built for image recognition tasks.</p>
    <p>This groundbreaking device could learn to distinguish simple patterns and represented the first implementation of a machine that could modify its own synaptic weights - essentially, a machine that could learn.</p>
  `,
  insightCost: LAB_FOUNDING_COST,
  insightBoost: 1.2,
  prerequisites: [],
  educationalContent: {
    question: "What was revolutionary about the Perceptron?",
    answers: [
      "It could perform calculations faster than humans",
      "It could display images in color",
      "It could learn and modify its own weights",
      "It was the first computer to use transistors"
    ],
    correctAnswerIndex: 2,
    explanation: "The Perceptron was groundbreaking because it could learn from examples and modify its own synaptic weights, making it the first machine learning device that could adapt through experience."
  }
};

// State
const showEducationalModal = ref(false);

/**
 * Calculate progress toward founding a lab (0-1)
 */
const labFoundingProgress = computed(() => {
  return Math.min(resources.insights / LAB_FOUNDING_COST, 1);
});

/**
 * Check if player can found a lab
 */
const canFoundLab = computed(() => {
  return resources.insights >= LAB_FOUNDING_COST;
});

function doResearch() {
  resources.addInsights(1);
}

function foundLab() {
  if (canFoundLab.value) {
    // Show the educational modal instead of immediately founding lab
    showEducationalModal.value = true;
  }
}

function completeFirstDiscovery() {
  // Hide the modal
  showEducationalModal.value = false;

  // Spend the insights
  gameStore.resources.spendInsights(LAB_FOUNDING_COST);

  // Enter the lab phase
  gameStore.enterPhase(GamePhase.LAB_PHASE);
}
</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

.research-phase {
  text-align: center;
}
</style>
