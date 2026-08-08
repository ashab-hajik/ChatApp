import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { OAuth2Client } from 'google-auth-library';
import { Request } from 'express';
import { env } from './env';
import { ApiError } from '../utils/ApiError';

const googleClient = new OAuth2Client(env.googleClientId);

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  profileImage?: string;
}

// 'google-id-token' verifies the ID token the frontend obtains via Google Identity Services
// (One Tap / Sign-In button) — this is the token-exchange flow used by POST /auth/google,
// as opposed to Passport's classic server-side redirect strategy.
passport.use(
  'google-id-token',
  new CustomStrategy(async (req: Request, done) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        return done(ApiError.badRequest('idToken is required'));
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        return done(ApiError.unauthorized('Invalid Google token'));
      }

      const profile: GoogleProfile = {
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name ?? payload.email.split('@')[0],
        profileImage: payload.picture,
      };

      return done(null, profile);
    } catch (error) {
      return done(ApiError.unauthorized('Google token verification failed'));
    }
  }),
);

export default passport;
