import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosError } from 'axios';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

import { refreshToken } from '@/api';
import type {
  ApiResponse,
  ErrorResponse,
  RefreshTokenResponse,
  TokenState
} from '@/models';
import { TOKEN_PREFIX } from '@/models';
import { useTokenStore } from '@/store';

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

// 用于跟踪令牌刷新状态的布尔变量
let isRefreshing = true;
// 用于存储需要在令牌刷新后重新执行的请求回调的数组
const refreshQueue: Array<Function> = [];

export const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

instance.interceptors.request.use((request) => {
  const { tokenState } = useTokenStore();
  if (
    tokenState.accessToken &&
    !(request.url === '/auth/refreshToken') &&
    request.headers
  ) {
    request.headers.Authorization = TOKEN_PREFIX + tokenState.accessToken;
  }
  return request;
});
instance.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { code } = response.data;
    // 处理accessToken过期
    if (code === 4000107) {
      if (isRefreshing) {
        try {
          const { tokenState } = useTokenStore();
          isRefreshing = false;
          const refreshedData = await refreshToken(tokenState.refreshToken);
          // 更新appState数据
          updateAppStateTokens(tokenState, refreshedData);
          // 使用更新后的令牌重试原始请求
          const { config } = response;
          return instance(config);
        } catch (ex: any) {
          await handleRefreshTokenError(ex);
        } finally {
          isRefreshing = true;
          // 在令牌刷新后，遍历队列并执行回调函数
          refreshQueue.forEach((callback: Function) => {
            // 执行回调函数
            callback();
          });
          // 清空队列
          refreshQueue.length = 0;
        }
      } else {
        // 如果令牌刷新已经在进行中，则将此请求排队
        return new Promise((resolve) => {
          refreshQueue.push(() => {
            resolve(instance(response.config));
          });
        });
      }
    }
    // 返回原始响应数据
    return response.data;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const responseData: ErrorResponse | ErrorResponse[] | undefined =
      error.response?.data;

    handleResponseData(responseData);

    if (error.response?.status === 401) {
      const tokenStore = useTokenStore();
      await tokenStore.logout();
    }
    return Promise.reject(error);
  }
);

const handleResponseData = (
  responseData: ErrorResponse | ErrorResponse[] | undefined
) => {
  if (!responseData) return;
  // eslint-disable-next-line no-unused-expressions
  !(responseData instanceof Array) && (responseData = [responseData]);
  responseData.forEach((response) =>
    Notify.create({
      type: 'negative',
      message: response.message,
      position: 'top'
    })
  );
};

// 用于更新 appState 中的令牌数据
function updateAppStateTokens(
  state: TokenState,
  refreshedData: ApiResponse<RefreshTokenResponse>
) {
  state.refreshToken = refreshedData.data.refreshToken;
  state.accessToken = refreshedData.data.accessToken;
}

// 函数用于处理刷新令牌失败的情况
async function handleRefreshTokenError(ex: any) {
  const router = useRouter();
  console.error('刷新令牌错误 =>', ex);
  await router.push('/login');
}

export const get = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return instance.get(url, config);
};

export const post = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  // @ts-ignore
  return instance.post<T>(url, data, config);
};

export const del = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return instance.delete(url, config);
};

export const put = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T, any>> => {
  return instance.put<T>(url, data, config);
};
