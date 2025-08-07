import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from './user'; // Assuming functions are exported from user.ts
import { request } from './request'; // The module to mock
import type { UserCreateDTO, UserVO, UserQueryRequest } from '@/models/UserModels';
import type { ApiResponse, LoginRequest, QueryRequest, QueryResponse } from '@/models/ApiModel';

// Mock the request module
vi.mock('./request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  },
}));

const USER_URL = '/users/';

describe('User API Service', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should call request.get with /users/me and return user data', async () => {
      const mockUserData: UserVO = { id: 1, username: 'testuser', nickname: 'Test User', roles: ['ROLE_USER'] };
      const mockApiResponse: ApiResponse<UserVO> = { success: true, code: 200, message: 'OK', data: mockUserData };
      
      // Configure the mock for request.get to simulate a successful response
      (request.get as vi.Mock).mockResolvedValue({ data: mockApiResponse }); // Axios responses wrap data

      const result = await api.getCurrentUser();

      expect(request.get).toHaveBeenCalledTimes(1);
      expect(request.get).toHaveBeenCalledWith(`${USER_URL}me`);
      expect(result).toEqual(mockUserData);
    });

    it('should throw an error if the API call fails', async () => {
      const errorMessage = 'Network Error';
      (request.get as vi.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(api.getCurrentUser()).rejects.toThrow(`获取当前用户失败: ${errorMessage}`);
    });
  });

  describe('register', () => {
    it('should call request.post with /users/register and DTO, then return new user data', async () => {
      const mockDto: UserCreateDTO = { username: 'newuser', password: 'password123', nickname: 'Newbie' };
      const mockRegisteredUser: UserVO = { id: 2, username: 'newuser', nickname: 'Newbie', roles: ['ROLE_USER'] };
      const mockApiResponse: ApiResponse<UserVO> = { success: true, code: 201, message: 'Created', data: mockRegisteredUser };

      (request.post as vi.Mock).mockResolvedValue({ data: mockApiResponse });

      const result = await api.register(mockDto);

      expect(request.post).toHaveBeenCalledTimes(1);
      expect(request.post).toHaveBeenCalledWith(`${USER_URL}register`, mockDto);
      expect(result).toEqual(mockRegisteredUser);
    });
  });

  describe('searchUsers', () => {
    it('should call request.post with /users/search and query, then return query response', async () => {
      const mockQuery: QueryRequest<UserQueryRequest> = {
        pageNum: 1,
        pageSize: 10,
        queryParams: { username: 'searchterm' },
      };
      const mockUserList: UserVO[] = [
        { id: 1, username: 'testuser1', nickname: 'Test User 1' },
        { id: 2, username: 'searchtermUser', nickname: 'Search Term User' },
      ];
      const mockSearchResponse: QueryResponse<UserVO> = {
        list: mockUserList,
        total: mockUserList.length,
        pageNum: 1,
        pageSize: 10,
      };
      const mockApiResponse: ApiResponse<QueryResponse<UserVO>> = { success: true, code: 200, message: 'OK', data: mockSearchResponse };
      
      (request.post as vi.Mock).mockResolvedValue({ data: mockApiResponse });

      const result = await api.searchUsers(mockQuery);

      expect(request.post).toHaveBeenCalledTimes(1);
      expect(request.post).toHaveBeenCalledWith(`${USER_URL}search`, mockQuery);
      expect(result).toEqual(mockSearchResponse);
    });
  });
  
  // Add similar tests for login, updateUser, deleteUser if needed
});
