import type { BaseResponse } from '@/models/commonResponse.ts';
import type { Role } from '@/models/role.ts';

export interface UserCreateRequest {
  username: string;

  password: string;

  nickname: string;

  gander: string;
}

export interface User extends BaseResponse {
  username: string;

  nickname: string;

  gender: string | number;

  locked: boolean;

  enabled: boolean;

  avatar: string;

  roles: Array<Role>;

  socialUsers: Array<SocialUser>;
}

/**
 * 登录请求。
 */
export interface LoginRequest {
  /**
   * 用户名。
   */
  username: string;

  /**
   * 密码。
   */
  password: string;
}

export const gender: string[] = ['男', '女'];
interface SocialUser {
  source: string;
  accessToken: string;
  refreshToken: string;
}
