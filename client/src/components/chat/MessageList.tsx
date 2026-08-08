import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useUiStore } from '../../store/ui.store';
import { MessageBubble } from './MessageBubble';
import { DayDivider } from './DayDivider';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../common/EmptyState';
import { MessageCircle } from 'lucide-react';

const NEAR_BOTTOM_THRESHOLD_PX = 150;
const HIGHLIGHT_DURATION_MS = 2000;

interface MessageListProps {
  chatId: string;
  isGroup: boolean;
  // Needed to derive "read by everyone" for group messages (reads.length vs member count).
  otherMembersCount?: number;
  // Active in-chat search term, if the search panel is open, so matches stay highlighted
  // in the message list itself (not just the results panel).
  searchTerm?: string;
}

export function MessageList({ chatId, isGroup, otherMembersCount, searchTerm }: MessageListProps) {
  const { user } = useAuth();
  const { messages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(chatId);
  const highlightedMessageId = useUiStore((s) => s.highlightedMessageId);
  const setHighlightedMessageId = useUiStore((s) => s.setHighlightedMessageId);

  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const pendingPrependRef = useRef(false);
  const isFirstLoadRef = useRef(true);
  const messageElementsRef = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [chatId]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          pendingPrependRef.current = true;
          prevScrollHeightRef.current = container.scrollHeight;
          fetchNextPage();
        }
      },
      { root: container, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Jumping to a search result takes priority over the normal scroll-position logic below.
  useEffect(() => {
    if (!highlightedMessageId) return;
    const el = messageElementsRef.current.get(highlightedMessageId);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });

    const timeout = setTimeout(() => setHighlightedMessageId(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [highlightedMessageId, setHighlightedMessageId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || highlightedMessageId) return;

    if (pendingPrependRef.current) {
      container.scrollTop += container.scrollHeight - prevScrollHeightRef.current;
      pendingPrependRef.current = false;
      return;
    }

    if (isFirstLoadRef.current) {
      if (messages.length > 0) {
        container.scrollTop = container.scrollHeight;
        isFirstLoadRef.current = false;
      }
      return;
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, highlightedMessageId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState icon={<MessageCircle size={32} />} title="No messages yet" description="Say hello!" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3">
      <div ref={topSentinelRef} />
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Spinner size="sm" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showDivider =
            !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
          const isOwn = message.senderId === user?.id;
          const showSenderName = isGroup && (!previous || previous.senderId !== message.senderId);

          return (
            <div
              key={message.id}
              ref={(el) => {
                if (el) messageElementsRef.current.set(message.id, el);
                else messageElementsRef.current.delete(message.id);
              }}
            >
              {showDivider && <DayDivider iso={message.createdAt} />}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showSenderName={showSenderName}
                otherMembersCount={isGroup ? otherMembersCount : undefined}
                isHighlighted={message.id === highlightedMessageId}
                highlightTerm={searchTerm}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
