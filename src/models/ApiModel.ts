/**
 * Generic Query Request interface
 */
export interface QueryRequest<T> {
  pageNum: number;
  pageSize: number;
  queryParams?: T;
}

/**
 * Generic Query Response interface
 */
export interface QueryResponse<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}
