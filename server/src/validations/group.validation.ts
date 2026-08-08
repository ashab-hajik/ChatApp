import { z } from 'zod';

export const createGroupSchema = z.object({
  groupName: z.string().trim().min(1, 'Group name is required').max(100),
  memberIds: z.array(z.string().uuid()).min(1, 'Select at least one other member'),
  groupImage: z.string().optional(),
});

export const updateGroupSchema = z
  .object({
    groupName: z.string().trim().min(1).max(100).optional(),
    groupImage: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const addMembersSchema = z.object({
  memberIds: z.array(z.string().uuid()).min(1),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
