import { prisma } from './prisma.service';
import { ApiError } from '../utils/ApiError';
import { UpdateProfileInput } from '../validations/user.validation';

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  profileImage: true,
  bio: true,
  isOnline: true,
  lastSeen: true,
  profileComplete: true,
  createdAt: true,
} as const;

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_FIELDS });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

export async function searchUsersByName(query: string, excludeUserId: string) {
  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      profileComplete: true,
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: PUBLIC_USER_FIELDS,
    take: 20,
  });
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  if (input.username) {
    const taken = await prisma.user.findFirst({
      where: { username: input.username, id: { not: userId } },
      select: { id: true },
    });
    if (taken) {
      throw ApiError.conflict('Username is already taken');
    }
  }

  const current = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  const willHaveUsername = input.username ?? current?.username;

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...input,
      profileComplete: Boolean(willHaveUsername),
    },
    select: PUBLIC_USER_FIELDS,
  });
}
