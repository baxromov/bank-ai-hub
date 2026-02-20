import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  notifications: any[];
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
}));
