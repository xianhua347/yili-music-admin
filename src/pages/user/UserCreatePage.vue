<template>
  <q-page padding class="flex flex-center">
    <q-card style="min-width: 400px; max-width: 600px;">
      <q-card-section>
        <div class="text-h6 q-mb-md text-center">Create New User</div>
      </q-card-section>

      <q-card-section>
        <UserForm
          :user="initialCreateUser"
          :is-edit-mode="false"
          @submit="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import UserForm from '@/components/UserForm.vue';
import { useUserStore } from '@/store/modules/UserStore';
import type { UserCreateDTO, UserVO } from '@/models/UserModels'; // UserVO for type consistency with UserForm prop

const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

// UserForm expects a Partial<UserVO & UserCreateDTO & UserUpdateDTO> | null
// For new user creation by admin, we provide fields relevant to UserCreateDTO.
// UserForm's internal `initialFormData` will provide defaults.
// Roles can be set if the admin is creating a user.
const initialCreateUser = ref<Partial<UserVO>>({ // Use UserVO to allow roles to be passed if admin
  username: '',
  password: '',
  nickname: '',
  gender: 'UNKNOWN',
  roles: [], // Admin might set roles during creation
  enabled: true, // Default for new user
  locked: false, // Default for new user
});


const handleSubmit = async (formData: UserCreateDTO & { roles?: string[] }) => {
  try {
    // UserForm in create mode (isEditMode=false) will emit data.
    // For admin creation, this might include roles.
    // The `register` action in UserStore currently expects UserCreateDTO.
    // If your backend's /register endpoint (or a dedicated /admin/users endpoint)
    // supports roles and other admin-settable fields on creation, adjust DTO accordingly.
    // For now, assume UserCreateDTO is the base and roles are handled if present.
    const createData: UserCreateDTO & { roles?: string[] } = {
      username: formData.username,
      password: formData.password,
      nickname: formData.nickname,
      gender: formData.gender,
      // roles can be passed if UserForm includes them and admin is using it
      ...(formData.roles && { roles: formData.roles }),
    };

    // Using userStore.register, which might need adjustment if admin creation
    // uses a different API endpoint or expects different DTO.
    // For now, assume UserStore's register can handle UserCreateDTO potentially with roles.
    await userStore.register(createData); // Or a dedicated adminCreateUser action
    
    $q.notify({
      color: 'positive',
      message: 'User created successfully! Redirecting to user list...',
      icon: 'check_circle',
      position: 'top',
    });
    setTimeout(() => router.push({ name: 'UserList' }), 2000);
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error creating user: ${error.response?.data?.message || error.message || 'Unknown error'}`,
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
