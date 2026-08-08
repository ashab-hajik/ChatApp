import { AccessTokenPayload } from '../../services/token.service';

declare global {
  namespace Express {
    // Extends passport's (intentionally empty) Express.User interface so req.user is
    // strongly typed after our authenticate middleware runs, without redeclaring
    // Request.user (which @types/passport already declares as `User | undefined`).
    interface User extends AccessTokenPayload {}
  }
}

export {};
