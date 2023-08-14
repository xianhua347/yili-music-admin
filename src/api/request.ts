import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosError } from 'axios';
import { Notify } from 'quasar';

import type { ErrorResponse } from '@/models/ApiModel.ts';
import { useAppStore } from '@/store';

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

const tokenPrefix = 'Bearer ';

export const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

instance.interceptors.request.use((request) => {
  const { appState } = useAppStore();
  if (appState.token && request.headers) {
    request.headers.Authorization = tokenPrefix + appState.token;
  }
  return request;
});

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const responseData: ErrorResponse | ErrorResponse[] | undefined =
      error.response?.data;

    handleResponseData(responseData);

    if (error.response?.status === 401 || error.response?.status === 403) {
      const appStore = useAppStore();
      appStore.logout();
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
): Promise<AxiosResponse<T, any>> => {
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
