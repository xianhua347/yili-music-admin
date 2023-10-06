<template>
  <q-toggle
    v-model="buttonValue"
    :checked-icon="mdiWeatherNight"
    :unchecked-icon="mdiWhiteBalanceSunny"
    color="secondary"
    size="md"
    @click="Dark.toggle()"
  />
</template>
<script lang="ts" setup>
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { Dark } from 'quasar';
import { ref, watch } from 'vue';

import { useAppSettingsStore } from '@/store';

const appStore = useAppSettingsStore();
const { appSettingsState } = storeToRefs(appStore);
const buttonValue = ref(Dark.isActive);

watch(
  () => Dark.isActive,
  (newValue) => {
    buttonValue.value = newValue;
    appSettingsState.value.darkMode = newValue;
  }
);
</script>
<style scoped></style>
