import apiClient from './client';
import type { ApiResponse, PageData, User, AdminUpdateUserRequest, AdminAddUserRequest, DisableRequest } from '../types';

export const addUser = (data: AdminAddUserRequest): Promise<ApiResponse<User>> =>
  apiClient
    .post('/admin/user', data)
    .then((res) => res.data as ApiResponse<User>);

export const getUserPage = (page: number, size: number): Promise<ApiResponse<PageData<User>>> =>
  apiClient
    .get('/admin/user/page', { params: { page, size } })
    .then((res) => res.data as ApiResponse<PageData<User>>);

export const searchUsers = (params: {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageData<User>>> =>
  apiClient
    .get('/admin/user/search', { params })
    .then((res) => res.data as ApiResponse<PageData<User>>);

export const adminUpdateUser = (
  id: number,
  data: AdminUpdateUserRequest
): Promise<ApiResponse<User>> =>
  apiClient
    .put(`/admin/user/${id}`, data)
    .then((res) => res.data as ApiResponse<User>);

export const deleteUser = (id: number): Promise<ApiResponse<null>> =>
  apiClient.delete(`/admin/user/${id}`).then((res) => res.data as ApiResponse<null>);

export const disableUser = (
  id: number,
  data: DisableRequest
): Promise<ApiResponse<User>> =>
  apiClient
    .put(`/admin/user/${id}/disable`, data)
    .then((res) => res.data as ApiResponse<User>);
