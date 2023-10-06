/**
 * 错误响应。
 */
export interface ErrorResponse {
  /**
   * 错误代码。
   */
  code: number;

  /**
   * 错误消息。
   */
  message: string;
}

/**
 * 通用的API响应。
 *
 * @template T - 响应数据的类型。
 */
export interface ApiResponse<T> {
  /**
   * 响应代码
   */
  code: number;

  /**
   * 响应消息
   */
  message: string;

  /**
   * 响应数据
   */
  data: T;
}

export interface BaseResponse {
  id: string;
  createdTime: string;
  updatedTime: string;
}
