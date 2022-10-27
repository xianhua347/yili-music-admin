<template>
  <q-layout view="hHr LpR lFf" class="column flex-center">
    <q-card class="my-card">
      <div class="title text-center text-h6">猿立音乐后台</div>
      <q-form class="q-gutter-md q-pa-md">
        <q-input
          filled
          type="text"
          v-model="username"
          label="用户名："
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || '请输入用户名']"
        />

        <q-input
          filled
          v-model="password"
          type="password"
          label="密码："
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || '请输入密码']"
        />

        <q-toggle v-model="accept" ref='test' label="记住我" />

        <div>
          <q-btn
            class="full-width"
            label="登录"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
const accept = ref(true);
const username = ref(null);
const password = ref(null);
</script>

<script>
export default {
  name: 'Login'
};
</script>
<style lang="sass">
.my-card
    min-width: 25rem
.title
    padding-top: 1rem
</style>
