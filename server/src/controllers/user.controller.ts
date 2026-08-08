import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { getUserById, searchUsersByName, updateUserProfile } from '../services/user.service';

// GET /api/users/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.userId);
  return sendSuccess(res, 200, user);
});

// GET /api/users/search?q=
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '');
  if (!query.trim()) {
    throw ApiError.badRequest('Query parameter "q" is required');
  }
  const users = await searchUsersByName(query, req.user!.userId);
  return sendSuccess(res, 200, users);
});

// GET /api/users/:id
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, 200, user);
});

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserProfile(req.user!.userId, req.body);
  return sendSuccess(res, 200, user, 'Profile updated');
});
