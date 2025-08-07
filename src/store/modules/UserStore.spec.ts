import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from './UserStore'; // Adjust path as needed
import * as api from '@/api/user'; // Module to mock
import { useAppStore } from '@/store/modules/AppStore'; // To mock if token setting is there

import type { UserVO, UserQueryRequest, UserCreateDTO } from '@/models/UserModels';
import type { QueryRequest, QueryResponse, LoginRequest, ApiResponse } from '@/models/ApiModel';

// Mock the API module
vi.mock('@/api/user', async () => {
  const actual = await vi.importActual('@/api/user');
  return {
    ...actual, // Import and retain default exports or other non-function exports
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(), // Assuming register is used by an action, if not, can omit
    searchUsers: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  };
});

// Mock AppStore
vi.mock('@/store/modules/AppStore', () => ({
  useAppStore: vi.fn(() => ({
    setToken: vi.fn(),
    clearToken: vi.fn(),
    // Add other AppStore state/getters/actions if they are used by UserStore
    appState: { token: null }, 
  })),
}));


describe('UserStore Actions', () => {
  beforeEach(() => {
    // Create a new Pinia instance and make it active for each test
    setActivePinia(createPinia());
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up Pinia instance
    // setActivePinia(null); // Not strictly necessary with createPinia per test but good practice
  });

  describe('fetchCurrentUser action', () => {
    it('should call api.getCurrentUser and update currentUser state', async () => {
      const mockUserData: UserVO = { id: 1, username: 'testuser', nickname: 'Test User', roles: ['ROLE_USER'] };
      (api.getCurrentUser as vi.Mock).mockResolvedValue(mockUserData);

      const store = useUserStore();
      expect(store.currentUser).toBeNull(); // Initial state check

      await store.fetchCurrentUser();

      expect(api.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(store.currentUser).toEqual(mockUserData);
      expect(store.isLoadingCurrentUser).toBe(false);
    });

    it('should set isLoadingCurrentUser to true while fetching and false after, and handle errors', async () => {
      const errorMessage = 'Fetch failed';
      (api.getCurrentUser as vi.Mock).mockRejectedValue(new Error(errorMessage));
      
      const store = useUserStore();
      
      // Check loading state during the call
      const fetchPromise = store.fetchCurrentUser();
      expect(store.isLoadingCurrentUser).toBe(true); // Should be true immediately after call

      await expect(fetchPromise).rejects.toThrow(errorMessage);
      
      expect(store.currentUser).toBeNull(); // Should remain null or be reset on error
      expect(store.isLoadingCurrentUser).toBe(false); // Should be false after completion (error)
    });
  });

  describe('login action', () => {
    it('should call api.login, set token via AppStore, fetch current user, and update state', async () => {
      const mockCredentials: LoginRequest = { username: 'loginuser', password: 'password' };
      const mockLoginResponse: ApiResponse<string> = { success: true, code: 200, message: 'OK', data: 'mock-jwt-token' };
      const mockCurrentUserData: UserVO = { id: 2, username: 'loginuser', nickname: 'Logged In User' };

      (api.login as vi.Mock).mockResolvedValue(mockLoginResponse);
      (api.getCurrentUser as vi.Mock).mockResolvedValue(mockCurrentUserData); // Mock subsequent fetchCurrentUser call

      const store = useUserStore();
      const appStore = useAppStore(); // Get mocked AppStore instance

      await store.login(mockCredentials);

      expect(api.login).toHaveBeenCalledTimes(1);
      expect(api.login).toHaveBeenCalledWith(mockCredentials);
      
      expect(appStore.setToken).toHaveBeenCalledTimes(1);
      expect(appStore.setToken).toHaveBeenCalledWith('mock-jwt-token');
      
      expect(api.getCurrentUser).toHaveBeenCalledTimes(1); // fetchCurrentUser is called internally
      expect(store.currentUser).toEqual(mockCurrentUserData);
    });

     it('should throw error if login API fails', async () => {
      const mockCredentials: LoginRequest = { username: 'loginuser', password: 'password' };
      const errorMessage = "Login API error";
      (api.login as vi.Mock).mockRejectedValue(new Error(errorMessage));
      
      const store = useUserStore();
      await expect(store.login(mockCredentials)).rejects.toThrow(errorMessage);
      expect(store.currentUser).toBeNull();
    });

    it('should throw error if login response has no data (token)', async () => {
        const mockCredentials: LoginRequest = { username: 'loginuser', password: 'password' };
        const mockLoginResponseNoToken: ApiResponse<string> = { success: false, code: 400, message: 'No token returned' }; // No data field
         (api.login as vi.Mock).mockResolvedValue(mockLoginResponseNoToken);

        const store = useUserStore();
        await expect(store.login(mockCredentials)).rejects.toThrow('No token returned');
        expect(store.currentUser).toBeNull();
    });
  });

  describe('searchUsers action', () => {
    it('should call api.searchUsers and update users and totalUsers state', async () => {
      const mockQuery: QueryRequest<UserQueryRequest> = { pageNum: 1, pageSize: 5 };
      const mockUserList: UserVO[] = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      const mockSearchResponse: QueryResponse<UserVO> = {
        list: mockUserList,
        total: mockUserList.length,
        pageNum: 1,
        pageSize: 5,
      };
      (api.searchUsers as vi.Mock).mockResolvedValue(mockSearchResponse);

      const store = useUserStore();
      expect(store.users).toEqual([]); // Initial state
      expect(store.totalUsers).toBe(0);

      await store.searchUsers(mockQuery);

      expect(api.searchUsers).toHaveBeenCalledTimes(1);
      expect(api.searchUsers).toHaveBeenCalledWith(mockQuery);
      expect(store.users).toEqual(mockUserList);
      expect(store.totalUsers).toBe(mockUserList.length);
      expect(store.isLoadingUsers).toBe(false);
    });
     it('should set isLoadingUsers to true while fetching and false after, and handle errors', async () => {
      const mockQuery: QueryRequest<UserQueryRequest> = { pageNum: 1, pageSize: 5 };
      const errorMessage = 'Search failed';
      (api.searchUsers as vi.Mock).mockRejectedValue(new Error(errorMessage));
      
      const store = useUserStore();
      
      const searchPromise = store.searchUsers(mockQuery);
      expect(store.isLoadingUsers).toBe(true);

      await expect(searchPromise).rejects.toThrow(errorMessage);
      
      expect(store.users).toEqual([]); 
      expect(store.totalUsers).toBe(0);
      expect(store.isLoadingUsers).toBe(false);
    });
  });

  // Add tests for logout, register (if it has store logic beyond API call), updateUser, deleteUser
});
