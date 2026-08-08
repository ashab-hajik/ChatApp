import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { User } from '../../types/user';
import { usePresenceStore } from '../../store/presence.store';
import { formatLastSeen } from '../../utils/formatters';

export function UserInfoModal({ user, onClose }: { user: User; onClose: () => void }) {
  const isOnline = usePresenceStore((s) => s.isOnline(user.id));
  const lastSeen = usePresenceStore((s) => s.lastSeenByUserId[user.id]);

  return (
    <Modal title="Contact info" onClose={onClose}>
      <div className="flex flex-col items-center gap-2 border-b border-gray-100 py-8">
        <Avatar src={user.profileImage} name={user.fullName} size="xl" />
        <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
        <p className="text-sm text-gray-500">@{user.username}</p>
      </div>

      <div className="flex flex-col divide-y divide-gray-100">
        {user.bio && <InfoField label="Bio" value={user.bio} />}
        <InfoField label="Last seen" value={isOnline ? 'Online' : formatLastSeen(lastSeen ?? user.lastSeen) || 'Unknown'} />
      </div>
    </Modal>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}
