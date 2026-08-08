import { Check, CheckCheck } from 'lucide-react';
import { MessageStatus } from '../../types/message';

export function MessageStatusTicks({ status }: { status: MessageStatus }) {
  if (status === 'SENT') return <Check size={16} className="text-gray-400" />;
  if (status === 'DELIVERED') return <CheckCheck size={16} className="text-gray-400" />;
  return <CheckCheck size={16} className="text-sky-400" />;
}
