import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';
import {
  loginWithGoogle,
  loginWithPassword as loginWithPasswordRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
  RegisterPayload,
} from '../services/auth.service';
import { getMe } from '../services/user.service';
import { registerAuthFailureHandler, setAccessToken } from '../services/tokenStore';

interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  loginWithGoogleIdToken: (idToken: string) => Promise<User>;
  loginWithPassword: (identifier: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthFailureHandler(clearSession);
  }, [clearSession]);

  // On first load there's no in-memory access token yet (it isn't persisted across reloads
  // by design). Try the httpOnly refresh cookie to silently restore the session.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const accessToken = await refreshSession();
        if (cancelled) return;
        setAccessToken(accessToken);
        const me = await getMe();
        if (cancelled) return;
        setUser(me);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const loginWithGoogleIdToken = useCallback(async (idToken: string) => {
    const { accessToken, user: loggedInUser } = await loginWithGoogle(idToken);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const loginWithPassword = useCallback(async (identifier: string, password: string) => {
    const { accessToken, user: loggedInUser } = await loginWithPasswordRequest(identifier, password);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { accessToken, user: registeredUser } = await registerRequest(payload);
    setAccessToken(accessToken);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isBootstrapping,
        isAuthenticated: !!user,
        loginWithGoogleIdToken,
        loginWithPassword,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
