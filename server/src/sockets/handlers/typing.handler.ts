import { Socket } from 'socket.io';
import { SocketEvents } from '../events';
import { SocketData } from '../socket.middleware';
import { chatRoomName } from '../../services/chat.service';

// Pure relay — no persistence. Trusts the room membership established by
// chatRoom.handler.ts / auto-join on connect rather than re-checking on every keystroke.
export function registerTypingHandlers(socket: Socket) {
  // Read from socket.data fresh on every event (not destructured once here) — fullName is
  // filled in asynchronously by handleConnect's DB lookup, which hasn't resolved yet at the
  // point this function itself runs.
  const { userId } = socket.data as SocketData;

  socket.on(SocketEvents.TYPING, (chatId: string) => {
    const { fullName } = socket.data as SocketData;
    socket.to(chatRoomName(chatId)).emit(SocketEvents.USER_TYPING, { chatId, userId, fullName });
  });

  socket.on(SocketEvents.STOP_TYPING, (chatId: string) => {
    socket.to(chatRoomName(chatId)).emit(SocketEvents.USER_STOP_TYPING, { chatId, userId });
  });
}
