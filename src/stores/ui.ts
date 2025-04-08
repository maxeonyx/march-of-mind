import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useTimeStore } from './time';

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const isQuizModalVisible = ref(false);
  const quizTechId = ref<string | null>(null);

  // --- Actions ---
  function showQuizModal(techId: string) {
    const timeStore = useTimeStore();
    quizTechId.value = techId;
    isQuizModalVisible.value = true;
    timeStore.pauseManually();
    console.log(`Showing quiz modal for tech ${techId}`);
  }

  function hideQuizModal() {
    const timeStore = useTimeStore();
    isQuizModalVisible.value = false;
    quizTechId.value = null;
    timeStore.resumeManually();
    console.log('Quiz modal hidden, game resumed');
  }

  return {
    // State
    isQuizModalVisible,
    quizTechId,
    // Actions
    showQuizModal,
    hideQuizModal,
  };
});