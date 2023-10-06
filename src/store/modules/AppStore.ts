import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { AppSettingsState } from '@/models';

export const useAppSettingsStore = defineStore(
  'app',
  () => {
    const appSettingsState = ref<AppSettingsState>({
      darkMode: 'auto'
    });

    return {
      appSettingsState
    };
  },
  {
    persist: true
  }
);
