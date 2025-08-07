import type { AxiosResponse } from 'axios';

import { request } from '@/api/request';
import type { ApiResponse, LoginRequest, QueryRequest, QueryResponse } from '@/models/ApiModel';
import type { UserCreateDTO, UserQueryRequest, UserUpdateDTO, UserVO } from '@/models/UserModels';

const USER_URL: string = '/users/';

/**
 * 登录
 * @username string
 * @password string
 */

export async function login(
  loginRequest: LoginRequest
): Promise<ApiResponse<string>> {
  try {
    const response: AxiosResponse<ApiResponse<string>> = await request.post(
      `${USER_URL}login`,
      loginRequest
    );
    return response.data;
  } catch (error: any) {
    return Promise.reject(new Error(`login error${error}`));
  }
}

export async function getCurrentUser(): Promise<UserVO> {
  try {
    const response: AxiosResponse<ApiResponse<UserVO>> = await request.get(
      `${USER_URL}me`
    );
    return response.data.data; // Assuming response.data is ApiResponse, and response.data.data is UserVO
  } catch (error: any) {
    // Consider more specific error handling or re-throwing a custom error
    return Promise.reject(new Error(`获取当前用户失败: ${error.message || error}`));
  }
}

export async function register(userCreateDto: UserCreateDTO): Promise<UserVO> {
  try {
    const response: AxiosResponse<ApiResponse<UserVO>> = await request.post(
      `${USER_URL}register`,
      userCreateDto
    );
    return response.data.data; // Assuming response.data is ApiResponse, and response.data.data is UserVO
  } catch (error: any) {
    return Promise.reject(new Error(`注册失败: ${error.message || error}`));
  }
}

// Removed getUserByName as it's not in the subtask requirements and searchUsers provides more flexible searching.

export async function deleteUser(id: string): Promise<void> {
  try {
    // Assuming the delete operation doesn't return content in the ApiResponse data field
    // and request.del handles the ApiResponse wrapper if present.
    // If request.del returns the full AxiosResponse, and it's an ApiResponse<void>,
    // we might not need to access .data.data
    await request.del(`${USER_URL}${id}`);
  } catch (error: any) {
    return Promise.reject(new Error(`删除用户失败: ${error.message || error}`));
  }
}

export async function updateUser(id: string, userUpdateDto: UserUpdateDTO): Promise<UserVO> {
  try {
    const response: AxiosResponse<ApiResponse<UserVO>> = await request.put(
      `${USER_URL}${id}`,
      userUpdateDto
    );
    return response.data.data; // Assuming response.data is ApiResponse, and response.data.data is UserVO
  } catch (error: any) {
    return Promise.reject(new Error(`更新用户失败: ${error.message || error}`));
  }
}

export async function searchUsers(
  query: QueryRequest<UserQueryRequest>
): Promise<QueryResponse<UserVO>> {
  try {
    const response: AxiosResponse<ApiResponse<QueryResponse<UserVO>>> =
      await request.post(`${USER_URL}search`, query);
    return response.data.data; // Assuming response.data is ApiResponse, and response.data.data is QueryResponse<UserVO>
  } catch (error: any) {
    return Promise.reject(new Error(`搜索用户失败: ${error.message || error}`));
  }
}
