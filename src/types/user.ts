export interface User {
  id: number;
  name: string;
  age: number;
  gender: boolean | null;
  role: 0 | 1;
  insertTime: string;
  updateTime: string;
  avatar: string;
  disabled: boolean;
  phone: string;
  email: string;
  isMe?: boolean;
}

export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateMeRequest {
  name?: string;
  age?: number;
  gender?: boolean | null;
  password?: string;
  phone?: string;
  email?: string;
}

export interface AdminUpdateUserRequest {
  name?: string;
  age?: number;
  gender?: boolean | null;
  password?: string;
  role?: 0 | 1;
  disabled?: boolean;
  phone?: string;
  email?: string;
}

export interface UserSearchParams {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  page?: number;
  size?: number;
}

export interface AdminAddUserRequest {
  name: string;
  age: number;
  gender?: boolean | null;
  password: string;
  role?: 0 | 1;
  disabled?: boolean;
  phone: string;
  email: string;
}

export interface DisableRequest {
  disabled: boolean;
}
