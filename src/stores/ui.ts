import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useTimeStore } from './time';

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const isQuizModalVisible = ref(false);
  const quizTechId = ref<string | null>(null);

  // New state for generic popups
  const isPopupVisible = ref(false);
  const popupTitle = ref<string | null>(null);
  const popupMessage = ref<string | null>(null);

  // --- Actions ---

  // Quiz Modal Actions (Updated for Pause/Resume)
  function showQuizModal(techId: string) {
    const timeStore = useTimeStore();
    quizTechId.value = techId;
    isQuizModalVisible.value = true;
    timeStore.pauseGame(); // PAUSE game for quiz
    console.log(`Showing quiz modal for tech ${techId}, game paused.`);
  }

  function hideQuizModal() {
    const timeStore = useTimeStore();
    isQuizModalVisible.value = false;
    quizTechId.value = null;
    timeStore.resumeGame(); // RESUME game after quiz
    console.log('Quiz modal hidden, game resumed.');
  }

  // Generic Informational Popup Actions
  function showPopup(title: string, message: string) {
    const timeStore = useTimeStore();
    popupTitle.value = title;
    popupMessage.value = message;
    isPopupVisible.value = true;
    timeStore.pauseGame(); // PAUSE game for info popup
    console.log(`Showing popup "${title}", game paused.`);
  }

  function hidePopup() {
    const timeStore = useTimeStore();
    isPopupVisible.value = false;
    popupTitle.value = null;
    popupMessage.value = null;
    timeStore.resumeGame(); // RESUME game after info popup
    console.log('Popup hidden, game resumed.');
  }

  // Update global exposure for tests
  if (typeof window !== 'undefined') {
    if (window.__uiStore) {
      window.__uiStore.isPopupVisible = isPopupVisible.value; // Expose value
      window.__uiStore.popupTitle = popupTitle.value;
      window.__uiStore.popupMessage = popupMessage.value;
      window.__uiStore.showPopup = showPopup;
      window.__uiStore.hidePopup = hidePopup;
    }
    // Watch changes to update global state
    watch(isPopupVisible, (newValue) => {
      if (window.__uiStore) window.__uiStore.isPopupVisible = newValue;
    });
    watch(popupTitle, (newValue) => {
      if (window.__uiStore) window.__uiStore.popupTitle = newValue;
    });
    watch(popupMessage, (newValue) => {
      if (window.__uiStore) window.__uiStore.popupMessage = newValue;
    });
  }

  return {
    // State
    isQuizModalVisible,
    quizTechId,
    isPopupVisible,
    popupTitle,
    popupMessage,
    // Actions
    showQuizModal,
    hideQuizModal,
    showPopup,
    hidePopup,
  };
});