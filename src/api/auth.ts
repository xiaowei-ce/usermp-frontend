import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse } from '../types';

export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
  apiClient.post('/login', data).then((res) => res.data as ApiResponse<LoginResponse>);

export const logout = (): Promise<ApiResponse<null>> =>
  apiClient.post('/logout').then((res) => res.data as ApiResponse<null>);
