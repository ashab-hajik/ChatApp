import { MessageCircle } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center bg-[#f0f2f5]">
      <EmptyState
        icon={<MessageCircle size={48} className="text-brand-500" />}
        title="Select a chat to start messaging"
        description="Or start a new conversation from the sidebar."
      />
    </div>
  );
}
