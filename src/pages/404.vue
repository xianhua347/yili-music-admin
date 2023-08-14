<template>
  <q-layout class="column flex-center q-gutter-lg" view="hHr LpR lFf">
    <div class="text-h4 text-uppercase">Ops! page not found</div>
    <div class="text-h5">404</div>
    <div class="q-pa-md q-gutter-sm row justify-around" style="width: 400px">
      <q-btn color="primary" label="回到主页" @click="toIndex()" />
      <q-btn color="black " label="回到上一页" @click="backPage()" />
    </div>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router';

const route = useRouter();
function toIndex() {
  route.push('/');
}
function backPage() {
  route.back();
}
</script>

<style scoped></style>
