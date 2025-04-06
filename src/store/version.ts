import { reactive, onMounted } from 'vue';
import type { VersionInfo } from '@/types';

export function useVersion() {
  const versionState = reactive({
    value: null as VersionInfo | null,
    loading: true,
    error: null as Error | null,

    async fetchVersion() {
      try {
        versionState.loading = true;
        versionState.error = null;
        
        // Use the base URL from the app
        const baseUrl = import.meta.env.BASE_URL || '/';
        // Removed cache busting query parameter
        const response = await fetch(`${baseUrl}version.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch version info: ${response.status} ${response.statusText}`);
        }
        
        versionState.value = await response.json();
      } catch (err) {
        versionState.error = err instanceof Error ? err : new Error(String(err));
        console.error('Error fetching version:', err);
      } finally {
        versionState.loading = false;
      }
    }
  });

  onMounted(() => {
    versionState.fetchVersion();
  });

  return versionState;
}