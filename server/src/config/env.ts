import { config } from 'dotenv';

config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
const devOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  clientUrl,
  corsOrigins: process.env.NODE_ENV === 'production'
    ? [clientUrl]
    : [clientUrl, devOriginPattern],

  databaseUrl: required('DATABASE_URL'),

  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  googleClientId: required('GOOGLE_CLIENT_ID'),

  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 15),

  isProduction: process.env.NODE_ENV === 'production',
};
