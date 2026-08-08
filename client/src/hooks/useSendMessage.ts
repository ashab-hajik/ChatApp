import { useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { SocketEvents } from '../utils/socketEvents';
import { Message, MessageType } from '../types/message';

interface SendMessagePayload {
  chatId: string;
  type?: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface SendMessageAck {
  success: boolean;
  message?: Message;
  error?: string;
}

export function useSendMessage() {
  const { socket } = useSocket();

  return useCallback(
    (payload: SendMessagePayload) =>
      new Promise<Message>((resolve, reject) => {
        socket.emit(SocketEvents.SEND_MESSAGE, payload, (ack: SendMessageAck) => {
          if (ack.success && ack.message) {
            resolve(ack.message);
          } else {
            reject(new Error(ack.error ?? 'Failed to send message'));
          }
        });
      }),
    [socket],
  );
}
