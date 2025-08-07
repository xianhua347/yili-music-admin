import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';

import * as api from '@/api/user'; // Import all user API functions
import type { LoginRequest, QueryRequest, QueryResponse } from '@/models/ApiModel';
import type { UserCreateDTO, UserQueryRequest, UserUpdateDTO, UserVO } from '@/models/UserModels';
import { useAppStore } from '@/store/modules/AppStore'; // Assuming AppStore handles token

export const useUserStore = defineStore(
  'user',
  () => {
    const appStore = useAppStore();

    // State
    const currentUser: Ref<UserVO | null> = ref(null);
    const users: Ref<UserVO[]> = ref([]);
    const totalUsers: Ref<number> = ref(0);
    const isLoadingCurrentUser: Ref<boolean> = ref(false);
    const isLoadingUsers: Ref<boolean> = ref(false);

    // Getters
    const isAuthenticated = (): boolean => !!currentUser.value;
    // Adjusted role check: assuming roles is an array of strings (role names)
    const isAdmin = (): boolean =>
      currentUser.value?.roles?.includes('ROLE_ADMIN') || false;

    // Actions
    async function register(userCreateDto: UserCreateDTO): Promise<UserVO> {
      const registeredUser = await api.register(userCreateDto);
      // Assuming registration does not automatically log in the user.
      // If it should, set currentUser and token here.
      return registeredUser;
    }

    async function login(credentials: LoginRequest): Promise<UserVO> {
      const response = await api.login(credentials); // api.login returns ApiResponse<string> (token)
      // Assuming appStore handles setting the token from ApiResponse
      if (response.data) {
        appStore.setToken(response.data); // Assuming appStore has a setToken method
        return await fetchCurrentUser(); // Fetch user details after successful login
      } else {
        throw new Error(response.message || 'Login failed to return token');
      }
    }

    function logout(): void {
      currentUser.value = null;
      appStore.clearToken(); // Assuming appStore has a clearToken method
      // Any other cleanup like clearing persisted data if not handled by persist plugin
    }

    async function fetchCurrentUser(): Promise<UserVO> {
      isLoadingCurrentUser.value = true;
      try {
        const user = await api.getCurrentUser();
        currentUser.value = user;
        return user;
      } catch (error) {
        currentUser.value = null; // Clear user on error
        // console.error('Failed to fetch current user:', error);
        throw error; // Re-throw to be handled by the caller
      } finally {
        isLoadingCurrentUser.value = false;
      }
    }

    async function searchUsers(
      query: QueryRequest<UserQueryRequest>
    ): Promise<void> {
      isLoadingUsers.value = true;
      try {
        const response: QueryResponse<UserVO> = await api.searchUsers(query);
        users.value = response.list;
        totalUsers.value = response.total;
      } catch (error) {
        // console.error('Failed to search users:', error);
        users.value = [];
        totalUsers.value = 0;
        throw error; // Re-throw
      } finally {
        isLoadingUsers.value = false;
      }
    }

    async function updateUser(
      id: string,
      userUpdateDto: UserUpdateDTO
    ): Promise<UserVO> {
      const updatedUser = await api.updateUser(id, userUpdateDto);
      if (currentUser.value && currentUser.value.id?.toString() === id) {
        currentUser.value = { ...currentUser.value, ...updatedUser };
      }
      const index = users.value.findIndex((u) => u.id?.toString() === id);
      if (index !== -1) {
        users.value.splice(index, 1, updatedUser);
      }
      return updatedUser;
    }

    async function deleteUser(id: string): Promise<void> {
      await api.deleteUser(id);
      users.value = users.value.filter((u) => u.id?.toString() !== id);
      if (currentUser.value && currentUser.value.id?.toString() === id) {
        // If admin deletes self, log out
        logout();
      }
      // Adjust totalUsers if necessary, or re-fetch
      totalUsers.value = Math.max(0, totalUsers.value -1);
    }

    function clearUsers(): void {
      users.value = [];
      totalUsers.value = 0;
    }
    
    // Reset function from original store, adapted
    function resetState(): void {
      currentUser.value = null;
      users.value = [];
      totalUsers.value = 0;
      isLoadingCurrentUser.value = false;
      isLoadingUsers.value = false;
      // Note: Token is managed by AppStore, so not reset here directly
    }


    return {
      // State
      currentUser,
      users,
      totalUsers,
      isLoadingCurrentUser,
      isLoadingUsers,
      // Getters (exposed as methods due to setup store syntax)
      isAuthenticated,
      isAdmin,
      // Actions
      register,
      login,
      logout,
      fetchCurrentUser,
      searchUsers,
      updateUser,
      deleteUser,
      clearUsers,
      reset: resetState // Renamed original reset to resetState to avoid conflict
    };
  },
  {
    persist: {
      paths: ['currentUser'], // Persist only currentUser to localStorage
    },
  }
);
