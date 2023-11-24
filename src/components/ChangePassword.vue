<!--change password component-->
<template>
  <q-dialog v-model="showDialogRef" class="per" @hide="closeDialog">
    <q-card style="min-width: 300px; max-width: 500px">
      <q-card-section>
        <q-input
          v-model="newPassword"
          label="新密码"
          type="password"
          :rules="[passwordRule]"
          lazy-rules
        >
        </q-input>
        <q-input
          v-model="confirmPassword"
          label="确认新密码"
          type="password"
          :rules="[passwordRule, confirmPasswordRule]"
          lazy-rules
        />
      </q-card-section>
      <q-card-actions align="between">
        <q-btn label="确定" color="primary" @click="changePassword" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { ref, watchEffect } from 'vue';

import { useTokenStore } from '@/store';

const newPassword = ref('');
const confirmPassword = ref('');

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
}>();

const { logout } = useTokenStore();

const showDialogRef = ref(props.modelValue);

watchEffect(() => {
  showDialogRef.value = props.modelValue;
});
const passwordRule = (val: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(val) || '密码必须是数字+大小写长度为8位';
};

const confirmPasswordRule = (val: string) => {
  return val === newPassword.value || '新密码和确认新密码不匹配';
};

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    Notify.create({
      position: 'top',
      message: '新密码和确认新密码不匹配',
      color: 'negative'
    });
  } else {
    closeDialog();
    await logout();
  }
};

const closeDialog = () => {
  showDialogRef.value = false;
  emit('update:modelValue', false);
};
</script>
