import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useTypingEmitter } from '../../hooks/useTypingEmitter';
import { messagesQueryKey } from '../../hooks/useMessages';
import { chatsQueryKey } from '../../hooks/useChats';
import { Message, MessagesPage, MessageType } from '../../types/message';
import { ChatSummary } from '../../types/chat';
import { uploadFile } from '../../services/upload.service';
import { ACCEPTED_UPLOAD_TYPES } from '../../utils/constants';
import { AttachmentPreview } from './AttachmentPreview';

export function MessageInput({ chatId }: { chatId: string }) {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const { notifyTyping, stopTyping } = useTypingEmitter(chatId);

  useEffect(() => {
    if (!attachment || !attachment.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(attachment);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    e.target.value = '';
  }

  function cancelAttachment() {
    setAttachment(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if ((!content && !attachment) || isSending) return;

    stopTyping();
    setIsSending(true);
    const attachmentToSend = attachment;
    setValue('');
    setAttachment(null);

    try {
      let message: Message;

      if (attachmentToSend) {
        const uploaded = await uploadFile(attachmentToSend);
        message = await sendMessage({
          chatId,
          type: uploaded.type as MessageType,
          content: content || undefined,
          fileUrl: uploaded.fileUrl,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
        });
      } else {
        message = await sendMessage({ chatId, type: 'TEXT', content });
      }

      appendSentMessage(queryClient, message);
    } catch {
      setValue(content);
      setAttachment(attachmentToSend);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div>
      {attachment && (
        <AttachmentPreview file={attachment} previewUrl={previewUrl} onCancel={cancelAttachment} />
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <Paperclip size={20} />
        </button>

        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.trim()) notifyTyping();
            else stopTyping();
          }}
          placeholder={attachment ? 'Add a caption (optional)' : 'Type a message'}
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <button
          type="submit"
          disabled={(!value.trim() && !attachment) || isSending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

// The sender's own message won't come back through 'receive_message' (that's only
// broadcast to other sockets), so we append it to the cache ourselves from the send ack.
function appendSentMessage(queryClient: ReturnType<typeof useQueryClient>, message: Message) {
  queryClient.setQueryData<InfiniteData<MessagesPage>>(messagesQueryKey(message.chatId), (old) => {
    if (!old || old.pages.length === 0) {
      return {
        pages: [{ messages: [message], nextCursor: null }],
        pageParams: [undefined],
      };
    }
    const pages = [...old.pages];
    pages[0] = { ...pages[0], messages: [...pages[0].messages, message] };
    return { ...old, pages };
  });

  queryClient.setQueryData<ChatSummary[]>(chatsQueryKey, (old) => {
    if (!old) return old;
    const updated = old.map((chat) =>
      chat.id === message.chatId ? { ...chat, lastMessage: message, updatedAt: message.createdAt } : chat,
    );
    return [...updated].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });
}
