import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1).max(100).optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscores and dots')
      .optional(),
    bio: z.string().trim().max(160).optional(),
    // Not `.url()` — profileImage is normally our own root-relative "/api/files/..." path.
    profileImage: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const searchUsersSchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
