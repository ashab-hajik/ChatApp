import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: Set<string>;
  lastSeenByUserId: Record<string, string>;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string, lastSeen: string) => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),
  lastSeenByUserId: {},

  setUserOnline: (userId) =>
    set((state) => ({ onlineUserIds: new Set(state.onlineUserIds).add(userId) })),

  setUserOffline: (userId, lastSeen) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return {
        onlineUserIds: next,
        lastSeenByUserId: { ...state.lastSeenByUserId, [userId]: lastSeen },
      };
    }),

  isOnline: (userId) => get().onlineUserIds.has(userId),
}));
