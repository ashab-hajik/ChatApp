import { Search, X } from 'lucide-react';
import { useChatSearch } from '../../hooks/useChatSearch';
import { useJumpToMessage } from '../../hooks/useJumpToMessage';
import { HighlightedText } from './HighlightedText';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../common/EmptyState';
import { formatChatListTime } from '../../utils/formatters';

interface ChatSearchPanelProps {
  chatId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}

export function ChatSearchPanel({ chatId, query, onQueryChange, onClose }: ChatSearchPanelProps) {
  const { data: results, isLoading } = useChatSearch(chatId, query);
  const jumpToMessage = useJumpToMessage(chatId);

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 p-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search messages and files in this chat"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <X size={18} />
        </button>
      </div>

      {query.trim() && (
        <div className="max-h-72 overflow-y-auto border-t border-gray-100">
          {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}

          {!isLoading && results?.length === 0 && (
            <EmptyState title="No matches" description="Try a different search term." />
          )}

          {results?.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => jumpToMessage(message.id)}
              className="flex w-full flex-col gap-0.5 border-b border-gray-50 px-4 py-2 text-left hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-700">{message.sender.fullName}</span>
                <span className="shrink-0 text-[11px] text-gray-400">
                  {formatChatListTime(message.createdAt)}
                </span>
              </div>
              <p className="truncate text-sm text-gray-600">
                {message.type === 'TEXT' ? (
                  <HighlightedText text={message.content ?? ''} term={query} />
                ) : (
                  <>
                    📎 <HighlightedText text={message.fileName ?? 'File'} term={query} />
                  </>
                )}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
