"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore"; // Adjust path as needed
import {
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/sidebar";

export default function ChatSidebar() {
  const {
    conversations,
    fetchConversations,
    deleteConversation,
    activeConversationId,
    setActiveConversation,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <div className="pt-8">
      <SidebarContent>
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations
              .filter((conv) => !conv.isDeleted)
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer group"
                >
                  <span className="text-sm truncate" title={conversation.title}>
                    {conversation.title}
                  </span>
                  <button
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))
          )}
        </div>
      </SidebarContent>
    </div>
  );
}
