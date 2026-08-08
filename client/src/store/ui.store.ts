import { create } from 'zustand';

type SidebarView = 'chats' | 'groups';

interface UiState {
  // On mobile, only one pane (sidebar or active chat) is visible at a time.
  isMobileChatOpen: boolean;
  sidebarView: SidebarView;
  // The chat currently open in the message pane, if any — used to skip unread-count
  // bumps and to know which room to mark as read as messages stream in.
  activeChatId: string | null;
  // Set briefly when jumping to a search result, so MessageList can scroll to it and
  // flash it — then cleared once the flash finishes.
  highlightedMessageId: string | null;
  openMobileChat: () => void;
  closeMobileChat: () => void;
  setSidebarView: (view: SidebarView) => void;
  setActiveChatId: (chatId: string | null) => void;
  setHighlightedMessageId: (messageId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileChatOpen: false,
  sidebarView: 'chats',
  activeChatId: null,
  highlightedMessageId: null,
  openMobileChat: () => set({ isMobileChatOpen: true }),
  closeMobileChat: () => set({ isMobileChatOpen: false }),
  setSidebarView: (view) => set({ sidebarView: view }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  setHighlightedMessageId: (messageId) => set({ highlightedMessageId: messageId }),
}));
