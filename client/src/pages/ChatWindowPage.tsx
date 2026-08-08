import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useChat } from '../hooks/useChat';
import { useUiStore } from '../store/ui.store';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatSearchPanel } from '../components/chat/ChatSearchPanel';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { FullPageSpinner } from '../components/common/FullPageSpinner';
import { markChatAsRead } from '../services/message.service';
import { chatsQueryKey } from '../hooks/useChats';
import { ChatSummary } from '../types/chat';

export function ChatWindowPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { data: chat, isLoading } = useChat(chatId);
  const setActiveChatId = useUiStore((s) => s.setActiveChatId);
  const openMobileChat = useUiStore((s) => s.openMobileChat);
  const closeMobileChat = useUiStore((s) => s.closeMobileChat);
  const queryClient = useQueryClient();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!chatId) return;
    setActiveChatId(chatId);
    openMobileChat();
    return () => {
      setActiveChatId(null);
      closeMobileChat();
    };
  }, [chatId, setActiveChatId, openMobileChat, closeMobileChat]);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    markChatAsRead(chatId)
      .then(() => {
        queryClient.setQueryData<ChatSummary[]>(chatsQueryKey, (old) =>
          old?.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
        );
      })
      .catch(() => undefined);
  }, [chatId, queryClient]);

  if (!chatId) return null;
  if (isLoading || !chat) return <FullPageSpinner />;

  return (
    <div className="flex h-full flex-col bg-[#f0f2f5]">
      <ChatHeader chat={chat} isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen((v) => !v)} />

      {isSearchOpen && (
        <ChatSearchPanel
          chatId={chatId}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      <MessageList
        chatId={chatId}
        isGroup={chat.isGroup}
        otherMembersCount={chat.members ? chat.members.length - 1 : undefined}
        searchTerm={isSearchOpen ? searchQuery : undefined}
      />
      <MessageInput chatId={chatId} />
    </div>
  );
}
