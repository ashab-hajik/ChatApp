import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 to-brand-500 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-2xl text-white">
            💬
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Chatly</h1>
          <p className="text-sm text-gray-500">Real-time messaging, the WhatsApp way.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
