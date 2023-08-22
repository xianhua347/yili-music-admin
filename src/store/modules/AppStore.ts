import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { ref } from 'vue';

import { login } from '@/api/user.ts';
import type { LoginRequest } from '@/models/ApiModel.ts';
import type { AppState } from '@/models/AppModel.ts';
import { useUserStore } from '@/store';

export const useAppStore = defineStore(
  'app',
  () => {
    const appState = ref<AppState>({
      token: '',
      darkMode: null
    });

    async function loginRequest(loginForm: LoginRequest) {
      const { code, message, data } = await login(loginForm);

      Notify.create({
        type: code !== 200 ? 'negative' : 'positive',
        message: code !== 200 ? message : '登录成功',
        position: 'top'
      });

      if (code === 200) {
        appState.value.token = data;
      }
    }

    function logout() {
      const userStore = useUserStore();
      appState.value.token = '';
      userStore.reset();
    }

    return {
      appState,
      loginRequest,
      logout
    };
  },
  {
    persist: true
  }
);
