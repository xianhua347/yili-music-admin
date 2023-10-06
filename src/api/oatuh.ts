import { request } from '@/api';
import { ApiResponse, OAUTH_URL } from '@/models';

export async function getOAuthRedirectUrl(
  type: string
): Promise<ApiResponse<string>> {
  try {
    return await request.get(`${OAUTH_URL}getRedirectUrl/${type}`);
  } catch (error: any) {
    return Promise.reject(new Error(`getOAuthRedirectUrl error${error}`));
  }
}

// eslint-disable-next-line consistent-return
export async function oauthCallback(
  type: string,
  callback: AuthCallback
): Promise<ApiResponse<string>> {
  try {
    return await request.get(`${OAUTH_URL}login/${type}`, {
      params: callback
    });
  } catch (error: any) {
    return Promise.reject(new Error(`oauthCallback error${error}`));
  }
}

export interface AuthCallback {
  code: string;
  auth_code?: string;
  state: string;
  authorization_code?: string;
  oauth_token?: string;
  oauth_verifier?: string;
}
