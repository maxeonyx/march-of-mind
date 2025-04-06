<template>
  <div class="phase-container research-phase">
    <!-- Main game layout: two-column grid -->
    <div class="main-layout">
      <!-- Left column for Resource Display and Research/Lab sections -->
      <div class="left-column">
        <!-- Resource display -->
        <ResourceDisplay 
          :showIncomeStats="false" 
          :showResearchStats="true"
          :showHardwareStats="false"
        />
        
        <div class="section research-section">
          <h3>Research</h3>
          <div class="research-description">
            <p>Generate insights through independent research.</p>
            <p>Accumulate insights to found your own AI research lab.</p>
          </div>
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
        
        <div class="section lab-section">
          <h3>AI Lab</h3>
          <div class="lab-description">
            <p>Found your own AI research lab when you have {{ LAB_FOUNDING_COST }} insights.</p>
            <p>Current progress: {{ Math.round(labFoundingProgress * 100) }}%</p>
          </div>
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
      </div>
      
      <!-- Right column for future content -->
      <div class="right-column">
        <div class="section info-section">
          <h3>AI Research Journey</h3>
          <div class="info-content">
            <p>Welcome to the beginning of your AI research journey!</p>
            <p>In this phase, you'll generate insights through independent research.</p>
            <p>Once you've accumulated enough insights, you can found your own AI research lab.</p>
            <p>This will unlock new capabilities and allow you to make significant progress in the field of AI.</p>
            <div class="journey-steps">
              <div class="journey-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Independent Research</h4>
                  <p>Generate insights by clicking the Research button.</p>
                </div>
              </div>
              <div class="journey-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Found a Lab</h4>
                  <p>Accumulate {{ LAB_FOUNDING_COST }} insights to establish your research lab.</p>
                </div>
              </div>
              <div class="journey-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Expand Your Research</h4>
                  <p>Hire researchers, upgrade hardware, and develop AI products.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import ResourceDisplay from '@/components/ResourceDisplay.vue';
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
.research-phase {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

/* Two-column layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Equal width columns */
  gap: 20px;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.section h3 {
  margin-top: 0;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.research-description,
.lab-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

/* Info section styling */
.info-section {
  height: 100%;
  text-align: left;
}

.info-content {
  font-size: 14px;
  color: #444;
}

.journey-steps {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.journey-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.step-number {
  background-color: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 5px 0;
  color: var(--text-color);
}

.step-content p {
  margin: 0;
}

@media (max-width: 992px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .research-phase {
    flex-direction: column;
  }
}
</style>
