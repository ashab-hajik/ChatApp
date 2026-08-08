import { useState } from 'react';
import { MessageCircle, Users2 } from 'lucide-react';
import clsx from 'clsx';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { EmptyState } from '../common/EmptyState';
import { ChatListSkeleton } from '../ui/SkeletonLoader';
import { ChatListItem } from '../chat/ChatListItem';
import { NewChatModal } from '../chat/NewChatModal';
import { CreateGroupModal } from '../chat/CreateGroupModal';
import { useUiStore } from '../../store/ui.store';
import { useChats } from '../../hooks/useChats';

export function Sidebar() {
  const [query, setQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const sidebarView = useUiStore((s) => s.sidebarView);
  const setSidebarView = useUiStore((s) => s.setSidebarView);
  const { data: chats, isLoading } = useChats();

  const filtered = (chats ?? []).filter((chat) => {
    if (sidebarView === 'groups' && !chat.isGroup) return false;
    if (sidebarView === 'chats' && chat.isGroup) return false;
    if (!query.trim()) return true;
    const name = chat.isGroup ? chat.groupName : chat.otherUser?.fullName;
    return name?.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <SidebarHeader onNewChat={() => setIsNewChatOpen(true)} onCreateGroup={() => setIsCreateGroupOpen(true)} />
      <SidebarSearch value={query} onChange={setQuery} />

      <div className="flex border-b border-gray-100">
        <button
          type="button"
          onClick={() => setSidebarView('chats')}
          className={clsx(
            'flex-1 py-2 text-sm font-medium',
            sidebarView === 'chats'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          Chats
        </button>
        <button
          type="button"
          onClick={() => setSidebarView('groups')}
          className={clsx(
            'flex-1 py-2 text-sm font-medium',
            sidebarView === 'groups'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          Groups
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <ChatListSkeleton />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={sidebarView === 'chats' ? <MessageCircle size={32} /> : <Users2 size={32} />}
            title={sidebarView === 'chats' ? 'No conversations yet' : 'No groups yet'}
            description={
              sidebarView === 'chats'
                ? 'Start a new chat to see it here.'
                : 'Create a group to start chatting with multiple people.'
            }
          />
        )}

        {!isLoading && filtered.map((chat) => <ChatListItem key={chat.id} chat={chat} />)}
      </div>

      {isNewChatOpen && <NewChatModal onClose={() => setIsNewChatOpen(false)} />}
      {isCreateGroupOpen && <CreateGroupModal onClose={() => setIsCreateGroupOpen(false)} />}
    </div>
  );
}
