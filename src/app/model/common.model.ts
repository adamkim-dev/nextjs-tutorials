/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IBaseDeleteResponse {
  isSuccess: boolean;
  error: any;
}

export interface IBaseResponse<T> {
  data: T | null;
  error: any;
}

export interface IPostResponse<T> {
  success: boolean;
  data: T | null;
  error: any;
}
