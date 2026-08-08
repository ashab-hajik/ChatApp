import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { ChatSummary } from '../../types/chat';
import { Avatar } from '../ui/Avatar';
import { usePresenceStore } from '../../store/presence.store';
import { useTypingStore } from '../../store/typing.store';
import { useUiStore } from '../../store/ui.store';
import { formatChatListTime } from '../../utils/formatters';
import { MessageStatusTicks } from './MessageStatusTicks';
import { useAuth } from '../../context/AuthContext';
import { deleteChat } from '../../services/chat.service';
import { chatsQueryKey } from '../../hooks/useChats';

export function ChatListItem({ chat }: { chat: ChatSummary }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeChatId = useUiStore((s) => s.activeChatId);
  const isOnline = usePresenceStore((s) => (chat.otherUser ? s.isOnline(chat.otherUser.id) : false));
  const isSomeoneTyping = useTypingStore((s) => Object.keys(s.typingByChatId[chat.id] ?? {}).length > 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteChat(chat.id),
    onSuccess: () => {
      queryClient.setQueryData<ChatSummary[]>(chatsQueryKey, (old) => old?.filter((c) => c.id !== chat.id));
      if (activeChatId === chat.id) navigate('/');
    },
  });

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    if (window.confirm('Delete this chat? It will be removed from your list only.')) {
      deleteMutation.mutate();
    }
  }

  const title = chat.isGroup ? chat.groupName ?? 'Group' : chat.otherUser?.fullName ?? 'Unknown';
  const avatarSrc = chat.isGroup ? chat.groupImage : chat.otherUser?.profileImage;
  const lastMessage = chat.lastMessage;
  const isOwnLastMessage = lastMessage?.senderId === user?.id;

  const lastMessagePreview = lastMessage
    ? lastMessage.type === 'TEXT'
      ? lastMessage.content
      : lastMessage.type === 'IMAGE'
        ? '📷 Photo'
        : `📎 ${lastMessage.fileName ?? 'File'}`
    : 'No messages yet';
  const preview = isSomeoneTyping ? 'typing…' : lastMessagePreview;

  return (
    <NavLink
      to={`/chat/${chat.id}`}
      className={({ isActive }) =>
        clsx('group relative flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50', isActive && 'bg-gray-100')
      }
    >
      <Avatar src={avatarSrc} name={title} online={chat.isGroup ? undefined : isOnline} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{title}</p>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-gray-400 group-hover:hidden">
              {formatChatListTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isSomeoneTyping && isOwnLastMessage && lastMessage && (
            <MessageStatusTicks status={lastMessage.status} />
          )}
          <p className={clsx('truncate text-xs', isSomeoneTyping ? 'font-medium text-brand-600' : 'text-gray-500')}>
            {preview}
          </p>
          {chat.unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-medium text-white">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="absolute right-2 top-2 hidden group-hover:block">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen((v) => !v);
          }}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200"
        >
          <MoreVertical size={16} />
        </button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(false);
              }}
            />
            <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                <Trash2 size={14} /> Delete chat
              </button>
            </div>
          </>
        )}
      </div>
    </NavLink>
  );
}
