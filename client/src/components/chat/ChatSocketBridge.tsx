import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { SocketEvents } from '../../utils/socketEvents';
import { Message, MessagesPage } from '../../types/message';
import { Chat, ChatSummary } from '../../types/chat';
import { chatsQueryKey } from '../../hooks/useChats';
import { messagesQueryKey } from '../../hooks/useMessages';
import { useUiStore } from '../../store/ui.store';
import { useTypingStore } from '../../store/typing.store';
import { markChatAsRead } from '../../services/message.service';
import { showBrowserNotification } from '../../utils/notifications';
import { toAbsoluteFileUrl } from '../../utils/constants';

// If `user_stop_typing` is ever missed (dropped connection, tab close without cleanup),
// this bounds how long a stale "typing…" indicator can linger.
const TYPING_TIMEOUT_MS = 5000;

// Mounted once near the app root. Keeps the chats list and every open messages cache in
// sync with incoming socket events, so individual pages don't each need their own listener.
export function ChatSocketBridge() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const typingTimeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    function onReceiveMessage(message: Message) {
      const activeChatId = useUiStore.getState().activeChatId;
      const isMine = message.senderId === user?.id;
      const isViewing = activeChatId === message.chatId;

      queryClient.setQueryData<InfiniteData<MessagesPage>>(messagesQueryKey(message.chatId), (old) => {
        if (!old || old.pages.length === 0) return old;
        const pages = [...old.pages];
        pages[0] = { ...pages[0], messages: [...pages[0].messages, message] };
        return { ...old, pages };
      });

      const chats = queryClient.getQueryData<ChatSummary[]>(chatsQueryKey);
      const chatIsCached = chats?.some((chat) => chat.id === message.chatId);

      if (!chatIsCached) {
        queryClient.invalidateQueries({ queryKey: chatsQueryKey });
      } else {
        queryClient.setQueryData<ChatSummary[]>(chatsQueryKey, (old) => {
          if (!old) return old;
          const updated = old.map((chat) =>
            chat.id === message.chatId
              ? {
                  ...chat,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                  unreadCount: isMine || isViewing ? chat.unreadCount : chat.unreadCount + 1,
                }
              : chat,
          );
          return [...updated].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
        });
      }

      if (isViewing && !isMine) {
        markChatAsRead(message.chatId).catch(() => undefined);
      }

      const isWindowFocused = !document.hidden;
      if (!isMine && (!isViewing || !isWindowFocused)) {
        const chat = chats?.find((c) => c.id === message.chatId);
        const senderName = message.sender.fullName ?? 'New message';
        const title = chat?.isGroup ? `${senderName} in ${chat.groupName ?? 'a group'}` : senderName;
        const body =
          message.type === 'TEXT'
            ? (message.content ?? '')
            : message.type === 'IMAGE'
              ? '📷 Photo'
              : `📎 ${message.fileName ?? 'File'}`;

        showBrowserNotification(title, {
          body,
          icon: message.sender.profileImage ? toAbsoluteFileUrl(message.sender.profileImage) : undefined,
          onClick: () => navigate(`/chat/${message.chatId}`),
        });
      }
    }

    function onGroupUpdated(payload: { id: string }) {
      queryClient.invalidateQueries({ queryKey: ['chat', payload.id] });
      queryClient.invalidateQueries({ queryKey: chatsQueryKey });
    }

    function onMessageRead(payload: { chatId: string; userId: string; messageIds: string[]; readAt: string }) {
      const chats = queryClient.getQueryData<ChatSummary[]>(chatsQueryKey);
      const chatDetail = queryClient.getQueryData<Chat>(['chat', payload.chatId]);
      const isGroup = chats?.find((c) => c.id === payload.chatId)?.isGroup ?? chatDetail?.isGroup ?? false;

      queryClient.setQueryData<InfiniteData<MessagesPage>>(messagesQueryKey(payload.chatId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) => {
              if (!payload.messageIds.includes(m.id)) return m;
              const alreadyRead = m.reads.some((r) => r.userId === payload.userId);
              const reads = alreadyRead ? m.reads : [...m.reads, { userId: payload.userId, readAt: payload.readAt }];
              return { ...m, reads, status: isGroup ? m.status : 'READ' };
            }),
          })),
        };
      });

      queryClient.setQueryData<ChatSummary[]>(chatsQueryKey, (old) =>
        old?.map((chat) =>
          chat.id === payload.chatId && chat.lastMessage && payload.messageIds.includes(chat.lastMessage.id)
            ? { ...chat, lastMessage: { ...chat.lastMessage, status: isGroup ? chat.lastMessage.status : 'READ' } }
            : chat,
        ),
      );
    }

    function onUserTyping(payload: { chatId: string; userId: string; fullName?: string | null }) {
      if (payload.userId === user?.id) return;
      useTypingStore.getState().setTyping(payload.chatId, payload.userId, payload.fullName || 'Someone');

      const key = `${payload.chatId}:${payload.userId}`;
      const existing = typingTimeoutsRef.current.get(key);
      if (existing) clearTimeout(existing);
      typingTimeoutsRef.current.set(
        key,
        setTimeout(() => {
          useTypingStore.getState().clearTyping(payload.chatId, payload.userId);
          typingTimeoutsRef.current.delete(key);
        }, TYPING_TIMEOUT_MS),
      );
    }

    function onUserStopTyping(payload: { chatId: string; userId: string }) {
      useTypingStore.getState().clearTyping(payload.chatId, payload.userId);
      const key = `${payload.chatId}:${payload.userId}`;
      const existing = typingTimeoutsRef.current.get(key);
      if (existing) {
        clearTimeout(existing);
        typingTimeoutsRef.current.delete(key);
      }
    }

    socket.on(SocketEvents.RECEIVE_MESSAGE, onReceiveMessage);
    socket.on('group_updated', onGroupUpdated);
    socket.on(SocketEvents.MESSAGE_READ, onMessageRead);
    socket.on(SocketEvents.USER_TYPING, onUserTyping);
    socket.on(SocketEvents.USER_STOP_TYPING, onUserStopTyping);
    return () => {
      socket.off(SocketEvents.RECEIVE_MESSAGE, onReceiveMessage);
      socket.off('group_updated', onGroupUpdated);
      socket.off(SocketEvents.MESSAGE_READ, onMessageRead);
      socket.off(SocketEvents.USER_TYPING, onUserTyping);
      socket.off(SocketEvents.USER_STOP_TYPING, onUserStopTyping);
    };
  }, [socket, queryClient, user?.id, navigate]);

  return null;
}
