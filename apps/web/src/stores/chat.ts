import { create } from "zustand";

interface ChatState {
  activeSessionId: string | null;
  sessions: any[];
  messages: any[];
  isStreaming: boolean;
  setActiveSession: (id: string | null) => void;
  setSessions: (sessions: any[]) => void;
  setMessages: (messages: any[]) => void;
  addMessage: (message: any) => void;
  setStreaming: (streaming: boolean) => void;
  appendToLastMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeSessionId: null,
  sessions: [],
  messages: [],
  isStreaming: false,

  setActiveSession: (id) => set({ activeSessionId: id }),
  setSessions: (sessions) => set({ sessions }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  appendToLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = {
          ...msgs[msgs.length - 1],
          content: msgs[msgs.length - 1].content + content,
        };
      }
      return { messages: msgs };
    }),
}));
