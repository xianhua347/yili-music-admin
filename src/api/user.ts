import type { AxiosResponse } from 'axios';

import { request } from '@/api/index';
import type { ApiResponse, LoginRequest } from '@/models/ApiModel.ts';
import type { UserCreateDTO } from '@/models/UserModel.ts';

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
    return await request.post(`${USER_URL}login`, loginRequest);
  } catch (error: any) {
    return Promise.reject(new Error(`login error${error}`));
  }
}

export async function getCurrentUser(): Promise<ApiResponse<any>> {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await request.get(
      `${USER_URL}me`
    );
    return response.data;
  } catch (error: any) {
    return Promise.reject(new Error(`获取当前用户失败${error}`));
  }
}

export async function register(
  userCreateDTO: UserCreateDTO
): Promise<ApiResponse<any>> {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await request.post(
      `${USER_URL}register`,
      userCreateDTO
    );
    return response.data;
  } catch (error: any) {
    return Promise.reject(new Error(`注册失败${error}`));
  }
}

export async function getUserByName(name: string): Promise<ApiResponse<any>> {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await request.get(
      `${USER_URL}${name}`
    );
    return response.data;
  } catch (error: any) {
    return Promise.reject(new Error(`获取用户失败${error}`));
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await request.del(
      `${USER_URL}${id}`
    );
    return response.data;
  } catch (error: any) {
    return Promise.reject(new Error(`删除用户失败${error}`));
  }
}
