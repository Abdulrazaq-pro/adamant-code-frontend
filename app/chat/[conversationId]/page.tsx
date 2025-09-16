"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ProjectOverview } from "@/components/project-overview";
import { useChatStore } from "@/store/chatStore";
import { Header } from "@/components/header";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  conversationId: string;
  createdAt: string;
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const conversationId = params.conversationId as string;

  const textareaRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand store
  const {
    conversations,
    fetchConversations,
    fetchMessages,
    addMessage,
    setActiveConversation,
  } = useChatStore();

  // Get current conversation and messages
  const currentConversation = conversations.find(
    (conv) => conv.id === conversationId
  );
  const messages = currentConversation?.messages || [];

  // Load conversations on mount and set active conversation from params
  useEffect(() => {
    fetchConversations();
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [fetchConversations, setActiveConversation, conversationId]);

  // Load messages when conversation ID from params changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Must have a conversation ID from params
    if (!conversationId) {
      toast.error("No conversation ID found");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Add user message using Zustand store
      const userMessageResponse = await addMessage(
        conversationId,
        userMessage,
        true
      );

      // Get AI response directly from addMessage function
      const aiResponse = "This is an AI generated response";
      const aiMessageResponse = await addMessage(
        conversationId,
        aiResponse,
        false
      );

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setIsLoading(false);
    }
  };

  // Check if we have any user messages
  const hasUserMessages = messages.some((msg) => msg.isUser);

  return (
    <div className="flex flex-col justify-center w-full h-dvh stretch">
      {/* <div className="flex flex-col w-full h-dvh  bg-red-300"> */}
      <div className="block md:hidden">
        <Header />
      </div>
      {/* <Header /> */}
      {/* <div className="overflow-y-auto flex-1 py-8 space-y-4 h-full"></div> */}
      {/* Messages Display - Only show when there are user messages */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: hasUserMessages ? "auto" : 0,
          opacity: hasUserMessages ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="overflow-y-auto flex-1 py-8 space-y-4 h-full px-4mx-auto w-full max-w-[90%] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ display: hasUserMessages ? "block" : "none" }}
      >
        <div className="overflow-y-auto flex-1 py-8 space-y-4 "></div>
        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.isUser;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot avatar before bubble */}
                {!isUser && (
                  <img
                    src="/bot.png"
                    alt="Bot"
                    className="w-6 h-6 rounded-full block"
                  />
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    isUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* User avatar after bubble */}
                {isUser && (
                  <img
                    src="/user.png"
                    alt="You"
                    className="w-6 h-6 rounded-full block"
                  />
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input Form - Centered initially, then slides to bottom */}
      <motion.div
        initial={false}
        animate={{
          justifyContent: hasUserMessages ? "flex-end" : "center",
          alignItems: hasUserMessages ? "flex-end" : "center",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`flex flex-col ${hasUserMessages ? "" : "flex-1"}`}
      >
        {messages.length === 0 ? (
          <div className="mx-auto w-full max-w-xl">
            <ProjectOverview />
          </div>
        ) : (
          <div>...</div>
        )}
        <form
          onSubmit={handleSubmit}
          className="px-4 pb-8 mx-auto w-full max-w-xl bg-white dark:bg-black sm:px-0"
        >
          <Textarea
            // selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            handleInputChange={(e) => setInput(e.currentTarget.value)}
            input={input}
            isLoading={isLoading}
            status={isLoading ? "streaming" : "idle"}
            stop={() => setIsLoading(false)}
          />
        </form>
      </motion.div>
    </div>
  );
}
