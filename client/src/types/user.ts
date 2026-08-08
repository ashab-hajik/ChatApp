export interface User {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  bio?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  profileComplete: boolean;
  createdAt?: string;
}
