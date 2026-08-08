import { useState } from 'react';
import { ArrowLeft, Info, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Avatar } from '../ui/Avatar';
import { Chat } from '../../types/chat';
import { usePresenceStore } from '../../store/presence.store';
import { useTypingStore } from '../../store/typing.store';
import { formatLastSeen } from '../../utils/formatters';
import { GroupInfoModal } from './GroupInfoModal';
import { UserInfoModal } from './UserInfoModal';

interface ChatHeaderProps {
  chat: Chat;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
}

export function ChatHeader({ chat, isSearchOpen, onToggleSearch }: ChatHeaderProps) {
  const navigate = useNavigate();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isOnline = usePresenceStore((s) => (chat.otherUser ? s.isOnline(chat.otherUser.id) : false));
  const lastSeen = usePresenceStore((s) => (chat.otherUser ? s.lastSeenByUserId[chat.otherUser.id] : undefined));
  const typingNames = useTypingStore((s) => Object.values(s.typingByChatId[chat.id] ?? {}));

  const title = chat.isGroup ? chat.groupName ?? 'Group' : chat.otherUser?.fullName ?? 'Unknown';
  const typingSubtitle =
    typingNames.length === 0
      ? null
      : typingNames.length === 1
        ? `${typingNames[0]} is typing…`
        : 'Several people are typing…';
  const subtitle =
    typingSubtitle ??
    (chat.isGroup
      ? `${chat.members?.length ?? 0} members`
      : isOnline
        ? 'online'
        : formatLastSeen(lastSeen ?? chat.otherUser?.lastSeen));

  return (
    <>
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-2">
        <button type="button" onClick={() => navigate('/')} className="rounded-full p-2 hover:bg-gray-200 md:hidden">
          <ArrowLeft size={20} />
        </button>

        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1 text-left hover:bg-gray-200"
        >
          <Avatar
            src={chat.isGroup ? chat.groupImage : chat.otherUser?.profileImage}
            name={title}
            online={chat.isGroup ? undefined : isOnline}
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{title}</p>
            <p className={clsx('truncate text-xs', typingSubtitle ? 'text-brand-600' : 'text-gray-500')}>
              {subtitle}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onToggleSearch}
          title="Search in chat"
          className={clsx('rounded-full p-2 hover:bg-gray-200', isSearchOpen && 'bg-gray-200')}
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          title={chat.isGroup ? 'Group info' : 'Contact info'}
          className="rounded-full p-2 hover:bg-gray-200"
        >
          <Info size={20} />
        </button>
      </div>

      {isInfoOpen &&
        (chat.isGroup ? (
          <GroupInfoModal chat={chat} onClose={() => setIsInfoOpen(false)} />
        ) : (
          chat.otherUser && <UserInfoModal user={chat.otherUser} onClose={() => setIsInfoOpen(false)} />
        ))}
    </>
  );
}
