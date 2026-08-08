import { useQuery } from '@tanstack/react-query';
import { listChats } from '../services/chat.service';

export const chatsQueryKey = ['chats'] as const;

export function useChats() {
  return useQuery({
    queryKey: chatsQueryKey,
    queryFn: listChats,
  });
}
