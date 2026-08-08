import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChat } from '../services/chat.service';
import { chatsQueryKey } from './useChats';
import { ChatSummary } from '../types/chat';

export function useChat(chatId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId,
    initialData: () => {
      const cached = queryClient.getQueryData<ChatSummary[]>(chatsQueryKey);
      return cached?.find((chat) => chat.id === chatId);
    },
  });
}
