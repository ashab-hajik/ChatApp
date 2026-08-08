import { useCallback, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { SocketEvents } from '../utils/socketEvents';

const STOP_TYPING_DELAY_MS = 2000;

// Emits `typing` on keystrokes and auto-emits `stop_typing` after a pause, on send, or
// on unmount/chat change — so a closed tab or a chat switch never leaves the other side
// thinking you're still typing (the server's own 5s timeout is just a backstop).
export function useTypingEmitter(chatId: string) {
  const { socket } = useSocket();
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    if (isTypingRef.current) {
      socket.emit(SocketEvents.STOP_TYPING, chatId);
      isTypingRef.current = false;
    }
  }, [socket, chatId]);

  const notifyTyping = useCallback(() => {
    socket.emit(SocketEvents.TYPING, chatId);
    isTypingRef.current = true;

    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(stopTyping, STOP_TYPING_DELAY_MS);
  }, [socket, chatId, stopTyping]);

  useEffect(() => stopTyping, [chatId, stopTyping]);

  return { notifyTyping, stopTyping };
}
