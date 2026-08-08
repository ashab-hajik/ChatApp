import bcrypt from 'bcryptjs';
import { prisma } from './prisma.service';
import { GoogleProfile } from '../config/passport';
import { issueRefreshToken, signAccessToken } from './token.service';
import { ApiError } from '../utils/ApiError';
import { RegisterInput } from '../validations/auth.validation';

const BCRYPT_SALT_ROUNDS = 12;

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const user = await prisma.user.upsert({
    where: { googleId: profile.googleId },
    update: {
      // Keep the Google avatar in sync only until the user sets a custom one manually.
      email: profile.email,
    },
    create: {
      googleId: profile.googleId,
      email: profile.email,
      fullName: profile.fullName,
      profileImage: profile.profileImage,
    },
  });

  return user;
}

export async function issueSessionForUser(userId: string, email: string) {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = await issueRefreshToken(userId);
  return { accessToken, refreshToken };
}

export async function registerWithPassword(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    const field = existing.email === input.email ? 'email' : 'username';
    throw ApiError.conflict(`That ${field} is already taken`);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      fullName: input.fullName,
      passwordHash,
      // Registration collects name + username upfront, so there's nothing left to
      // complete — unlike the Google flow, which only gets an email and a display name.
      profileComplete: true,
    },
  });
}

export async function loginWithPassword(identifier: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }] },
  });

  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid username/email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid username/email or password');
  }

  return user;
}
