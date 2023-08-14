<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> 原力音乐 </q-toolbar-title>
        <dark-mode-toggle />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" bordered>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import DarkModeToggle from '@/components/DarkModeToggle.vue';

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = (): void => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
<style scoped></style>
