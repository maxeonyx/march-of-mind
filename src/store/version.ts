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
        
        // Default version in case fetch fails
        const defaultVersion: VersionInfo = {
          version: '0.1.0-dev',
          name: 'Development Build',
          buildTime: new Date().toISOString()
        };
        
        try {
          // Use the base URL from the app
          const baseUrl = import.meta.env.BASE_URL || '/';
          // Add cache busting parameter
          const response = await fetch(`${baseUrl}version.json?_=${Date.now()}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch version info: ${response.status} ${response.statusText}`);
          }
          
          // Check content type to ensure it's JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
          }
          
          versionState.value = await response.json();
        } catch (err) {
          console.warn('Could not load version.json, using default version info');
          // Use default version on any fetch or parsing error
          versionState.value = defaultVersion;
        }
      } catch (err) {
        versionState.error = err instanceof Error ? err : new Error(String(err));
        console.error('Error in version handling:', err);
        
        // Set default version even on outer error
        versionState.value = {
          version: '0.1.0-dev',
          name: 'Development Build',
          buildTime: new Date().toISOString()
        };
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
