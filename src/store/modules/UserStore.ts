import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';

import { getCurrentUser } from '@/api';

export const useUserStore = defineStore(
  'user',
  () => {
    const currentUser = <Ref<any | null>>ref(null);
    const fetchCurrentUser = async () => {
      currentUser.value = await getCurrentUser();
    };
    const reset = () => {
      currentUser.value = null;
    };

    return {
      currentUser,
      fetchCurrentUser,
      reset
    };
  },
  {
    persist: true
  }
);
