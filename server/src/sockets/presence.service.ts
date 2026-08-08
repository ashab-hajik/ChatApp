import { prisma } from '../services/prisma.service';

// A user can have multiple open sockets (multiple tabs/devices). We only consider them
// "offline" once every socket has disconnected.
const userSockets = new Map<string, Set<string>>();

export function registerSocket(userId: string, socketId: string): boolean {
  const sockets = userSockets.get(userId) ?? new Set<string>();
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  userSockets.set(userId, sockets);
  return wasOffline;
}

export function unregisterSocket(userId: string, socketId: string): boolean {
  const sockets = userSockets.get(userId);
  if (!sockets) return false;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true;
  }
  return false;
}

export function isUserOnline(userId: string): boolean {
  return (userSockets.get(userId)?.size ?? 0) > 0;
}

export function getSocketIdsForUsers(userIds: string[]): string[] {
  return userIds.flatMap((userId) => Array.from(userSockets.get(userId) ?? []));
}

export async function markUserOnline(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { isOnline: true } });
}

export async function markUserOffline(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeen: new Date() } });
}
