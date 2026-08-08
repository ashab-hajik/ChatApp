import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../events';
import { SocketData } from '../socket.middleware';
import { chatRoomName } from '../../services/chat.service';
import { createMessage } from '../../services/message.service';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';

interface SendMessagePayload {
  chatId: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

type AckCallback = (response: { success: boolean; message?: unknown; error?: string }) => void;

export function registerMessageHandlers(_io: Server, socket: Socket) {
  const { userId } = socket.data as SocketData;

  socket.on(SocketEvents.SEND_MESSAGE, async (payload: SendMessagePayload, callback?: AckCallback) => {
    try {
      const message = await createMessage({ ...payload, senderId: userId });

      // Broadcast to everyone in the room (including the sender's other tabs/devices);
      // the initiating socket gets the persisted message back via the ack instead, so it
      // doesn't need to de-duplicate against this broadcast.
      socket.to(chatRoomName(payload.chatId)).emit(SocketEvents.RECEIVE_MESSAGE, message);
      callback?.({ success: true, message });
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to send message';
      logger.error('send_message failed', error);
      callback?.({ success: false, error: errorMessage });
    }
  });
}
