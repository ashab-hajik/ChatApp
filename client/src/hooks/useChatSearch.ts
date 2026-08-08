import { useQuery } from '@tanstack/react-query';
import { searchChatMessages } from '../services/chat.service';
import { useDebouncedValue } from './useDebouncedValue';

export function useChatSearch(chatId: string, query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  return useQuery({
    queryKey: ['chat-search', chatId, debouncedQuery],
    queryFn: () => searchChatMessages(chatId, debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
}
