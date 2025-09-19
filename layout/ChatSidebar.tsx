"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { useChatModalStore } from "@/store/chatModalStore";
import { SidebarContent, SidebarHeader } from "@/components/sidebar";
import Modal from "@/components/Modal";
import Link from "next/link";
import Loader from "@/components/Loader";
import { RiGhostLine } from "react-icons/ri";

export function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-zinc-500">
      <RiGhostLine className="text-5xl mb-4 text-zinc-400" />
      <p className="text-lg font-medium">No conversation yet</p>
      <span className="text-sm text-zinc-400 mt-1">
        Start chatting to see messages appear here.
      </span>
    </div>
  );
}



export default function ChatSidebar() {
  const router = useRouter();

  const {
    conversations,
    fetchConversations,
    conversationLoading,
    deleteConversation,
    createConversation,
    activeConversationId,
    setActiveConversation,
    generalLoading,
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


  // sorted by updatedAt (newest first)
  const { nameMap, displayList } = useMemo(() => {
    const nonDeleted = (conversations || []).filter((c: any) => !c.isDeleted);

    // name map by createdAt ascending (oldest -> newest)
    const sortedByCreated = [...nonDeleted].sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const map = new Map<string, string>();
    sortedByCreated.forEach((conv: any, i) => {
      map.set(conv.id, `Conversation ${i + 1}`);
    });

    // display order by updatedAt descending (newest -> oldest)
    const sortedByUpdated = [...nonDeleted].sort(
      (a: any, b: any) =>
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

  // New chat: navigate to home 
  const handleNewChat = () => {
    router.push("/");
  };

  return (
    <div className="p-3 md:pt-2 pt-10 ">
      <Link  href="/">
        <SidebarHeader className="flex items-center justify-center p-2 mb-4  rounded-md shadow-sm bg-purple-200">
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
      </Link>

      <SidebarContent className="p-0 ">
        <div className="space-y-1">
          {conversationLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <Loader />
            </div> //  show loader while fetching
          ) : displayList.length > 0 ? (
            displayList.map((conversation: any) => {
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
                  ? "bg-neutral-200 shadow-md"
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
                      openModal(conversation.id, label);
                    }}
                    className=" group-hover:opacity-90 p-1 hover:bg-red-50 rounded-md"
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
          ) : <EmptyConversation/>}
        </div>
      </SidebarContent>

      <Modal onDelete={handleDeleteConversation} />
    </div>
  );
}
