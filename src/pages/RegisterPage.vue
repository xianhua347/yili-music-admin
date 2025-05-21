<template>
  <q-page padding class="flex flex-center">
    <q-card style="min-width: 350px; max-width: 500px;">
      <q-card-section>
        <div class="text-h6 q-mb-md text-center">Register New User</div>
      </q-card-section>

      <q-card-section>
        <UserForm
          :user="initialNewUser"
          :is-edit-mode="false"
          @submit="handleRegistration"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/store/modules/UserStore';
import UserForm from '@/components/UserForm.vue';
import type { UserCreateDTO } from '@/models/UserModels';

const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

// UserForm expects a Partial<UserVO & UserCreateDTO & UserUpdateDTO> | null
// For new user registration, we provide the fields relevant to UserCreateDTO.
// UserForm's internal `initialFormData` will provide defaults for other fields if needed.
const initialNewUser = ref<Partial<UserCreateDTO>>({
  username: '',
  password: '',
  nickname: '',
  gender: 'UNKNOWN', // Default gender
});


const handleRegistration = async (formData: UserCreateDTO) => {
  try {
    // UserForm in create mode should emit data structured as UserCreateDTO.
    // Explicitly map to ensure only UserCreateDTO fields are sent,
    // though UserForm should already handle this.
    const dataToSubmit: UserCreateDTO = {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        gender: formData.gender,
        // roles are not part of UserCreateDTO by default based on UserModels.ts
        // If they were, UserForm logic with canAdminister would control them.
    };

    await userStore.register(dataToSubmit);
    $q.notify({
      color: 'positive',
      message: 'Registration successful! Redirecting to login...',
      icon: 'check_circle',
      position: 'top',
    });
    setTimeout(() => {
      router.push({ name: 'Login' }); // Use route name for navigation
    }, 2000);
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Registration failed: ${error.response?.data?.message || error.message || 'Unknown error'}`,
      icon: 'error',
      position: 'top',
    });
  }
};
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
