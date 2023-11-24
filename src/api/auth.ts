/**
 * 登录
 * @username string
 * @password string
 */
import { request } from '@/api';
import type {
  ApiResponse,
  JwtResponse,
  LoginRequest,
  RefreshTokenResponse
} from '@/models';
import { AUTH_URL } from '@/models';

export async function login(
  loginRequest: LoginRequest
): Promise<ApiResponse<JwtResponse>> {
  try {
    return await request.post(`${AUTH_URL}login`, loginRequest);
  } catch (error: any) {
    return Promise.reject(new Error(`login error${error}`));
  }
}

export async function refreshToken(
  refreshToken?: string | null
): Promise<ApiResponse<RefreshTokenResponse>> {
  try {
    return await request.get<ApiResponse<RefreshTokenResponse>>(
      `${AUTH_URL}refreshToken`,
      {
        params: {
          refreshToken
        }
      }
    );
  } catch (error: any) {
    return Promise.reject(new Error(`获取刷新token失败${error}`));
  }
}
