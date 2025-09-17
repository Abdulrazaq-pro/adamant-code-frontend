import { create } from "zustand";

interface Message {
  id: string;
  conversationId: string;
  content: string;
  isUser: boolean; // Your local format
  sender?: string; // API format (optional)
  createdAt: string;
  pending?: boolean; // Optional flag for optimistic updates
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isDeleted: boolean;
  createdAt: string; // Add this
  updatedAt: string; // Add this
}

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  // Loading states
  conversationLoading: boolean;
  generalLoading: boolean;
  // Actions
  createConversation: (title: string) => Promise<any>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (
    conversationId: string,
    content: string,
    isUser: boolean
  ) => Promise<Message>; // ✅ Changed from Promise<void> to Promise<Message>
  deleteConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  // Loading state setters
  setConversationLoading: (loading: boolean) => void;
  setGeneralLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  conversationLoading: false,
  generalLoading: false,

  // Loading state setters
  setConversationLoading: (loading: boolean) => {
    set((state) => ({ ...state, conversationLoading: loading }));
  },

  setGeneralLoading: (loading: boolean) => {
    set((state) => ({ ...state, generalLoading: loading }));
  },

  createConversation: async (title?: string) => {
    set((state) => ({ ...state, conversationLoading: true }));
    try {
      const state = get();
      // ✅ Check if there's already an empty conversation (no messages)
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
      // Use spread operator to properly update state
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
    set((state) => ({ ...state, conversationLoading: true }));
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }
      const messagesData = await res.json();
      // Handle different response formats and use spread operator
      const messages: Message[] = Array.isArray(messagesData.data)
        ? messagesData.data
        : Array.isArray(messagesData)
        ? messagesData
        : [];
      // Update conversation with spread operator to maintain immutability
      set((state) => ({
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? { 
                ...conv, 
                messages: [...messages],
                updatedAt: new Date().toISOString() // Update timestamp when messages are fetched
              }
            : conv
        ),
      }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      throw error;
    } finally {
      set((state) => ({ ...state, conversationLoading: false }));
    }
  },

  addMessage: async (
    conversationId: string,
    content: string,
    isUser: boolean
  ) => {
    // Set loading state for message operations
    set((state) => ({ ...state, conversationLoading: true }));
    // Step 1: Create a temporary optimistic message
    const tempId = crypto.randomUUID();
    const sender = isUser ? "user" : "assistant";
    const tempMessage: Message = {
      id: tempId,
      conversationId,
      content,
      isUser,
      sender,
      createdAt: new Date().toISOString(),
      pending: true, // custom flag
    };
    // Immediately update UI with temp message and update conversation timestamp
    const now = new Date().toISOString();
    set((state) => ({
      ...state,
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { 
              ...conv, 
              messages: [...conv.messages, tempMessage],
              updatedAt: now // Update timestamp when adding message
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
          sender,
          createdAt: tempMessage.createdAt,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Failed to add message: ${res.statusText}`);
      }
      const responseData = await res.json();
      // Step 3: Build confirmed message from API response
      const confirmedMessage: Message = {
        id: responseData.id || tempId, // replace with real ID if given
        conversationId,
        content,
        isUser,
        sender,
        createdAt: responseData.createdAt || tempMessage.createdAt,
      };
      // Replace the temp message with the confirmed one
      set((state) => ({
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === tempId ? confirmedMessage : msg
                ),
              }
            : conv
        ),
      }));
      return confirmedMessage;
    } catch (error) {
      console.error("Failed to add message:", error);
      // Step 4: Roll back — remove the temp message
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
      set((state) => ({ ...state, conversationLoading: false }));
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
        // Use spread operator for state updates
        set((state) => ({
          ...state,
          conversations: state.conversations.filter(
            (conv) => conv.id !== conversationId
          ),
          // Reset active conversation if it was deleted
          activeConversationId:
            state.activeConversationId === conversationId
              ? null
              : state.activeConversationId,
        }));
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