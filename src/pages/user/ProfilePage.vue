<template>
  <q-page padding class="flex flex-center">
    <q-card style="min-width: 400px; max-width: 600px;">
      <q-card-section>
        <div class="text-h6 q-mb-md">User Profile</div>
        <q-inner-loading :showing="isLoadingCurrentUser">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-card-section>

      <q-card-section v-if="currentUser && !isLoadingCurrentUser">
        <q-list bordered separator>
          <q-item>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Username</q-item-label>
              <q-item-label caption>{{ currentUser.username }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Nickname</q-item-label>
              <q-item-label caption>{{ currentUser.nickname }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="wc" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Gender</q-item-label>
              <q-item-label caption>{{ currentUser.gender }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Roles</q-item-label>
              <q-item-label caption>{{ currentUser.roles?.join(', ') || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <!-- Add more fields as needed -->
        </q-list>
      </q-card-section>
      <q-card-section v-if="!currentUser && !isLoadingCurrentUser">
        <q-banner class="text-white bg-red">
          Could not load user profile information.
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="currentUser && !isLoadingCurrentUser">
        <div class="text-subtitle1 q-mb-sm">Update Your Profile</div>
        <UserForm
          :user="profileFormUser"
          :is-edit-mode="true"
          @submit="handleProfileUpdate"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/store/modules/UserStore';
import UserForm from '@/components/UserForm.vue';
import type { UserUpdateDTO, UserVO } from '@/models/UserModels';

const userStore = useUserStore();
const $q = useQuasar();

const isLoadingCurrentUser = computed(() => userStore.isLoadingCurrentUser);
const currentUser = computed(() => userStore.currentUser);

// Ensure currentUser is loaded
onMounted(async () => {
  if (!currentUser.value) {
    try {
      await userStore.fetchCurrentUser();
    } catch (error: any) {
      $q.notify({
        color: 'negative',
        message: `Failed to load user data: ${error.message || 'Unknown error'}`,
        icon: 'error',
      });
    }
  }
});

// Prepare a version of UserVO that fits UserUpdateDTO for the form
const profileFormUser = computed(() => {
  if (currentUser.value) {
    // For profile updates, typically a subset of fields are editable.
    // UserForm will show/hide fields based on its internal logic (e.g. admin fields vs user fields)
    // We pass the whole current user object. UserForm.vue is responsible for not allowing
    // edits to username, and for hiding admin-only fields like 'locked', 'enabled', 'roles'
    // if the current user is not an admin (which UserForm checks via userStore.isAdmin()).
    return { ...currentUser.value };
  }
  return null; // Or an empty object, depending on UserForm's expectation for a null user
});

const handleProfileUpdate = async (formData: UserUpdateDTO | UserVO) => {
  if (!currentUser.value || !currentUser.value.id) {
    $q.notify({
      color: 'negative',
      message: 'No user to update or user ID is missing.',
      icon: 'error',
    });
    return;
  }

  // Construct UserUpdateDTO from the form data.
  // UserForm should emit data that's appropriate for the context.
  // For profile update, `username` should not be sent, and `roles`, `locked`, `enabled` should not be sent
  // unless the user is an admin editing their own profile (which UserForm handles by hiding fields).
  const updateData: UserUpdateDTO = {
    nickname: formData.nickname,
    gender: formData.gender,
    // If UserForm included password and it was filled, add it.
    // Note: UserForm.vue has logic to delete password if empty.
    ...(formData.password && { password: formData.password }),
    // Roles, locked, enabled are typically not updatable by user on their own profile.
    // UserForm's logic using `canAdminister` should prevent these fields from being part of `formData`
    // if the user is not an admin. If an admin is editing their own profile, these fields might be present.
    // If UserUpdateDTO allows these fields, they will be included.
    ...(formData.roles && userStore.isAdmin() && { roles: formData.roles }),
    ...(formData.locked !== undefined && userStore.isAdmin() && { locked: formData.locked }),
    ...(formData.enabled !== undefined && userStore.isAdmin() && { enabled: formData.enabled }),
  };


  try {
    await userStore.updateUser(currentUser.value.id.toString(), updateData);
    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully!',
      icon: 'check_circle',
    });
    // Re-fetch current user to ensure UI reflects any backend-side changes/confirmations
    await userStore.fetchCurrentUser();
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error updating profile: ${error.response?.data?.message || error.message || 'Unknown error'}`,
      icon: 'error',
    });
  }
};
</script>

<style scoped>
.q-card {
  border-radius: 8px; /* Example of adding some style */
}
.q-item__label--caption {
  font-weight: 500; /* Make caption text a bit bolder */
}
</style>
