import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut, Pencil, UserPlus, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { UserPicker } from './UserPicker';
import { Chat } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import { addGroupMembers, leaveGroup, removeGroupMember, updateGroup } from '../../services/chat.service';
import { chatsQueryKey } from '../../hooks/useChats';
import { User } from '../../types/user';

export function GroupInfoModal({ chat, onClose }: { chat: Chat; onClose: () => void }) {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(chat.groupName ?? '');
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState<Map<string, User>>(new Map());

  const myMembership = chat.members?.find((m) => m.id === me?.id);
  const isAdmin = myMembership?.role === 'ADMIN';

  function invalidateChat() {
    queryClient.invalidateQueries({ queryKey: ['chat', chat.id] });
    queryClient.invalidateQueries({ queryKey: chatsQueryKey });
  }

  const renameMutation = useMutation({
    mutationFn: () => updateGroup(chat.id, { groupName: groupName.trim() }),
    onSuccess: () => {
      invalidateChat();
      setIsEditingName(false);
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: () => addGroupMembers(chat.id, Array.from(selectedToAdd.keys())),
    onSuccess: () => {
      invalidateChat();
      setIsAddingMembers(false);
      setSelectedToAdd(new Map());
      setAddQuery('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeGroupMember(chat.id, userId),
    onSuccess: invalidateChat,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveGroup(chat.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatsQueryKey });
      onClose();
      navigate('/');
    },
  });

  function toggleAddUser(user: User) {
    setSelectedToAdd((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.set(user.id, user);
      return next;
    });
  }

  return (
    <Modal title="Group info" onClose={onClose}>
      <div className="flex flex-col items-center gap-2 border-b border-gray-100 py-6">
        <Avatar src={chat.groupImage} name={chat.groupName} size="xl" />

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-center text-sm outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => renameMutation.mutate()}
              disabled={!groupName.trim() || renameMutation.isPending}
              className="rounded-full p-1.5 text-brand-600 hover:bg-brand-50"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingName(false);
                setGroupName(chat.groupName ?? '');
              }}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{chat.groupName}</h3>
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500">{chat.members?.length ?? 0} members</p>
      </div>

      {isAddingMembers ? (
        <div>
          <UserPicker
            query={addQuery}
            onQueryChange={setAddQuery}
            selectedIds={new Set(selectedToAdd.keys())}
            onToggle={toggleAddUser}
            excludeIds={chat.members?.map((m) => m.id) ?? []}
          />
          <div className="flex gap-2 border-t border-gray-100 p-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsAddingMembers(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={selectedToAdd.size === 0}
              isLoading={addMembersMutation.isPending}
              onClick={() => addMembersMutation.mutate()}
            >
              Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddingMembers(true)}
              className="flex items-center gap-3 px-4 py-3 text-left text-brand-600 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50">
                <UserPlus size={18} />
              </span>
              Add participant
            </button>
          )}

          {chat.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar src={member.profileImage} name={member.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-900">
                  {member.fullName} {member.id === me?.id && <span className="text-gray-400">(You)</span>}
                </p>
                {member.role === 'ADMIN' && <p className="text-xs text-brand-600">Group admin</p>}
              </div>
              {isAdmin && member.id !== me?.id && (
                <button
                  type="button"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                  disabled={removeMemberMutation.isPending}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div className="border-t border-gray-100 p-3">
            <Button
              variant="danger"
              className="w-full"
              isLoading={leaveMutation.isPending}
              onClick={() => leaveMutation.mutate()}
            >
              <LogOut size={16} /> Leave group
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
