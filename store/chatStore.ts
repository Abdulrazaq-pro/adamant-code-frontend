import { create } from "zustand";

interface Message {
  id: string;
  conversationId: string;
  content: string;
  isUser: boolean;
  sender?: string; 
  createdAt: string;
  pending?: boolean; 
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isDeleted: boolean;
  createdAt: string; 
  updatedAt: string;
}

interface ChatStore {
  generalLoading: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;

  conversationLoading: boolean;
  messageLoading: boolean; 
  messageLoadingMap: Record<string, boolean>; 

  createConversation: (title: string) => Promise<any>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (
    conversationId: string,
    content: string,
    isUser: boolean
  ) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;

  setConversationLoading: (loading: boolean) => void;
  setGeneralLoading: (loading: boolean) => void;
  setMessageLoading: (loading: boolean) => void; 
  setMessageLoadingForConversation: (conversationId: string, loading: boolean) => void;

  // Helper getters
  isMessageLoadingForConversation: (conversationId: string) => boolean; 
  isAnyMessageLoading: () => boolean; 
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  conversationLoading: false,
  generalLoading: false,
  messageLoading: false, 
  messageLoadingMap: {}, 

  setConversationLoading: (loading: boolean) => {
    set((state) => ({ ...state, conversationLoading: loading }));
  },

  setGeneralLoading: (loading: boolean) => {
    set((state) => ({ ...state, generalLoading: loading }));
  },

  setMessageLoading: (loading: boolean) => {
    set((state) => ({ ...state, messageLoading: loading }));
  },

  setMessageLoadingForConversation: (conversationId: string, loading: boolean) => {
    set((state) => ({
      ...state,
      messageLoadingMap: {
        ...state.messageLoadingMap,
        [conversationId]: loading,
      },
    }));
  },

  isMessageLoadingForConversation: (conversationId: string) => {
    const state = get();
    return state.messageLoadingMap[conversationId] || false;
  },

  isAnyMessageLoading: () => {
    const state = get();
    return state.messageLoading || Object.values(state.messageLoadingMap).some(Boolean);
  },

  createConversation: async (title?: string) => {
    set((state) => ({ ...state, conversationLoading: true }));

    try {
      const state = get();

      const hasEmptyConversation = state.conversations.some(
        (conv) => !conv.isDeleted && conv.messages.length === 0
      );

      if (hasEmptyConversation) {
        return {
          success: false,
          message: "You already have an empty conversation.",
        };
      }

      const finalTitle =
        typeof title === "string" && title.length > 0
          ? title
          : "New Conversation";

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: finalTitle }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create conversation: ${res.statusText}`);
      }

      const result = await res.json();

      if (result.success && result.data) {
        const now = new Date().toISOString();
        set((state) => ({
          ...state,
          conversations: [
            ...state.conversations,
            {
              ...result.data,
              messages: [],
              createdAt: result.data.createdAt || now,
              updatedAt: result.data.updatedAt || now,
            },
          ], // ensure messages field exists
        }));
      }

      return result;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      set((state) => ({ ...state, conversationLoading: false }));
    }
  },

  setActiveConversation: (conversationId: string | null) => {
    set({ activeConversationId: conversationId });
  },

  fetchConversations: async () => {
    set((state) => ({ ...state, generalLoading: true }));

    try {
      const res = await fetch("/api/conversations");

      if (!res.ok) {
        throw new Error(`Failed to fetch conversations: ${res.statusText}`);
      }

      const data = await res.json();

      set((state) => ({
        ...state,
        conversations: Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [],
      }));
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      set((state) => ({ ...state, conversations: [] }));
    } finally {
      set((state) => ({ ...state, generalLoading: false }));
    }
  },

  fetchMessages: async (conversationId: string) => {
    set((state) => ({ 
      ...state, 
      conversationLoading: true,
      messageLoading: true, 
      messageLoadingMap: {
        ...state.messageLoadingMap,
        [conversationId]: true, 
      },
    }));

    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }

      const messagesData = await res.json();

      const messages: Message[] = Array.isArray(messagesData.data)
        ? messagesData.data
        : Array.isArray(messagesData)
        ? messagesData
        : [];

      set((state) => ({
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...messages],
                updatedAt: new Date().toISOString(), 
              }
            : conv
        ),
      }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      throw error;
    } finally {
      set((state) => ({ 
        ...state, 
        conversationLoading: false,
        messageLoading: false, 
        messageLoadingMap: {
          ...state.messageLoadingMap,
          [conversationId]: false, 
        },
      }));
    }
  },

  addMessage: async (
    conversationId: string,
    content: string,
    isUser: boolean
  ) => {
    set((state) => ({ 
      ...state, 
      conversationLoading: true,
      messageLoading: true,
      messageLoadingMap: {
        ...state.messageLoadingMap,
        [conversationId]: true, 
      },
    }));

    const tempId = crypto.randomUUID();
    const sender = isUser ? "user" : "assistant";

    const tempUserMessage: Message = {
      id: tempId,
      conversationId,
      content,
      isUser: true, 
      sender: "user",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // Immediately update UI with temp user message
    const now = new Date().toISOString();
    set((state) => ({
      ...state,
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, tempUserMessage],
              updatedAt: now,
            }
          : conv
      ),
    }));

    try {
      // Step 2: Send message to API
      const res = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          conversationId,
          content,
          sender: "user",
          createdAt: tempUserMessage.createdAt,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to add message: ${res.statusText}`);
      }

      const responseData = await res.json();

      const aiResponse: Message = responseData.data; 

      set((state) => ({
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter((msg) => msg.id !== tempId),
                  { ...tempUserMessage, pending: false }, 
                  aiResponse, 
                ],
              }
            : conv
        ),
      }));

    } catch (error) {
      console.error("Failed to add message:", error);

      set((state) => ({
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.filter((msg) => msg.id !== tempId),
              }
            : conv
        ),
      }));

      throw error;
    } finally {
      set((state) => ({ 
        ...state, 
        conversationLoading: false,
        messageLoading: false, // New: Clear general message loading
        messageLoadingMap: {
          ...state.messageLoadingMap,
          [conversationId]: false, // New: Clear loading for this conversation
        },
      }));
    }
  },

  deleteConversation: async (conversationId: string) => {
    set((state) => ({ ...state, conversationLoading: true }));

    try {
      const res = await fetch(`/api/conversations?id=${conversationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete conversation: ${res.statusText}`);
      }

      const result = await res.json();

      if (result.success) {
        set((state) => {
          const { [conversationId]: removedLoading, ...remainingLoadingMap } = state.messageLoadingMap;
          
          return {
            ...state,
            conversations: state.conversations.filter(
              (conv) => conv.id !== conversationId
            ),
            activeConversationId:
              state.activeConversationId === conversationId
                ? null
                : state.activeConversationId,
            messageLoadingMap: remainingLoadingMap,
          };
        });
      }

      return { ...result };
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      set((state) => ({ ...state, conversationLoading: false }));
    }
  },
}));