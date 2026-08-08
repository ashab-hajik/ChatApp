declare module 'passport-custom' {
  import { Request } from 'express';
  import { Strategy as PassportStrategy } from 'passport';

  type VerifyCallback = (error: unknown, user?: unknown, info?: unknown) => void;
  type VerifyFunction = (req: Request, done: VerifyCallback) => void;

  export class Strategy extends PassportStrategy {
    constructor(verify: VerifyFunction);
    name: string;
    authenticate(req: Request, options?: unknown): void;
  }
}
