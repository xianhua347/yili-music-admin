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
import { onBeforeMount, Ref, ref, UnwrapRef, watch } from 'vue';

import { useAppStore } from '@/store';

const darkMode: Ref<UnwrapRef<boolean>> = ref(false);
const $q = useQuasar();
const appStore = useAppStore();
const { appState } = storeToRefs(appStore);

onBeforeMount(() => {
  darkMode.value = appState.value.darkMode;
});
watch(darkMode, (newValue: boolean) => {
  $q.dark.set(newValue);
  appState.value.darkMode = newValue;
});
</script>
<style scoped></style>
