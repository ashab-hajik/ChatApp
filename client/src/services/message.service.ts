import { api } from './api';
import { ApiSuccess } from '../types/api';

export async function markChatAsRead(chatId: string) {
  const { data } = await api.put<ApiSuccess<{ readMessageIds: string[] }>>('/messages/read', { chatId });
  return data.data;
}
