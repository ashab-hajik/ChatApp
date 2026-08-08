import { api } from './api';
import { ApiSuccess } from '../types/api';
import { GoogleAuthResponse } from '../types/auth';

export async function loginWithGoogle(idToken: string) {
  const { data } = await api.post<ApiSuccess<GoogleAuthResponse>>('/auth/google', { idToken });
  return data.data;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<ApiSuccess<GoogleAuthResponse>>('/auth/register', payload);
  return data.data;
}

export async function loginWithPassword(identifier: string, password: string) {
  const { data } = await api.post<ApiSuccess<GoogleAuthResponse>>('/auth/login', { identifier, password });
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function refreshSession() {
  const { data } = await api.post<ApiSuccess<{ accessToken: string }>>('/auth/refresh');
  return data.data.accessToken;
}
