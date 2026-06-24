import apiClient from './client';
import type { ApiResponse, User, UpdateMeRequest } from '../types';

export const getMe = (): Promise<ApiResponse<User>> =>
  apiClient.get('/user/me').then((res) => res.data as ApiResponse<User>);

export const updateMe = (data: UpdateMeRequest): Promise<ApiResponse<User>> =>
  apiClient.put('/user/me', data).then((res) => res.data as ApiResponse<User>);
