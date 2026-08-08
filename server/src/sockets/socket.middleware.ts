import { Socket } from 'socket.io';
import { verifyAccessToken } from '../services/token.service';

export interface SocketData {
  userId: string;
  email: string;
  // Populated by handleConnect (one query per connection) so typing events don't need
  // a DB round-trip on every keystroke.
  fullName?: string | null;
}

type NextFn = (err?: Error) => void;

// Authenticates the Socket.IO handshake using the same JWT access token used for REST calls.
// The frontend passes it as `auth: { token }` when constructing the socket.
export function socketAuthMiddleware(socket: Socket, next: NextFn) {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    return next(new Error('Authentication token is required'));
  }

  try {
    const payload = verifyAccessToken(token);
    (socket.data as SocketData).userId = payload.userId;
    (socket.data as SocketData).email = payload.email;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}
