import { api } from './api';
import { ApiSuccess } from '../types/api';
import { Chat, ChatSummary } from '../types/chat';
import { Message, MessagesPage } from '../types/message';

export interface MessagesAroundResult {
  messages: Message[];
  nextCursor: string | null;
  targetMessageId: string;
}

export async function listChats() {
  const { data } = await api.get<ApiSuccess<ChatSummary[]>>('/chats');
  return data.data;
}

export async function getChat(chatId: string) {
  const { data } = await api.get<ApiSuccess<Chat>>(`/chats/${chatId}`);
  return data.data;
}

export async function createPrivateChat(userId: string) {
  const { data } = await api.post<ApiSuccess<Chat>>('/chats/private', { userId });
  return data.data;
}

export async function getChatMessages(chatId: string, cursor?: string) {
  const { data } = await api.get<ApiSuccess<MessagesPage>>(`/chat/${chatId}/messages`, {
    params: cursor ? { cursor } : undefined,
  });
  return data.data;
}

export interface CreateGroupInput {
  groupName: string;
  memberIds: string[];
  groupImage?: string;
}

export async function createGroupChat(input: CreateGroupInput) {
  const { data } = await api.post<ApiSuccess<Chat>>('/chats/group', input);
  return data.data;
}

export async function updateGroup(chatId: string, input: { groupName?: string; groupImage?: string }) {
  const { data } = await api.put<ApiSuccess<Chat>>(`/chats/${chatId}`, input);
  return data.data;
}

export async function addGroupMembers(chatId: string, memberIds: string[]) {
  const { data } = await api.post<ApiSuccess<Chat>>(`/chats/${chatId}/members`, { memberIds });
  return data.data;
}

export async function removeGroupMember(chatId: string, userId: string) {
  const { data } = await api.delete<ApiSuccess<Chat>>(`/chats/${chatId}/members/${userId}`);
  return data.data;
}

export async function leaveGroup(chatId: string) {
  await api.post(`/chats/${chatId}/leave`);
}

export async function deleteChat(chatId: string) {
  await api.delete(`/chats/${chatId}`);
}

export async function searchChatMessages(chatId: string, query: string) {
  const { data } = await api.get<ApiSuccess<Message[]>>(`/chat/${chatId}/messages/search`, {
    params: { q: query },
  });
  return data.data;
}

export async function getMessagesAround(chatId: string, messageId: string) {
  const { data } = await api.get<ApiSuccess<MessagesAroundResult>>(
    `/chat/${chatId}/messages/around/${messageId}`,
  );
  return data.data;
}
