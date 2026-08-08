import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatSocketBridge } from '../components/chat/ChatSocketBridge';
import { useUiStore } from '../store/ui.store';
import { useChats } from '../hooks/useChats';
import { requestNotificationPermission } from '../utils/notifications';

const BASE_TITLE = 'Chatly';

export function DashboardLayout() {
  const isMobileChatOpen = useUiStore((s) => s.isMobileChatOpen);
  const { data: chats } = useChats();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const totalUnread = chats?.reduce((sum, chat) => sum + chat.unreadCount, 0) ?? 0;
    document.title = totalUnread > 0 ? `(${totalUnread}) ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [chats]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <ChatSocketBridge />
      <aside
        className={clsx(
          'w-full shrink-0 border-r border-gray-200 md:block md:w-[380px]',
          isMobileChatOpen ? 'hidden' : 'block',
        )}
      >
        <Sidebar />
      </aside>

      <main
        className={clsx('min-w-0 flex-1', isMobileChatOpen ? 'block' : 'hidden md:block')}
      >
        <Outlet />
      </main>
    </div>
  );
}
