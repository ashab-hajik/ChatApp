import { Server as SocketIOServer } from 'socket.io';

// Lets REST controllers (e.g. sending a message over HTTP rather than a live socket)
// broadcast through the same Socket.IO server instance created in sockets/index.ts.
let ioInstance: SocketIOServer | null = null;

export function setIO(io: SocketIOServer) {
  ioInstance = io;
}

export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet');
  }
  return ioInstance;
}
