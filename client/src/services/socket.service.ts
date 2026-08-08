import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { getAccessToken } from './tokenStore';

let socket: Socket | null = null;

// The socket is created once and reused; `auth` is a function so socket.io-client calls
// it fresh on every (re)connect attempt, picking up a rotated access token automatically.
export function getSocket(): Socket {
  socket ??= io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (callback) => callback({ token: getAccessToken() }),
  });
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
