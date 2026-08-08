import { z } from 'zod';

export const sendMessageSchema = z.object({
  chatId: z.string().uuid(),
  type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
  content: z.string().max(4000).optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

export const markReadSchema = z.object({
  chatId: z.string().uuid(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
