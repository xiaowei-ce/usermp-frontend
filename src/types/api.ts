export interface ApiResponse<T = null> {
  code: number;
  msg: string;
  data: T;
}

export interface PageData<T> {
  total: number;
  page: number;
  size: number;
  records: T[];
}
