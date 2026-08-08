import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../events';
import { SocketData } from '../socket.middleware';
import { chatRoomName, getChatIdsForUser } from '../../services/chat.service';
import { markUserOffline, markUserOnline, registerSocket, unregisterSocket } from '../presence.service';
import { prisma } from '../../services/prisma.service';
import { logger } from '../../utils/logger';

// Joins every chat room the user already belongs to, and — if this is their only open
// connection — flips them online and tells the other members of those chats.
export async function handleConnect(io: Server, socket: Socket) {
  const data = socket.data as SocketData;
  const { userId } = data;
  const isFirstConnection = registerSocket(userId, socket.id);

  const [chatIds, user] = await Promise.all([
    getChatIdsForUser(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } }),
  ]);
  data.fullName = user?.fullName;
  chatIds.forEach((chatId) => socket.join(chatRoomName(chatId)));

  if (isFirstConnection) {
    await markUserOnline(userId);
    chatIds.forEach((chatId) => {
      io.to(chatRoomName(chatId)).emit(SocketEvents.USER_ONLINE, { userId });
    });
  }

  socket.on('disconnect', () => {
    handleDisconnect(io, socket).catch((error) => logger.error('Disconnect handler failed', error));
  });
}

async function handleDisconnect(io: Server, socket: Socket) {
  const { userId } = socket.data as SocketData;
  const isFullyOffline = unregisterSocket(userId, socket.id);

  if (isFullyOffline) {
    await markUserOffline(userId);
    // Re-fetched (rather than reusing the connect-time list) in case the user joined
    // additional chat rooms during this session.
    const chatIds = await getChatIdsForUser(userId);
    const lastSeen = new Date().toISOString();
    chatIds.forEach((chatId) => {
      io.to(chatRoomName(chatId)).emit(SocketEvents.USER_OFFLINE, { userId, lastSeen });
    });
  }
}
