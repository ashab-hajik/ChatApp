import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CompleteProfilePage } from './pages/auth/CompleteProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatWindowPage } from './pages/ChatWindowPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import {
  PublicOnly,
  RequireAuth,
  RequireCompleteProfile,
  RequireIncompleteProfile,
} from './components/common/RouteGuards';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route element={<PublicOnly />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<RequireIncompleteProfile />}>
                  <Route element={<AuthLayout />}>
                    <Route path="/complete-profile" element={<CompleteProfilePage />} />
                  </Route>
                </Route>

                <Route element={<RequireCompleteProfile />}>
                  <Route element={<DashboardLayout />}>
                    <Route index path="/" element={<DashboardPage />} />
                    <Route path="/chat/:chatId" element={<ChatWindowPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
