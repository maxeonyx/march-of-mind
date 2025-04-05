import { ref, onMounted } from 'vue';
import type { VersionInfo } from '../types';

export function useVersion() {

  // TODO: Refactor to match useResources (one reactive object with methods)
  const version = ref<VersionInfo | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  async function fetchVersion() {
    try {
      loading.value = true;
      error.value = null;
      
      // Use the base URL from the app
      const baseUrl = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${baseUrl}version.json?t=${Date.now()}`); // TODO: remove cache busting - it's confusing if the app version is old but the version is new.
      
      if (!response.ok) {
        throw new Error(`Failed to fetch version info: ${response.status} ${response.statusText}`);
      }
      
      version.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error('Error fetching version:', err);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchVersion();
  });

  return {
    version,
    loading,
    error,
    fetchVersion
  };
}