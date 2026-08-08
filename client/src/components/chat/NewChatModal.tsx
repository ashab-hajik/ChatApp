import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserRound } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../common/EmptyState';
import { useUserSearch } from '../../hooks/useUserSearch';
import { createPrivateChat } from '../../services/chat.service';
import { chatsQueryKey } from '../../hooks/useChats';

export function NewChatModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { data: users, isLoading } = useUserSearch(query);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPrivateChat,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: chatsQueryKey });
      onClose();
      navigate(`/chat/${chat.id}`);
    },
  });

  return (
    <Modal title="New chat" onClose={onClose}>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="px-1 pb-2">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        )}

        {!isLoading && query.trim() && users?.length === 0 && (
          <EmptyState icon={<UserRound size={28} />} title="No users found" />
        )}

        {users?.map((user) => (
          <button
            key={user.id}
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(user.id)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50"
          >
            <Avatar src={user.profileImage} name={user.fullName} online={user.isOnline} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="truncate text-xs text-gray-500">@{user.username}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
