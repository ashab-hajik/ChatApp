import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getMessagesAround } from '../services/chat.service';
import { messagesQueryKey } from './useMessages';
import { useUiStore } from '../store/ui.store';

// Replaces the infinite-scroll cache for a chat with a page centered on `messageId` —
// used when a search result isn't in whatever page is currently loaded. Scrolling up
// from there continues to paginate normally via the returned page's nextCursor.
export function useJumpToMessage(chatId: string) {
  const queryClient = useQueryClient();
  const setHighlightedMessageId = useUiStore((s) => s.setHighlightedMessageId);

  return useCallback(
    async (messageId: string) => {
      const alreadyLoaded = queryClient
        .getQueryData<{ pages: { messages: { id: string }[] }[] }>(messagesQueryKey(chatId))
        ?.pages.some((page) => page.messages.some((m) => m.id === messageId));

      if (!alreadyLoaded) {
        const result = await getMessagesAround(chatId, messageId);
        queryClient.setQueryData(messagesQueryKey(chatId), {
          pages: [{ messages: result.messages, nextCursor: result.nextCursor }],
          pageParams: [undefined],
        });
      }

      setHighlightedMessageId(messageId);
    },
    [chatId, queryClient, setHighlightedMessageId],
  );
}
