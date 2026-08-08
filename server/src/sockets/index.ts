import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { socketAuthMiddleware } from './socket.middleware';
import { handleConnect } from './handlers/presence.handler';
import { registerChatRoomHandlers } from './handlers/chatRoom.handler';
import { registerMessageHandlers } from './handlers/message.handler';
import { registerTypingHandlers } from './handlers/typing.handler';
import { setIO } from './io';
import { logger } from '../utils/logger';

export function initSockets(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  setIO(io);
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    handleConnect(io, socket).catch((error) => logger.error('Socket connect handler failed', error));
    registerChatRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(socket);
  });

  return io;
}
