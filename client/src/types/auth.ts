import { User } from './user';

export interface GoogleAuthResponse {
  accessToken: string;
  user: User;
}
