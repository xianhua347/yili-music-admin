import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';

import { getCurrentUser } from '@/api';
import type { User } from '@/models';

export const useUserStore = defineStore(
  'user',
  () => {
    const currentUser = <Ref<User | null>>ref(null);
    const fetchCurrentUser = async () => {
      currentUser.value = (await getCurrentUser()).data;
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
