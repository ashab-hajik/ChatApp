import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getChatMessages } from '../services/chat.service';

export function messagesQueryKey(chatId: string) {
  return ['messages', chatId] as const;
}

// Each page holds the next-oldest chunk of messages (chronologically ascending within
// itself). Pages are fetched newest-first, so we reverse page order before flattening to
// get one fully chronological list for rendering.
export function useMessages(chatId: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: messagesQueryKey(chatId ?? ''),
    queryFn: ({ pageParam }) => getChatMessages(chatId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!chatId,
  });

  const messages = useMemo(() => {
    if (!query.data) return [];
    return [...query.data.pages].reverse().flatMap((page) => page.messages);
  }, [query.data]);

  return { ...query, messages };
}
