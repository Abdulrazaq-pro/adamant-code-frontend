"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { useChatModalStore } from "@/store/chatModalStore";
import { SidebarContent, SidebarHeader } from "@/components/sidebar";
import Modal from "@/components/Modal";

export default function ChatSidebar() {
  const router = useRouter();

  const {
    conversations,
    fetchConversations,
    deleteConversation,
    createConversation,
    activeConversationId,
    setActiveConversation,
  } = useChatStore();

  const {
    isModalOpen,
    selectedConvId,
    selectedConvTitle,
    openModal,
    closeModal,
  } = useChatModalStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 1) Build a nameMap using createdAt (oldest => Conversation 1)
  // 2) Build a display list sorted by updatedAt (newest first)
  const { nameMap, displayList } = useMemo(() => {
    const nonDeleted = (conversations || []).filter((c) => !c.isDeleted);

    // name map by createdAt ascending (oldest -> newest)
    const sortedByCreated = [...nonDeleted].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const map = new Map<string, string>();
    sortedByCreated.forEach((conv, i) => {
      map.set(conv.id, `Conversation ${i + 1}`);
    });

    // display order by updatedAt descending (newest -> oldest)
    const sortedByUpdated = [...nonDeleted].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return { nameMap: map, displayList: sortedByUpdated };
  }, [conversations]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConvId) return;
    try {
      await deleteConversation(selectedConvId);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      closeModal();
    }
  };

  // New chat: navigate to home (you asked for this behavior)
  const handleNewChat = () => {
    router.push("/");
  };

  return (
    <div className="px-3">
      <SidebarHeader className="flex items-center justify-center p-2 mb-4 bg-purple-100 rounded-md shadow-sm">
        <button 
          onClick={handleNewChat} 
          className="flex items-center gap-1 text-purple-700"
        >
          <img
            src="/icons/plus.svg"
            alt="New conversation"
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </SidebarHeader>

      <SidebarContent className="p-0 bg-purple-50">
        <div className="space-y-1">
          {displayList.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No conversations yet
            </div>
          ) : (
            displayList.map((conversation) => {
              const label =
                nameMap.get(conversation.id) ??
                conversation.title ??
                "Conversation";
              
              const isActive = activeConversationId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group
                    shadow-sm hover:shadow-md
                    ${
                      isActive
                        ? "bg-neutral-100 shadow-md"
                        : "bg-white hover:bg-gray-50"
                    }
                  `}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <span
                    className={`
                      text-sm font-medium truncate
                      ${isActive ? "text-gray-800" : "text-gray-700"}
                    `}
                    title={conversation.title || label}
                  >
                    {label}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // open modal with the label (Conversation X)
                      openModal(conversation.id, label);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-md"
                  >
                    <img
                      src="/icons/bin.svg"
                      alt="Delete"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </SidebarContent>

      {/* Global modal (reads selectedConvTitle from chatModalStore) */}
      <Modal onDelete={handleDeleteConversation} />
    </div>
  );
}