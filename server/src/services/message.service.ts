import { prisma } from './prisma.service';
import { ApiError } from '../utils/ApiError';
import { isChatMember, reviveChatForAllMembers, touchChat } from './chat.service';
import { isUserOnline } from '../sockets/presence.service';
import { MessageType } from '@prisma/client';

const MESSAGE_INCLUDE = {
  sender: {
    select: { id: true, username: true, fullName: true, profileImage: true },
  },
  reads: { select: { userId: true, readAt: true } },
} as const;

interface CreateMessageInput {
  chatId: string;
  senderId: string;
  type?: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export async function createMessage(input: CreateMessageInput) {
  const isMember = await isChatMember(input.chatId, input.senderId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this chat');
  }

  const otherMembers = await prisma.chatMember.findMany({
    where: { chatId: input.chatId, userId: { not: input.senderId } },
    select: { userId: true },
  });
  const anyRecipientOnline = otherMembers.some((m) => isUserOnline(m.userId));

  const message = await prisma.message.create({
    data: {
      chatId: input.chatId,
      senderId: input.senderId,
      type: input.type ?? 'TEXT',
      content: input.content,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      status: anyRecipientOnline ? 'DELIVERED' : 'SENT',
    },
    include: MESSAGE_INCLUDE,
  });

  await touchChat(input.chatId);
  await reviveChatForAllMembers(input.chatId);

  return message;
}

interface GetMessagesOptions {
  cursor?: string;
  limit?: number;
}

export async function getMessages(chatId: string, userId: string, options: GetMessagesOptions = {}) {
  const isMember = await isChatMember(chatId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this chat');
  }

  const limit = Math.min(options.limit ?? 30, 100);

  const messages = await prisma.message.findMany({
    where: {
      chatId,
      ...(options.cursor ? { createdAt: { lt: new Date(options.cursor) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: MESSAGE_INCLUDE,
  });

  const nextCursor =
    messages.length === limit ? messages[messages.length - 1].createdAt.toISOString() : null;

  return { messages: messages.reverse(), nextCursor };
}

export async function searchMessagesInChat(chatId: string, userId: string, query: string) {
  const isMember = await isChatMember(chatId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this chat');
  }

  return prisma.message.findMany({
    where: {
      chatId,
      OR: [
        { content: { contains: query, mode: 'insensitive' } },
        { fileName: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: MESSAGE_INCLUDE,
  });
}

// Loads a window of messages centered on `messageId` — used to jump to a search result
// that may be far outside whatever page the infinite-scroll list currently has loaded.
export async function getMessagesAround(chatId: string, userId: string, messageId: string, radius = 15) {
  const isMember = await isChatMember(chatId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this chat');
  }

  const target = await prisma.message.findFirst({
    where: { id: messageId, chatId },
    include: MESSAGE_INCLUDE,
  });
  if (!target) {
    throw ApiError.notFound('Message not found');
  }

  const [before, after] = await Promise.all([
    prisma.message.findMany({
      where: { chatId, createdAt: { lt: target.createdAt } },
      orderBy: { createdAt: 'desc' },
      take: radius,
      include: MESSAGE_INCLUDE,
    }),
    prisma.message.findMany({
      where: { chatId, createdAt: { gt: target.createdAt } },
      orderBy: { createdAt: 'asc' },
      take: radius,
      include: MESSAGE_INCLUDE,
    }),
  ]);

  const messages = [...before.reverse(), target, ...after];
  const nextCursor = before.length === radius ? messages[0].createdAt.toISOString() : null;

  return { messages, nextCursor, targetMessageId: messageId };
}

export async function markChatAsRead(chatId: string, userId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, members: { some: { userId } } },
    select: { id: true, isGroup: true },
  });
  if (!chat) {
    throw ApiError.notFound('Chat not found');
  }

  const unreadMessages = await prisma.message.findMany({
    where: { chatId, senderId: { not: userId }, reads: { none: { userId } } },
    select: { id: true },
  });

  if (unreadMessages.length === 0) {
    return { readMessageIds: [] as string[] };
  }

  const messageIds = unreadMessages.map((m) => m.id);

  await prisma.messageRead.createMany({
    data: messageIds.map((messageId) => ({ messageId, userId })),
    skipDuplicates: true,
  });

  // Status is unambiguous for a 1-1 chat (exactly one other recipient); group read
  // status is tracked purely via MessageRead rows and refined in Phase 7.
  if (!chat.isGroup) {
    await prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { status: 'READ' },
    });
  }

  return { readMessageIds: messageIds };
}
