// Canonical Socket.IO event names, shared across all socket handlers/phases.
export const SocketEvents = {
  // Client -> Server
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  // Same event name used for both the client's read ack and the server's fan-out of
  // that read receipt to the rest of the chat's members.
  MESSAGE_READ: 'message_read',

  // Server -> Client
  RECEIVE_MESSAGE: 'receive_message',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  ERROR: 'socket_error',
} as const;
