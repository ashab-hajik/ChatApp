import { useState } from 'react';
import clsx from 'clsx';
import { Message } from '../../types/message';
import { formatMessageTime } from '../../utils/formatters';
import { toAbsoluteFileUrl } from '../../utils/constants';
import { MessageStatusTicks } from './MessageStatusTicks';
import { FileAttachment } from './FileAttachment';
import { ImageViewerModal } from './ImageViewerModal';
import { HighlightedText } from './HighlightedText';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName?: boolean;
  // Group chats only: number of other members, to derive "read by everyone" from
  // reads.length (Message.status only auto-flips to READ for 1-1 chats server-side).
  otherMembersCount?: number;
  // True for ~2s right after jumping here from a search result — briefly flashes the bubble.
  isHighlighted?: boolean;
  // The active in-chat search term, if any, so the matched substring stays highlighted
  // even outside the search results panel.
  highlightTerm?: string;
}

export function MessageBubble({
  message,
  isOwn,
  showSenderName,
  otherMembersCount,
  isHighlighted,
  highlightTerm,
}: MessageBubbleProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const effectiveStatus =
    otherMembersCount !== undefined && message.reads.length >= otherMembersCount && otherMembersCount > 0
      ? 'READ'
      : message.status;

  return (
    <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[75%] rounded-lg px-3 py-2 shadow-sm transition-colors duration-500',
          isHighlighted ? 'bg-yellow-100' : isOwn ? 'bg-brand-100 text-gray-900' : 'bg-white text-gray-900',
        )}
      >
        {showSenderName && !isOwn && (
          <p className="mb-0.5 text-xs font-semibold text-brand-600">{message.sender.fullName}</p>
        )}

        {message.type === 'IMAGE' && message.fileUrl && (
          <>
            <button type="button" onClick={() => setIsViewerOpen(true)} className="block">
              <img
                src={toAbsoluteFileUrl(message.fileUrl)}
                alt={message.content ?? 'Shared photo'}
                className="mb-1 max-h-72 max-w-full rounded-md object-cover"
              />
            </button>
            {isViewerOpen && (
              <ImageViewerModal
                src={toAbsoluteFileUrl(message.fileUrl)}
                downloadName={message.fileName ?? undefined}
                onClose={() => setIsViewerOpen(false)}
              />
            )}
          </>
        )}

        {message.type === 'FILE' && message.fileUrl && (
          <div className="mb-1">
            <FileAttachment
              fileUrl={message.fileUrl}
              fileName={message.fileName ?? 'File'}
              fileSize={message.fileSize ?? 0}
            />
          </div>
        )}

        {message.content && (
          <p className="whitespace-pre-wrap break-words text-sm">
            {highlightTerm ? <HighlightedText text={message.content} term={highlightTerm} /> : message.content}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[11px] text-gray-400">{formatMessageTime(message.createdAt)}</span>
          {isOwn && <MessageStatusTicks status={effectiveStatus} />}
        </div>
      </div>
    </div>
  );
}
