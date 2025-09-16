import { create } from "zustand";

interface Message {
  id: string;
  conversationId: string;
  content: string;
  isUser: boolean; // Your local format
  sender?: string; // API format (optional)
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isDeleted: boolean;
}

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;



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
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  createConversation: async (title?: string) => {
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
        set((state) => ({
          ...state,
          conversations: [
            ...state.conversations,
            { ...result.data, messages: [] },
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
    }
  },

  setActiveConversation: (conversationId: string | null) => {
    set({ activeConversationId: conversationId });
  },

  fetchConversations: async () => {
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
    }
  },

  fetchMessages: async (conversationId: string) => {
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
            ? { ...conv, messages: [...messages] }
            : conv
        ),
      }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      throw error;
    }
  },

  addMessage: async (
    conversationId: string,
    content: string,
    isUser: boolean
  ) => {
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

    // Immediately update UI with temp message
    set((state) => ({
      ...state,
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, tempMessage] }
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
    }
  },

  deleteConversation: async (conversationId: string) => {
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
    }
  },
}));
