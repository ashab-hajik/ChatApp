import { User } from './user';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface MessageRead {
  userId: string;
  readAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  sender: Pick<User, 'id' | 'username' | 'fullName' | 'profileImage'>;
  reads: MessageRead[];
}

export interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
}
