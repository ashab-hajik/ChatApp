import { Search, UserRound, Check } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../common/EmptyState';
import { useUserSearch } from '../../hooks/useUserSearch';
import { User } from '../../types/user';

interface UserPickerProps {
  query: string;
  onQueryChange: (value: string) => void;
  selectedIds: Set<string>;
  onToggle: (user: User) => void;
  excludeIds?: string[];
}

export function UserPicker({ query, onQueryChange, selectedIds, onToggle, excludeIds = [] }: UserPickerProps) {
  const { data: users, isLoading } = useUserSearch(query);
  const visibleUsers = (users ?? []).filter((user) => !excludeIds.includes(user.id));

  return (
    <div>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
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

        {!isLoading && query.trim() && visibleUsers.length === 0 && (
          <EmptyState icon={<UserRound size={28} />} title="No users found" />
        )}

        {visibleUsers.map((user) => {
          const isSelected = selectedIds.has(user.id);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onToggle(user)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
            >
              <Avatar src={user.profileImage} name={user.fullName} online={user.isOnline} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="truncate text-xs text-gray-500">@{user.username}</p>
              </div>
              <span
                className={
                  isSelected
                    ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white'
                    : 'h-5 w-5 shrink-0 rounded-full border border-gray-300'
                }
              >
                {isSelected && <Check size={14} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
