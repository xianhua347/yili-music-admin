<template>
  <q-layout class="column flex-center" view="hHr LpR lFf">
    <q-card class="my-card">
      <div class="title text-center text-h6">猿立音乐后台</div>
      <q-form class="q-gutter-md q-pa-md" @submit="onSubmit(loginForm)">
        <q-input
          v-model="loginForm.username"
          :rules="[(val) => (val && val.length > 0) || '请输入用户名']"
          filled
          label="用户名："
          lazy-rules
          type="text"
        />
        <q-input
          v-model="loginForm.password"
          :rules="[(val) => (val && val.length > 0) || '请输入密码']"
          filled
          label="密码："
          lazy-rules
          type="password"
        />
        <div>
          <q-btn
            class="full-width"
            color="primary"
            label="登录"
            type="submit"
          />
        </div>
      </q-form>
    </q-card>
  </q-layout>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type { LoginRequest } from '@/models/ApiModel';
import { useAppStore } from '@/store';

const loginForm = ref<LoginRequest>({
  username: '',
  password: ''
});

const appStore = useAppStore();
const { appState } = storeToRefs(appStore);
const router = useRouter();
console.log(appState.value.token);
const onSubmit = async (loginFrom: LoginRequest) => {
  await appStore.loginRequest(loginFrom);
  await router.push('/index');
};
</script>
<style lang="sass" scoped>
.my-card
  min-width: 25rem

.title
  padding-top: 1rem
</style>
