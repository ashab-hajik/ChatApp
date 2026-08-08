import { Request, Response } from 'express';
import passport, { GoogleProfile } from '../config/passport';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { clearRefreshTokenCookie, REFRESH_COOKIE_NAME, setRefreshTokenCookie } from '../utils/cookies';
import {
  findOrCreateGoogleUser,
  issueSessionForUser,
  loginWithPassword,
  registerWithPassword,
} from '../services/auth.service';
import { revokeRefreshToken, rotateRefreshToken, signAccessToken } from '../services/token.service';
import { prisma } from '../services/prisma.service';
import { User } from '@prisma/client';

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    profileImage: user.profileImage,
    profileComplete: user.profileComplete,
  };
}

function authenticateWithGoogle(req: Request): Promise<GoogleProfile> {
  return new Promise((resolve, reject) => {
    passport.authenticate('google-id-token', { session: false }, (err: unknown, profile: unknown) => {
      if (err) return reject(err);
      if (!profile) return reject(ApiError.unauthorized('Google authentication failed'));
      resolve(profile as GoogleProfile);
    })(req, {} as Response, () => undefined);
  });
}

// POST /api/auth/google — exchanges a Google ID token (from Google Identity Services on the
// client) for our own access/refresh token pair. Creates the user on first login.
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authenticateWithGoogle(req);
  const user = await findOrCreateGoogleUser(profile);
  const { accessToken, refreshToken } = await issueSessionForUser(user.id, user.email);

  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, 200, { accessToken, user: toPublicUser(user) });
});

// POST /api/auth/register — email + username + password signup. Unlike the Google flow,
// this collects everything upfront, so the account is immediately "complete".
export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerWithPassword(req.body);
  const { accessToken, refreshToken } = await issueSessionForUser(user.id, user.email);

  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, 201, { accessToken, user: toPublicUser(user) });
});

// POST /api/auth/login — username-or-email + password.
export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = await loginWithPassword(req.body.identifier, req.body.password);
  const { accessToken, refreshToken } = await issueSessionForUser(user.id, user.email);

  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, 200, { accessToken, user: toPublicUser(user) });
});

// POST /api/auth/refresh — rotates the httpOnly refresh cookie and issues a new access token.
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized('Missing refresh token');
  }

  const rotated = await rotateRefreshToken(token);
  if (!rotated) {
    clearRefreshTokenCookie(res);
    throw ApiError.unauthorized('Refresh token expired or invalid');
  }

  const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
  if (!user) {
    clearRefreshTokenCookie(res);
    throw ApiError.unauthorized('User not found');
  }

  setRefreshTokenCookie(res, rotated.refreshToken);
  const accessToken = signAccessToken({ userId: user.id, email: user.email });

  return sendSuccess(res, 200, { accessToken });
});

// POST /api/auth/logout — revokes the refresh token and clears the cookie.
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    await revokeRefreshToken(token);
  }
  clearRefreshTokenCookie(res);
  return sendSuccess(res, 200, null, 'Logged out');
});
