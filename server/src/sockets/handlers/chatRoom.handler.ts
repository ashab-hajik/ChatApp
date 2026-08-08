import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../events';
import { SocketData } from '../socket.middleware';
import { chatRoomName, isChatMember } from '../../services/chat.service';

type AckCallback = (response: { success: boolean; message?: string }) => void;

export function registerChatRoomHandlers(_io: Server, socket: Socket) {
  const { userId } = socket.data as SocketData;

  socket.on(SocketEvents.JOIN_CHAT, async (chatId: string, callback?: AckCallback) => {
    const isMember = await isChatMember(chatId, userId);
    if (!isMember) {
      callback?.({ success: false, message: 'You are not a member of this chat' });
      return;
    }

    socket.join(chatRoomName(chatId));
    callback?.({ success: true });
  });

  socket.on(SocketEvents.LEAVE_CHAT, (chatId: string) => {
    socket.leave(chatRoomName(chatId));
  });
}
