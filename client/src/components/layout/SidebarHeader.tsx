import { useState } from 'react';
import { LogOut, MessageSquarePlus, MoreVertical, Users, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface SidebarHeaderProps {
  onNewChat: () => void;
  onCreateGroup: () => void;
}

export function SidebarHeader({ onNewChat, onCreateGroup }: SidebarHeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
      <Link to="/profile" title="Your profile">
        <Avatar src={user?.profileImage} name={user?.fullName} size="md" />
      </Link>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onNewChat}
          title="New chat"
          className="rounded-full p-2 text-gray-600 hover:bg-gray-200"
        >
          <MessageSquarePlus size={20} />
        </button>
        <button
          type="button"
          onClick={onCreateGroup}
          title="Create group"
          className="rounded-full p-2 text-gray-600 hover:bg-gray-200"
        >
          <Users size={20} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            title="Menu"
            className="rounded-full p-2 text-gray-600 hover:bg-gray-200"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <UserRound size={16} /> Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
