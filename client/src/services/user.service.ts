import { api } from './api';
import { ApiSuccess } from '../types/api';
import { User } from '../types/user';

export async function getMe() {
  const { data } = await api.get<ApiSuccess<User>>('/users/me');
  return data.data;
}

export async function getUserById(id: string) {
  const { data } = await api.get<ApiSuccess<User>>(`/users/${id}`);
  return data.data;
}

export async function searchUsers(query: string) {
  const { data } = await api.get<ApiSuccess<User[]>>('/users/search', { params: { q: query } });
  return data.data;
}

export interface UpdateProfileInput {
  fullName?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const { data } = await api.put<ApiSuccess<User>>('/users/profile', input);
  return data.data;
}
