import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageSpinner } from './FullPageSpinner';

// Blocks rendering until the app knows whether a session can be silently restored.
export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

// Authenticated users must finish choosing a name + username before reaching the app.
export function RequireCompleteProfile() {
  const { user } = useAuth();

  if (user && !user.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}

// Keeps logged-in users off the login screen; sends incomplete profiles to finish onboarding.
export function PublicOnly() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) return <FullPageSpinner />;
  if (isAuthenticated) {
    return <Navigate to={user?.profileComplete ? '/' : '/complete-profile'} replace />;
  }

  return <Outlet />;
}

// The complete-profile page itself should only be visible while there's actually
// something incomplete — otherwise send the user back into the app.
export function RequireIncompleteProfile() {
  const { user } = useAuth();

  if (user?.profileComplete) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
