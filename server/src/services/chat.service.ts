import { prisma } from './prisma.service';
import { ApiError } from '../utils/ApiError';

const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  profileImage: true,
  isOnline: true,
  lastSeen: true,
} as const;

export function chatRoomName(chatId: string) {
  return `chat:${chatId}`;
}

export async function touchChat(chatId: string) {
  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
}

export async function getOrCreatePrivateChat(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    throw ApiError.badRequest('Cannot start a chat with yourself');
  }

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) {
    throw ApiError.notFound('User not found');
  }

  const existing = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      members: { some: { userId } },
      AND: { members: { some: { userId: otherUserId } } },
    },
  });

  if (existing) return existing;

  return prisma.chat.create({
    data: {
      isGroup: false,
      createdBy: userId,
      members: {
        create: [{ userId, role: 'MEMBER' }, { userId: otherUserId, role: 'MEMBER' }],
      },
    },
  });
}

export async function listChatsForUser(userId: string) {
  const chats = await prisma.chat.findMany({
    where: { members: { some: { userId, deletedAt: null } } },
    include: {
      members: { include: { user: { select: PUBLIC_USER_SELECT } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await prisma.message.count({
        where: { chatId: chat.id, senderId: { not: userId }, reads: { none: { userId } } },
      });

      const otherMember = chat.isGroup ? null : chat.members.find((m) => m.userId !== userId);

      return {
        id: chat.id,
        isGroup: chat.isGroup,
        groupName: chat.groupName,
        groupImage: chat.groupImage,
        otherUser: otherMember?.user ?? null,
        members: chat.isGroup ? chat.members.map((m) => ({ ...m.user, role: m.role })) : undefined,
        lastMessage: chat.messages[0] ?? null,
        unreadCount,
        updatedAt: chat.updatedAt,
      };
    }),
  );
}

export async function getChatForUser(chatId: string, userId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, members: { some: { userId } } },
    include: { members: { include: { user: { select: PUBLIC_USER_SELECT } } } },
  });

  if (!chat) {
    throw ApiError.notFound('Chat not found');
  }

  const otherMember = chat.isGroup ? null : chat.members.find((m) => m.userId !== userId);

  return {
    id: chat.id,
    isGroup: chat.isGroup,
    groupName: chat.groupName,
    groupImage: chat.groupImage,
    otherUser: otherMember?.user ?? null,
    members: chat.isGroup ? chat.members.map((m) => ({ ...m.user, role: m.role })) : undefined,
  };
}

interface CreateGroupInput {
  groupName: string;
  memberIds: string[];
  groupImage?: string;
}

export async function createGroupChat(creatorId: string, input: CreateGroupInput) {
  const memberIds = Array.from(new Set([creatorId, ...input.memberIds]));
  if (memberIds.length < 2) {
    throw ApiError.badRequest('A group needs at least 1 other member');
  }

  return prisma.chat.create({
    data: {
      isGroup: true,
      groupName: input.groupName,
      groupImage: input.groupImage,
      createdBy: creatorId,
      members: {
        create: memberIds.map((userId) => ({
          userId,
          role: userId === creatorId ? 'ADMIN' : 'MEMBER',
        })),
      },
    },
  });
}

async function requireGroupAdmin(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || !chat.isGroup) {
    throw ApiError.notFound('Group not found');
  }

  const membership = await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId } },
  });
  if (!membership) {
    throw ApiError.forbidden('You are not a member of this group');
  }
  if (membership.role !== 'ADMIN') {
    throw ApiError.forbidden('Only group admins can do this');
  }

  return chat;
}

async function requireGroupMembership(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || !chat.isGroup) {
    throw ApiError.notFound('Group not found');
  }
  const isMember = await isChatMember(chatId, userId);
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this group');
  }
  return chat;
}

export async function updateGroupInfo(
  chatId: string,
  userId: string,
  input: { groupName?: string; groupImage?: string },
) {
  await requireGroupMembership(chatId, userId);
  return prisma.chat.update({ where: { id: chatId }, data: input });
}

export async function addGroupMembers(chatId: string, adminId: string, newUserIds: string[]) {
  await requireGroupAdmin(chatId, adminId);

  const existing = await prisma.chatMember.findMany({
    where: { chatId, userId: { in: newUserIds } },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((m) => m.userId));
  const toAdd = newUserIds.filter((id) => !existingIds.has(id));

  if (toAdd.length === 0) return getChatForUser(chatId, adminId);

  await prisma.chatMember.createMany({
    data: toAdd.map((userId) => ({ chatId, userId, role: 'MEMBER' as const })),
  });

  return getChatForUser(chatId, adminId);
}

export async function removeGroupMember(chatId: string, adminId: string, targetUserId: string) {
  if (adminId === targetUserId) {
    throw ApiError.badRequest('Use the leave-group endpoint to remove yourself');
  }
  await requireGroupAdmin(chatId, adminId);

  await prisma.chatMember.delete({
    where: { chatId_userId: { chatId, userId: targetUserId } },
  });

  return getChatForUser(chatId, adminId);
}

export async function leaveGroup(chatId: string, userId: string) {
  const chat = await requireGroupMembership(chatId, userId);
  const membership = await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId } },
  });

  await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });

  if (membership?.role === 'ADMIN') {
    const remainingAdmins = await prisma.chatMember.count({ where: { chatId, role: 'ADMIN' } });
    if (remainingAdmins === 0) {
      const nextInLine = await prisma.chatMember.findFirst({
        where: { chatId },
        orderBy: { joinedAt: 'asc' },
      });
      if (nextInLine) {
        await prisma.chatMember.update({
          where: { id: nextInLine.id },
          data: { role: 'ADMIN' },
        });
      }
    }
  }

  return chat;
}

export async function deleteChatForUser(chatId: string, userId: string) {
  const membership = await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId } },
  });
  if (!membership) {
    throw ApiError.notFound('Chat not found');
  }

  await prisma.chatMember.update({
    where: { id: membership.id },
    data: { deletedAt: new Date() },
  });
}

// Brings a chat back into any member's list who had previously "deleted" it — mirrors
// WhatsApp's behavior where a new message un-hides a chat you'd removed.
export async function reviveChatForAllMembers(chatId: string) {
  await prisma.chatMember.updateMany({
    where: { chatId, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
}

export async function getChatIdsForUser(userId: string): Promise<string[]> {
  const memberships = await prisma.chatMember.findMany({
    where: { userId },
    select: { chatId: true },
  });
  return memberships.map((m) => m.chatId);
}

export async function isChatMember(chatId: string, userId: string): Promise<boolean> {
  const membership = await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId } },
  });
  return membership !== null;
}
