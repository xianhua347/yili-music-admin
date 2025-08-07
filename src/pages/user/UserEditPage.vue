<template>
  <q-page padding class="flex flex-center">
    <q-card style="min-width: 400px; max-width: 600px;">
      <q-card-section>
        <div class="text-h6 q-mb-md text-center">Edit User {{ userId }}</div>
        <q-inner-loading :showing="isLoadingUserData || (isSubmitting && !userData)">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-card-section>

      <q-card-section v-if="!isLoadingUserData && !userData && !isSubmitting">
         <q-banner class="text-white bg-red">
            User data could not be loaded. The user may not exist or there was an error.
            <q-btn flat label="Back to User List" @click="router.push({ name: 'UserList' })" />
        </q-banner>
      </q-card-section>

      <q-card-section v-if="userData && !isSubmitting">
        <UserForm
          :user="userData"
          :is-edit-mode="true"
          @submit="handleSubmit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import UserForm from '@/components/UserForm.vue';
import { useUserStore } from '@/store/modules/UserStore';
import type { UserUpdateDTO, UserVO, UserQueryRequest } from '@/models/UserModels';
import type { QueryRequest } from '@/models/ApiModel';


const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const userId = computed(() => route.params.id as string);
const userData = ref<UserVO | null>(null);
const isLoadingUserData = ref(false); // Dedicated loading for initial fetch
const isSubmitting = ref(false); // Loading for form submission


onMounted(async () => {
  if (userId.value) {
    isLoadingUserData.value = true;
    try {
      // Attempt to find user in store's current list first
      let user = userStore.users.find(u => u.id?.toString() === userId.value);
      
      if (user) {
        userData.value = { ...user }; // Use a copy
      } else if (userStore.currentUser && userStore.currentUser.id?.toString() === userId.value) {
        // Check if it's the current user being edited (e.g., admin editing self via user list)
         user = userStore.currentUser;
         userData.value = { ...user }; // Use a copy
      }
      else {
        // If not in current list or not current user, try to fetch specifically
        // This assumes searchUsers can fetch a single user if username/id is known
        // Or, a dedicated fetchUserById action would be better.
        // For now, let's try searching by username if ID is username, or prepare for fetchById
        // This part needs a robust way to fetch a single user.
        // Let's try a targeted search, assuming the ID might be the username or a numeric ID
        const queryParams: UserQueryRequest = {};
        // Heuristic: if userId is numeric, treat as ID, otherwise as username for search
        // This is a placeholder for a proper fetchUserById
        if (/^\d+$/.test(userId.value)) {
           // If your API supports fetching by ID directly via search or a dedicated endpoint
           // For now, we'll assume the user list page populates 'users' or we can't fetch directly
           // This is a common scenario where you might need fetchUserById(userId.value)
           console.warn(`User ID ${userId.value} not found in store. Direct fetch by ID is preferred.`);
           // Attempt to use searchUsers as a fallback if API supports it.
           // This is not ideal, a dedicated fetchUserById is better.
           const searchPayload: QueryRequest<UserQueryRequest> = { pageNum: 1, pageSize: 1, queryParams: { username: userId.value } };
           // This is a guess, UserQueryRequest might not support ID directly
           // It's better if UserStore has an action like `async fetchUser(id: string): Promise<UserVO>`
           await userStore.searchUsers(searchPayload);
           user = userStore.users.find(u => u.id?.toString() === userId.value || u.username === userId.value);

        } else { // Assume it's a username
             const searchPayload: QueryRequest<UserQueryRequest> = { pageNum: 1, pageSize: 1, queryParams: { username: userId.value } };
             await userStore.searchUsers(searchPayload);
             user = userStore.users.find(u => u.username === userId.value);
        }


        if (user) {
          userData.value = { ...user };
        } else {
          $q.notify({
            color: 'negative',
            message: `User with ID/Username '${userId.value}' not found.`,
            icon: 'error',
          });
           router.push({ name: 'UserList' }); // Redirect if user not found
        }
      }
    } catch (error: any) {
      $q.notify({
        color: 'negative',
        message: `Error loading user data: ${error.message || 'Unknown error'}`,
        icon: 'error',
      });
    } finally {
      isLoadingUserData.value = false;
    }
  } else {
    $q.notify({ color: 'negative', message: 'No user ID provided for editing.', icon: 'error' });
    router.push({ name: 'UserList' });
  }
});

const handleSubmit = async (formDataFromComponent: UserUpdateDTO & UserVO) => {
  if (!userId.value || !userData.value) {
    $q.notify({ color: 'negative', message: 'User data is not available for update.', icon: 'error' });
    return;
  }
  isSubmitting.value = true;

  // UserForm submits a FormDataType which is Partial<UserVO & UserCreateDTO & UserUpdateDTO>
  // We need to ensure it's shaped correctly for UserUpdateDTO
  const updateData: UserUpdateDTO = {
    nickname: formDataFromComponent.nickname,
    gender: formDataFromComponent.gender,
    // Only include password if it's provided (UserForm handles this)
    ...(formDataFromComponent.password && { password: formDataFromComponent.password }),
    // Admin-only fields, UserForm should only include these if admin is editing
    ...(formDataFromComponent.locked !== undefined && userStore.isAdmin() && { locked: formDataFromComponent.locked }),
    ...(formDataFromComponent.enabled !== undefined && userStore.isAdmin() && { enabled: formDataFromComponent.enabled }),
    ...(formDataFromComponent.roles && userStore.isAdmin() && { roles: formDataFromComponent.roles }),
  };

  try {
    await userStore.updateUser(userId.value, updateData);
    $q.notify({
      color: 'positive',
      message: 'User updated successfully! Redirecting to user list...',
      icon: 'check_circle',
      position: 'top',
    });
    setTimeout(() => router.push({ name: 'UserList' }), 2000);
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error updating user: ${error.response?.data?.message || error.message || 'Unknown error'}`,
      icon: 'error',
      position: 'top',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
