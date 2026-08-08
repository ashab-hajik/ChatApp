import { z } from 'zod';

export const completeProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscores and dots are allowed'),
});

export type CompleteProfileForm = z.infer<typeof completeProfileSchema>;

export const editProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscores and dots are allowed'),
  bio: z.string().trim().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
});

export type EditProfileForm = z.infer<typeof editProfileSchema>;

const usernameField = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscores and dots are allowed');

const passwordField = z.string().min(8, 'Password must be at least 8 characters').max(72);

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  username: usernameField,
  password: passwordField,
});

export type RegisterForm = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginForm = z.infer<typeof loginSchema>;
