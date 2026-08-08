import { create } from 'zustand';

interface TypingState {
  // chatId -> userId -> display name
  typingByChatId: Record<string, Record<string, string>>;
  setTyping: (chatId: string, userId: string, fullName: string) => void;
  clearTyping: (chatId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingByChatId: {},

  setTyping: (chatId, userId, fullName) =>
    set((state) => ({
      typingByChatId: {
        ...state.typingByChatId,
        [chatId]: { ...state.typingByChatId[chatId], [userId]: fullName },
      },
    })),

  clearTyping: (chatId, userId) =>
    set((state) => {
      const current = state.typingByChatId[chatId];
      if (!current || !(userId in current)) return state;
      const next = { ...current };
      delete next[userId];
      return { typingByChatId: { ...state.typingByChatId, [chatId]: next } };
    }),
}));
