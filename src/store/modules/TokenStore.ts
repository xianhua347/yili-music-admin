import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { login } from '@/api';
import type { LoginRequest, TokenState } from '@/models';
import { useUserStore } from '@/store';

export const useTokenStore = defineStore(
  'token',
  () => {
    const tokenState = ref<TokenState>({
      accessToken: '',
      refreshToken: ''
    });

    async function loginRequest(loginForm: LoginRequest) {
      const { code, message, data } = await login(loginForm);

      Notify.create({
        type: code !== 200 ? 'negative' : 'positive',
        message: code !== 200 ? message : '登录成功',
        position: 'top'
      });

      if (code === 200) {
        tokenState.value.accessToken = data?.accessToken;
        tokenState.value.refreshToken = data?.refreshToken;
      }
    }

    async function logout() {
      const userStore = useUserStore();
      const router = useRouter();
      tokenState.value.accessToken = '';
      userStore.reset();
      await router.push('/login');
    }

    return {
      tokenState,
      loginRequest,
      logout
    };
  },
  {
    persist: true
  }
);
