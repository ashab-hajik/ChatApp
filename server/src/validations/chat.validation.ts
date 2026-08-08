import { z } from 'zod';

export const createPrivateChatSchema = z.object({
  userId: z.string().uuid('userId must be a valid id'),
});

export const messagesQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreatePrivateChatInput = z.infer<typeof createPrivateChatSchema>;
