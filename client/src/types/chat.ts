import { User } from './user';
import { Message } from './message';

export type GroupRole = 'MEMBER' | 'ADMIN';

export interface GroupMember extends User {
  role: GroupRole;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  groupName: string | null;
  groupImage: string | null;
  otherUser: User | null;
  members?: GroupMember[];
}

// Returned by the chats-list endpoint — the single-chat endpoint (used by useChat) only
// returns the base Chat shape above, without these.
export interface ChatSummary extends Chat {
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}
