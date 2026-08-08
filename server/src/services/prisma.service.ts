import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Single shared PrismaClient instance (avoids exhausting DB connections in dev with tsx watch).
export const prisma = new PrismaClient({
  log: env.isProduction ? ['error', 'warn'] : ['error', 'warn'],
});
