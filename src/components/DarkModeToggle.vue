<template>
  <q-toggle
    v-model="darkMode"
    :checked-icon="mdiWeatherNight"
    :unchecked-icon="mdiWhiteBalanceSunny"
    color="secondary"
    size="md"
  />
</template>
<script lang="ts" setup>
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { onUnmounted, Ref, ref, watch } from 'vue';

import { useAppStore } from '@/store';

const $q = useQuasar();
const appStore = useAppStore();
const { appState } = storeToRefs(appStore);

const darkMode: Ref<boolean> = ref(appState.value.darkMode ?? false);
const mediaQuery: MediaQueryList = window.matchMedia(
  '(prefers-color-scheme: dark)'
);

const handleMediaQueryChange = (e: MediaQueryListEvent): void => {
  const preferredDark: boolean = e.matches;
  $q.dark.set(preferredDark);
  darkMode.value = preferredDark;
};
mediaQuery.addEventListener('change', handleMediaQueryChange);

watch(
  darkMode,
  (newValue) => {
    $q.dark.set(newValue);
    appState.value.darkMode = newValue;
  },
  { immediate: true }
);

onUnmounted(() => {
  mediaQuery.removeEventListener('change', handleMediaQueryChange);
});
</script>
<style scoped></style>
