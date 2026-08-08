import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserPicker } from './UserPicker';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { createGroupChat } from '../../services/chat.service';
import { chatsQueryKey } from '../../hooks/useChats';
import { User } from '../../types/user';

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { user: me } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Map<string, User>>(new Map());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createGroupChat({ groupName: groupName.trim(), memberIds: Array.from(selected.keys()) }),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: chatsQueryKey });
      onClose();
      navigate(`/chat/${chat.id}`);
    },
  });

  function toggleUser(user: User) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  }

  const canSubmit = groupName.trim().length > 0 && selected.size > 0 && !mutation.isPending;

  return (
    <Modal title="Create group" onClose={onClose}>
      <div className="p-3">
        <Input
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {Array.from(selected.values()).map((user) => (
            <span
              key={user.id}
              className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-1 pr-2 text-xs text-brand-700"
            >
              <Avatar src={user.profileImage} name={user.fullName} size="sm" />
              {user.fullName}
              <button type="button" onClick={() => toggleUser(user)} className="hover:text-brand-900">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <UserPicker
        query={query}
        onQueryChange={setQuery}
        selectedIds={new Set(selected.keys())}
        onToggle={toggleUser}
        excludeIds={me ? [me.id] : []}
      />

      <div className="border-t border-gray-100 p-3">
        <Button className="w-full" disabled={!canSubmit} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
          Create group
        </Button>
      </div>
    </Modal>
  );
}
