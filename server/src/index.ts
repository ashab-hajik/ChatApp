import { createServer } from 'http';
import { createApp } from './app';
import { initSockets } from './sockets';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './services/prisma.service';

const app = createApp();
const httpServer = createServer(app);
initSockets(httpServer);

httpServer.listen(env.port, () => {
  logger.info(`Server listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
