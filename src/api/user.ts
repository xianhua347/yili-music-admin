import { request } from '@/api';
import {
  ApiResponse,
  RefreshTokenResponse,
  User,
  USER_URL,
  UserCreateRequest
} from '@/models';

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
    return await request.get(`${USER_URL}me`);
  } catch (error: any) {
    return Promise.reject(new Error(`获取当前用户失败${error}`));
  }
}

export async function register(
  createRequest: UserCreateRequest
): Promise<ApiResponse<User>> {
  try {
    return await request.post(`${USER_URL}register`, createRequest);
  } catch (error: any) {
    return Promise.reject(new Error(`注册失败${error}`));
  }
}

export async function getUserByName(name: string): Promise<ApiResponse<User>> {
  try {
    return await request.get(`${USER_URL}${name}`);
  } catch (error: any) {
    return Promise.reject(new Error(`获取用户失败${error}`));
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    return await request.del(`${USER_URL}${id}`);
  } catch (error: any) {
    return Promise.reject(new Error(`删除用户失败${error}`));
  }
}

// todo 定义请求类型
export async function getAllUsers() {
  try {
    return await request.post<ApiResponse<RefreshTokenResponse>>(
      `${USER_URL}search`,
      {
        query: null,
        page: 1,
        size: 10,
        sorts: null
      }
    );
  } catch (error: any) {
    return Promise.reject(new Error(`获取刷新token失败${error}`));
  }
}
